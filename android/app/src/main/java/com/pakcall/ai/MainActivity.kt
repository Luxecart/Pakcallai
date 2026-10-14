package com.pakcall.ai

import android.Manifest
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val TAG = "PakCallMainActivity"
    private lateinit var webView: WebView
    private val PERMISSION_REQUEST_CODE = 1001

    // Required Android permissions for PakCall AI Companion
    private val requiredPermissions = arrayOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.ANSWER_PHONE_CALLS
    )

    // Role request launcher for Android 10+ Call Screening Role
    private val callScreeningRoleLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            Toast.makeText(this, "PakCall AI active as default Call Screening app", Toast.LENGTH_LONG).show()
        } else {
            Toast.makeText(this, "Call screening role not granted. Enable in Settings > Apps > Default Apps", Toast.LENGTH_LONG).show()
        }
    }

    // Role request launcher for Android 10+ Default Phone Dialer Role (for InCallService answering)
    private val dialerRoleLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            Toast.makeText(this, "PakCall AI active as Default Phone App for in-call assistant", Toast.LENGTH_LONG).show()
        } else {
            Toast.makeText(this, "Default phone app role not granted", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize WebView programmatically
        webView = WebView(this)
        setContentView(webView)

        setupWebView()
        checkAndRequestPermissions()
        requestCallScreeningRole()

        // Handle Android hardware/gesture back navigation
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Load PakCall AI Web App
        val appUrl = "https://ais-pre-qhtygev4qltcbjxh6h3j74-697317214701.asia-northeast1.run.app"
        webView.loadUrl(appUrl)
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // WebView Security Hardening: Block sensitive local file access
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.setGeolocationEnabled(false)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return false
                val scheme = uri.scheme ?: return false

                // Safely delegate tel, sms, and mailto links to Android native intents
                if (scheme == "tel" || scheme == "sms" || scheme == "mailto") {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, uri)
                        startActivity(intent)
                    } catch (e: Exception) {
                        Log.w(TAG, "Cannot launch external intent for: $uri", e)
                    }
                    return true
                }
                return false
            }

            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                Log.w(TAG, "WebView error ($errorCode): $description on $failingUrl")
            }
        }

        // Handle Web Audio microphone permission inside WebView safely
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread {
                    request?.let {
                        val resources = it.resources
                        val granted = mutableListOf<String>()
                        for (r in resources) {
                            if (r == PermissionRequest.RESOURCE_AUDIO_CAPTURE) {
                                if (ContextCompat.checkSelfPermission(
                                        this@MainActivity,
                                        Manifest.permission.RECORD_AUDIO
                                    ) == PackageManager.PERMISSION_GRANTED
                                ) {
                                    granted.add(r)
                                }
                            }
                        }
                        if (granted.isNotEmpty()) {
                            it.grant(granted.toTypedArray())
                            Log.d(TAG, "Audio capture permission granted to WebView")
                        } else {
                            it.deny()
                            Log.w(TAG, "Audio capture permission denied: Missing Android RECORD_AUDIO permission")
                        }
                    }
                }
            }
        }

        // Bridge for React frontend to communicate with Android native companion
        webView.addJavascriptInterface(PakCallAndroidBridge(), "PakCallNative")
    }

    inner class PakCallAndroidBridge {
        @JavascriptInterface
        fun isNativeAvailable(): Boolean = true

        @JavascriptInterface
        fun getAndroidVersion(): Int = Build.VERSION.SDK_INT

        @JavascriptInterface
        fun requestScreeningRole() {
            runOnUiThread { requestCallScreeningRole() }
        }

        @JavascriptInterface
        fun requestDialerRole() {
            runOnUiThread { requestDefaultDialerRole() }
        }

        @JavascriptInterface
        fun startAcousticBridge(wsUrl: String, assistantName: String, language: String) {
            runOnUiThread {
                AcousticCallBridge.startBridge(this@MainActivity, wsUrl, assistantName, language)
            }
        }

        @JavascriptInterface
        fun stopAcousticBridge() {
            runOnUiThread {
                AcousticCallBridge.stopBridge()
            }
        }

        @JavascriptInterface
        fun isBridgeActive(): Boolean = AcousticCallBridge.isBridging
    }

    private fun checkAndRequestPermissions() {
        val missingPermissions = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions.toTypedArray(),
                PERMISSION_REQUEST_CODE
            )
        }
    }

    // Request Android Call Screening Role (Android 10+)
    private fun requestCallScreeningRole() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(Context.ROLE_SERVICE) as? RoleManager
            if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
                if (!roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                    val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
                    callScreeningRoleLauncher.launch(intent)
                }
            }
        }
    }

    // Request Android Default Dialer Role (Android 10+)
    private fun requestDefaultDialerRole() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(Context.ROLE_SERVICE) as? RoleManager
            if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_DIALER)) {
                if (!roleManager.isRoleHeld(RoleManager.ROLE_DIALER)) {
                    val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER)
                    dialerRoleLauncher.launch(intent)
                }
            }
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            val allGranted = grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (allGranted) {
                Toast.makeText(this, "PakCall AI permissions granted", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
