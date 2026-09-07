"use server"

import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "crypto"
import {
  storeData,
  getData,
  updateData,
  deleteData,
  type ShareData,
} from "@/lib/share-storage"

// Logging utility
const DEBUG_ENABLED = process.env.DEBUG_ENABLED || false
const log = DEBUG_ENABLED ? console.log : () => {}
const logError = DEBUG_ENABLED ? console.error : () => {}
const logWarn = DEBUG_ENABLED ? console.warn : () => {}

// Password hashing using scrypt (memory-hard KDF) with a per-record random salt.
// Stored format is self-contained: scrypt$N$saltHex$hashHex
const SCRYPT_COST = 16384 // N
const SCRYPT_KEYLEN = 64

function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST })
  return `scrypt$${SCRYPT_COST}$${salt.toString("hex")}$${derived.toString("hex")}`
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split("$")
    if (parts.length !== 4 || parts[0] !== "scrypt") return false

    const cost = parseInt(parts[1], 10)
    const salt = Buffer.from(parts[2], "hex")
    const expected = Buffer.from(parts[3], "hex")

    if (!Number.isFinite(cost) || salt.length === 0 || expected.length === 0) {
      return false
    }

    const derived = scryptSync(password, salt, expected.length, { N: cost })
    // Both buffers are the same length here, so timingSafeEqual is safe to use.
    return timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

function generateShareId(linkType: string = "standard"): string {
  if (linkType === "shorter") {
    // Generate a shorter, URL-safe ID (8 characters)
    return randomBytes(6).toString('base64url')
  } else {
    // Use standard UUID for maximum security
    return randomUUID()
  }
}

function getExpirationTime(timeString: string): Date {
  const now = new Date()
  switch (timeString) {
    case "15m":
      return new Date(now.getTime() + 15 * 60 * 1000)
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000)
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 60 * 60 * 1000)
  }
}

export async function createSecureShare(data: {
  title: string
  encryptedContent: string
  iv: string
  expirationTime: string
  maxViews: number
  requirePassword: boolean
  password?: string
  linkType?: string
}) {
  log("🚀 Creating secure share with data:", {
    title: data.title,
    hasContent: !!data.encryptedContent,
    hasIv: !!data.iv,
    expirationTime: data.expirationTime,
    maxViews: data.maxViews,
    requirePassword: data.requirePassword,
    linkType: data.linkType || "standard",
  })

  try {
    // Validate input data
    if (!data.encryptedContent || !data.iv) {
      logError("❌ Missing encrypted content or IV")
      return { success: false, error: "Contenu chiffré ou IV manquant" }
    }

    if (data.maxViews < 1 || data.maxViews > 100) {
      logError("❌ Invalid max views count:", data.maxViews)
      return { success: false, error: "Nombre de vues invalide" }
    }

    const id = generateShareId(data.linkType || "standard")
    const expiresAt = getExpirationTime(data.expirationTime)
    const now = new Date()

    log(`🆔 Generated ${data.linkType || "standard"} ID: ${id}`)
    log(`⏰ Expiration time: ${expiresAt.toISOString()}`)

    // Ensure expiration is in the future
    if (expiresAt <= now) {
      logError("❌ Invalid expiration time - in the past")
      return { success: false, error: "Durée d'expiration invalide" }
    }

    const share: ShareData = {
      id,
      title: data.title || "",
      encryptedContent: data.encryptedContent,
      iv: data.iv,
      expiresAt: expiresAt.toISOString(),
      maxViews: data.maxViews,
      currentViews: 0,
      requirePassword: data.requirePassword,
      passwordHash: data.requirePassword && data.password ? hashPassword(data.password) : undefined,
      createdAt: now.toISOString(),
    }

    // Calculate TTL in seconds
    const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    log(`⏱️ Calculated TTL: ${ttlSeconds} seconds`)

    if (ttlSeconds <= 0) {
      logError("❌ Invalid TTL calculation:", ttlSeconds)
      return { success: false, error: "Calcul de durée invalide" }
    }

    const key = `share:${id}`
    log(`🔑 Using storage key: ${key}`)

    const stored = await storeData(key, share, ttlSeconds)

    if (!stored) {
      logError("❌ Failed to store data in any storage system")
      return { success: false, error: "Impossible d'enregistrer le partage sécurisé" }
    }

    // Immediate verification - try to retrieve what we just stored
    log(`🔍 Verifying storage by retrieving key: ${key}`)
    const verification = await getData(key)
    if (verification && verification.id === id) {
      log(`✅ Storage verification successful for ID: ${id}`)
    } else {
      logError(`❌ Storage verification failed for ID: ${id}`)
      logError(`❌ Expected ID: ${id}, Got:`, verification?.id || "null")

      // Still return success since we stored it, but log the verification issue
      logWarn(`⚠️ Continuing despite verification failure - data may still be accessible`)
    }

    log(`🎉 Successfully created secure share with ID: ${id}`)
    return { success: true, id }
  } catch (error) {
    logError("❌ Error creating secure share:", error)
    return { success: false, error: "Impossible de créer le partage sécurisé" }
  }
}

