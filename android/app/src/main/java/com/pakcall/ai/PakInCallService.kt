package com.pakcall.ai

import android.content.Context
import android.media.AudioManager
import android.os.Build
import android.telecom.Call
import android.telecom.InCallService
import android.telecom.VideoProfile
import android.util.Log

/**
 * PakInCallService
 * Official Android InCallService implementation.
 * Handles active call state transitions and manages audio routing.
 *
 * NOTE ON REAL CELLULAR AUDIO:
 * As documented in Google's Android telephony specifications, third-party apps
 * cannot directly tap the baseband modem's raw digital audio line.
 * This service manages call answer/hangup and coordinates with AcousticCallBridge.
 */
class PakInCallService : InCallService() {

    private val TAG = "PakInCallService"

    companion object {
        var currentCall: Call? = null
            private set
        var callListener: CallStateListener? = null
    }

    interface CallStateListener {
        fun onCallAdded(phoneNumber: String)
        fun onCallConnected()
        fun onCallDisconnected()
    }

    private val callCallback = object : Call.Callback() {
        override fun onStateChanged(call: Call, state: Int) {
            super.onStateChanged(call, state)
            Log.d(TAG, "Call state changed: $state")

            when (state) {
                Call.STATE_ACTIVE -> {
                    Log.d(TAG, "Call connected and active")
                    callListener?.onCallConnected()
                }
                Call.STATE_DISCONNECTED -> {
                    Log.d(TAG, "Call disconnected")
                    callListener?.onCallDisconnected()
                    AcousticCallBridge.stopBridge()
                    currentCall = null
                }
            }
        }
    }

    override fun onCallAdded(call: Call) {
        super.onCallAdded(call)
        currentCall = call
        call.registerCallback(callCallback)

        val handle = call.details?.handle
        val rawNumber = handle?.schemeSpecificPart ?: "Unknown"
        Log.d(TAG, "New call added: $rawNumber")
        callListener?.onCallAdded(rawNumber)
    }

    override fun onCallRemoved(call: Call) {
        super.onCallRemoved(call)
        call.unregisterCallback(callCallback)
        if (currentCall == call) {
            currentCall = null
        }
        AcousticCallBridge.stopBridge()
        callListener?.onCallDisconnected()
        Log.d(TAG, "Call removed")
    }

    /**
     * Programmatically answer the incoming call
     */
    fun answerCall() {
        currentCall?.let {
            if (it.state == Call.STATE_RINGING) {
                it.answer(VideoProfile.STATE_AUDIO_ONLY)
                Log.d(TAG, "Call answered via InCallService")
            }
        }
    }

    /**
     * Hang up the active call
     */
    fun disconnectCall() {
        currentCall?.let {
            it.disconnect()
            Log.d(TAG, "Call disconnected by user")
        }
    }
}
