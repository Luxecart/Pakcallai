package com.pakcall.ai

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.media.audiofx.AcousticEchoCanceler
import android.media.audiofx.NoiseSuppressor
import android.os.Build
import android.util.Base64
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject

/**
 * AcousticCallBridge
 *
 * Implements the official, free on-device acoustic bridge for cellular calls on standard Android devices:
 *
 * TECHNICAL REALITY:
 * Android OS strictly denies third-party apps raw digital access to the baseband modem stream
 * (AudioSource.VOICE_CALL and VOICE_DOWNLINK require platform signature permissions).
 *
 * THE SUPPORTED FREE SOLUTION:
 * 1. Enables hardware speakerphone in in-call mode (AudioManager.MODE_IN_CALL, isSpeakerphoneOn = true).
 * 2. Uses AudioRecord with MediaRecorder.AudioSource.VOICE_COMMUNICATION (allowed with RECORD_AUDIO).
 * 3. Engages Android hardware AcousticEchoCanceler (AEC) and NoiseSuppressor to prevent audio feedback loop.
 * 4. Streams 16kHz PCM audio packets over secure WebSocket to PakCall AI backend (Gemini Live / Gemini API).
 * 5. Plays back generated AI Urdu/Punjabi audio responses through AudioTrack back into the phone's speaker.
 */
object AcousticCallBridge {

    private const val TAG = "AcousticCallBridge"
    private const val SAMPLE_RATE_RECORD = 16000
    private const val SAMPLE_RATE_PLAYBACK = 24000

    private var audioRecord: AudioRecord? = null
    private var audioTrack: AudioTrack? = null
    private var audioManager: AudioManager? = null
    private var echoCanceler: AcousticEchoCanceler? = null
    private var noiseSuppressor: NoiseSuppressor? = null
    private var webSocket: WebSocket? = null
    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private var recordingJob: Job? = null

    var isBridging = false
        private set

    var bridgeStatusListener: ((String) -> Unit)? = null

    fun startBridge(context: Context, wsUrl: String, assistantName: String = "Aiman", language: String = "urdu") {
        if (isBridging) {
            Log.w(TAG, "Bridge is already running")
            return
        }
        isBridging = true
        bridgeStatusListener?.invoke("INITIALIZING")

        Log.i(TAG, "Starting Acoustic Call Bridge for live AI phone assistance (Lang: $language, Name: $assistantName)")

        try {
            audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
            audioManager?.let { am ->
                am.mode = AudioManager.MODE_IN_CALL
                am.isSpeakerphoneOn = true
            }

            // Initialize AudioTrack for playing AI speech back into call
            val minPlayBuf = AudioTrack.getMinBufferSize(
                SAMPLE_RATE_PLAYBACK,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()

            val audioFormat = AudioFormat.Builder()
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setSampleRate(SAMPLE_RATE_PLAYBACK)
                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                .build()

            audioTrack = AudioTrack.Builder()
                .setAudioAttributes(audioAttributes)
                .setAudioFormat(audioFormat)
                .setBufferSizeInBytes(minPlayBuf * 2)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()

            audioTrack?.play()

            // Connect WebSocket to PakCall AI backend
            connectWebSocket(wsUrl, assistantName, language)

            // Start capturing audio from microphone in in-call communication mode with AEC
            startAudioRecording()

            bridgeStatusListener?.invoke("ACTIVE")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start AcousticCallBridge", e)
            bridgeStatusListener?.invoke("ERROR: ${e.message}")
            stopBridge()
        }
    }

    private fun connectWebSocket(wsUrl: String, assistantName: String, language: String) {
        val client = OkHttpClient()
        val request = Request.Builder().url(wsUrl).build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                Log.d(TAG, "Connected to PakCall AI Live WebSocket")
                bridgeStatusListener?.invoke("WEBSOCKET_CONNECTED")
                val startMsg = JSONObject().apply {
                    put("type", "start")
                    put("language", language)
                    put("assistantName", assistantName)
                    put("persona", "polite_urdu")
                }
                ws.send(startMsg.toString())
            }

            override fun onMessage(ws: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    val type = json.optString("type")

                    if (type == "audio_chunk") {
                        val base64Data = json.optString("data")
                        if (base64Data.isNotEmpty()) {
                            val pcmBytes = Base64.decode(base64Data, Base64.DEFAULT)
                            audioTrack?.write(pcmBytes, 0, pcmBytes.size)
                        }
                    } else if (type == "interrupted") {
                        audioTrack?.flush()
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Error processing incoming audio chunk", e)
                }
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failure in AcousticCallBridge", t)
                bridgeStatusListener?.invoke("WEBSOCKET_ERROR")
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closed: $reason")
                bridgeStatusListener?.invoke("WEBSOCKET_CLOSED")
            }
        })
    }

    private fun startAudioRecording() {
        val minBufSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE_RECORD,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                SAMPLE_RATE_RECORD,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                minBufSize * 2
            )

            // Engage hardware Acoustic Echo Canceler and Noise Suppressor if supported by device
            audioRecord?.audioSessionId?.let { sessionId ->
                if (AcousticEchoCanceler.isAvailable()) {
                    try {
                        echoCanceler = AcousticEchoCanceler.create(sessionId)
                        echoCanceler?.enabled = true
                        Log.d(TAG, "Hardware AcousticEchoCanceler enabled")
                    } catch (e: Exception) {
                        Log.w(TAG, "Could not initialize AcousticEchoCanceler", e)
                    }
                }
                if (NoiseSuppressor.isAvailable()) {
                    try {
                        noiseSuppressor = NoiseSuppressor.create(sessionId)
                        noiseSuppressor?.enabled = true
                        Log.d(TAG, "Hardware NoiseSuppressor enabled")
                    } catch (e: Exception) {
                        Log.w(TAG, "Could not initialize NoiseSuppressor", e)
                    }
                }
            }

            audioRecord?.startRecording()

            recordingJob = scope.launch {
                val buffer = ByteArray(minBufSize)
                while (isActive && isBridging) {
                    val readBytes = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (readBytes > 0 && webSocket != null) {
                        val base64 = Base64.encodeToString(buffer, 0, readBytes, Base64.NO_WRAP)
                        val msg = JSONObject().apply {
                            put("type", "audio_input")
                            put("audio", base64)
                        }
                        webSocket?.send(msg.toString())
                    }
                }
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Audio recording permission missing", e)
            bridgeStatusListener?.invoke("PERMISSION_DENIED")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting AudioRecord", e)
            bridgeStatusListener?.invoke("AUDIO_RECORD_ERROR")
        }
    }

    fun stopBridge() {
        if (!isBridging) return
        isBridging = false

        recordingJob?.cancel()
        recordingJob = null

        try {
            echoCanceler?.release()
            echoCanceler = null
        } catch (e: Exception) {}

        try {
            noiseSuppressor?.release()
            noiseSuppressor = null
        } catch (e: Exception) {}

        try {
            audioRecord?.stop()
            audioRecord?.release()
        } catch (e: Exception) {}
        audioRecord = null

        try {
            audioTrack?.stop()
            audioTrack?.release()
        } catch (e: Exception) {}
        audioTrack = null

        audioManager?.let { am ->
            am.isSpeakerphoneOn = false
            am.mode = AudioManager.MODE_NORMAL
        }

        webSocket?.close(1000, "Call ended")
        webSocket = null

        bridgeStatusListener?.invoke("STOPPED")
        Log.i(TAG, "Acoustic Call Bridge stopped cleanly")
    }
}
