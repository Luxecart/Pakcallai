package com.pakcall.ai

import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log

class PakCallScreeningService : CallScreeningService() {

    private val TAG = "PakCallScreening"

    override fun onScreenCall(callDetails: Call.Details) {
        // Only screen incoming calls
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (callDetails.callDirection != Call.Details.DIRECTION_INCOMING) {
                return
            }
        }

        val handle = callDetails.handle
        val rawPhoneNumber = handle?.schemeSpecificPart ?: ""
        Log.d(TAG, "Incoming call detected: $rawPhoneNumber")

        if (rawPhoneNumber.isBlank()) {
            // Private or withheld number: do not automatically block; allow normal ring
            val defaultResponse = CallResponse.Builder()
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(false)
                .build()
            respondToCall(callDetails, defaultResponse)
            return
        }

        // Evaluate number against Pakistani spam patterns & whitelist
        val verdict = SpamDatabase.evaluateNumber(rawPhoneNumber)

        if (verdict.isSpam) {
            Log.w(TAG, "Blocking verified scam caller: $rawPhoneNumber (${verdict.reason})")

            val spamResponse = CallResponse.Builder()
                .setDisallowCall(true)            // Intercept and prevent normal phone ring
                .setRejectCall(true)              // Terminate caller connection
                .setSkipCallLog(false)            // Preserve record for PTA Shortcode 4009 report
                .setSkipNotification(false)       // Alert user that scam was blocked
                .build()

            respondToCall(callDetails, spamResponse)
        } else {
            Log.d(TAG, "Allowing legitimate / unverified caller: $rawPhoneNumber (${verdict.carrier})")

            // Safe & Legitimate callers: Allow phone to ring completely normally
            val allowResponse = CallResponse.Builder()
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(false)
                .build()

            respondToCall(callDetails, allowResponse)
        }
    }
}
