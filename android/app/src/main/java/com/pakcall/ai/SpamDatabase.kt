package com.pakcall.ai

data class SpamVerdict(
    val isSpam: Boolean,
    val category: String? = null,
    val reason: String? = null,
    val carrier: String = "Pakistan Mobile"
)

object SpamDatabase {

    // Known high-risk scam numbers identified by PTA and community reports
    private val verifiedBlacklist = hashSetOf(
        "+923458899123", // BISP 8171 Fake Prize Scam
        "+923129900112", // Aggressive Unsolicited Telemarketing Robocall
        "+923001122334", // Cold Call Land Scam
        "+923210001928", // Bank Alfalah / HBL OTP Impersonation
        "+923339998877"  // Fake Customs / Cargo Clearance Fraud
    )

    // User-configured VIP numbers that must NEVER be screened or blocked
    private val userVipWhitelist = hashSetOf(
        "+923027788990", // Mother (Ammi Jan)
        "+923219876543"  // Business Partner (Ali Raza)
    )

    // Detect Pakistani telecom carrier by phone prefix
    fun detectCarrier(rawPhone: String): String {
        val cleaned = normalizeNumber(rawPhone)
        val prefix = if (cleaned.startsWith("0")) cleaned.substring(0, 4) else if (cleaned.startsWith("+92")) "0" + cleaned.substring(3, 6) else ""
        return when {
            prefix.startsWith("030") || prefix.startsWith("032") -> "Jazz (Mobilink)"
            prefix.startsWith("031") -> "Zong 4G"
            prefix.startsWith("033") -> "Ufone 4G"
            prefix.startsWith("034") -> "Telenor Pakistan"
            cleaned.startsWith("+9251") || cleaned.startsWith("051") -> "PTCL (Islamabad)"
            cleaned.startsWith("+9242") || cleaned.startsWith("042") -> "PTCL (Lahore)"
            cleaned.startsWith("+9221") || cleaned.startsWith("021") -> "PTCL (Karachi)"
            else -> "Pakistan Telecom"
        }
    }

    // Standardize phone number format for exact matching
    fun normalizeNumber(rawPhone: String): String {
        val digitsOnly = rawPhone.replace(Regex("[^0-9+]"), "")
        return when {
            digitsOnly.startsWith("03") -> "+92" + digitsOnly.substring(1)
            digitsOnly.startsWith("92") -> "+" + digitsOnly
            digitsOnly.startsWith("+92") -> digitsOnly
            else -> digitsOnly
        }
    }

    // Evaluate incoming caller against whitelist and blacklist
    fun evaluateNumber(rawPhone: String): SpamVerdict {
        val normalized = normalizeNumber(rawPhone)
        val carrier = detectCarrier(normalized)

        // 1. VIP Whitelist Check: NEVER block legitimate contacts
        if (userVipWhitelist.contains(normalized)) {
            return SpamVerdict(
                isSpam = false,
                reason = "Whitelisted Contact / VIP Bypass",
                carrier = carrier
            )
        }

        // 2. PTA Verified Blacklist Check
        if (verifiedBlacklist.contains(normalized)) {
            return SpamVerdict(
                isSpam = true,
                category = "PTA_FLAGGED_SCAM",
                reason = "Verified lottery/banking fraud number in PTA registry",
                carrier = carrier
            )
        }

        // 3. Unknown Numbers: Allowed by default so real callers are not blocked
        return SpamVerdict(
            isSpam = false,
            reason = "Unknown caller - Allow and screen via PakCall AI guidelines",
            carrier = carrier
        )
    }

    // Add number to local blacklist
    fun addToBlacklist(phoneNumber: String) {
        verifiedBlacklist.add(normalizeNumber(phoneNumber))
    }

    // Add number to VIP whitelist
    fun addToWhitelist(phoneNumber: String) {
        userVipWhitelist.add(normalizeNumber(phoneNumber))
    }
}