export async function getSecureShare(id: string, password?: string) {
  log(`🔍 Getting secure share with ID: ${id}`)

  try {
    if (!id || typeof id !== "string") {
      logError("❌ Invalid share ID:", id)
      return { success: false, error: "Identifiant de partage invalide" }
    }

    const key = `share:${id}`
    log(`🔑 Looking for storage key: ${key}`)

    const share = await getData(key)

    if (!share) {
      logError(`❌ Share not found for ID: ${id}`)
      return { success: false, error: "Partage introuvable ou expiré" }
    }

    log(`✅ Found share: ${share.id}, views: ${share.currentViews}/${share.maxViews}`)

    // Check if max views reached
    if (share.currentViews >= share.maxViews) {
      log("⚠️ Max views reached, deleting share")
      await deleteData(key)
      return { success: false, error: "Ce partage a atteint sa limite de vues" }
    }

    // Check password if required
    if (share.requirePassword) {
      if (!password) {
        log("🔒 Password required but not provided")
        return { success: false, error: "Mot de passe requis" }
      }
      if (!share.passwordHash || !verifyPassword(password, share.passwordHash)) {
        log("❌ Incorrect password provided")
        return { success: false, error: "Mot de passe incorrect" }
      }
    }

    // Increment view count
    share.currentViews++
    log(`📈 Incremented view count to: ${share.currentViews}`)

    // If this was the last allowed view, delete the share
    if (share.currentViews >= share.maxViews) {
      log("🗑️ Last view reached, deleting share")
      await deleteData(key)
    } else {
      // Update the share with new view count
      const expiresAt = new Date(share.expiresAt)
      const now = new Date()
      const remainingTtl = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)

      if (remainingTtl > 0) {
        await updateData(key, share, remainingTtl)
      }
    }

    // Return encrypted data - decryption happens client-side
    return {
      success: true,
      data: {
        id: share.id,
        title: share.title,
        encryptedContent: share.encryptedContent,
        iv: share.iv,
        expiresAt: share.expiresAt,
        maxViews: share.maxViews,
        currentViews: share.currentViews,
        requirePassword: share.requirePassword,
      },
    }
  } catch (error) {
    logError("❌ Error getting secure share:", error)
    return { success: false, error: "Impossible de récupérer le partage sécurisé" }
  }
}

export async function getShareMetadata(id: string) {
  log(`📋 Getting metadata for share ID: ${id}`)

  try {
    if (!id || typeof id !== "string") {
      logError("❌ Invalid share ID for metadata:", id)
      return { success: false, error: "Identifiant de partage invalide" }
    }

    const key = `share:${id}`
    log(`🔑 Looking for metadata with storage key: ${key}`)

    const share = await getData(key)

    if (!share) {
      logError(`❌ Share metadata not found for ID: ${id}`)
      return { success: false, error: "Partage introuvable ou expiré" }
    }

    log(`✅ Found metadata for share: ${share.id}`)

    // Return only metadata (no encrypted content)
    return {
      success: true,
      data: {
        id: share.id,
        title: share.title,
        expiresAt: share.expiresAt,
        maxViews: share.maxViews,
        currentViews: share.currentViews,
        requirePassword: share.requirePassword,
      },
    }
  } catch (error) {
    logError("❌ Error getting share metadata:", error)
    return { success: false, error: "Impossible de récupérer les métadonnées du partage" }
  }
}
