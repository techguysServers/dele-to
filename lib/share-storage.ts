import { writeFile, readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import type { Firestore, Timestamp } from "@google-cloud/firestore"
import { createFirestoreClient, timestampFromMillis } from "@/lib/firestore-server"

const DEBUG_ENABLED = process.env.DEBUG_ENABLED || false
const log = DEBUG_ENABLED ? console.log : () => { }
const logError = DEBUG_ENABLED ? console.error : () => { }
const logWarn = DEBUG_ENABLED ? console.warn : () => { }

const STORAGE_DIR = path.join(process.cwd(), ".secure-shares")
const STORAGE_FILE = path.join(STORAGE_DIR, "shares.json")
const COLLECTION_NAME = process.env.FIRESTORE_COLLECTION || "shares"

export interface ShareData {
	id: string
	title: string
	encryptedContent: string
	iv: string
	expiresAt: string
	maxViews: number
	currentViews: number
	requirePassword: boolean
	passwordHash?: string
	createdAt: string
}

interface FileStorage {
	[key: string]: {
		data: ShareData
		expiresAt: number
	}
}

interface FirestoreShareDoc extends ShareData {
	expireAt: Timestamp
}

let firestore: Firestore | null = null
let firestoreInitialized = false
let useFirestore = false

function isCloudRun(): boolean {
	return Boolean(process.env.K_SERVICE)
}

function isServerlessProduction(): boolean {
	return isCloudRun() || process.env.VERCEL === "1"
}

function shouldUseFirestore(): boolean {
	let out = false;
	if (process.env.USE_FILE_STORAGE === "true")
		out = false
	if (process.env.FIRESTORE_EMULATOR_HOST)
		out = true
	if (isServerlessProduction())
		out = true
	if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
		out = true
	if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT)
		out = true

	// Never log secret values (e.g. GOOGLE_SERVICE_ACCOUNT_JSON contains a private key).
	// Only log whether each signal is present.
	log(
		"Should use Firestore:", out,
		"(USE_FILE_STORAGE:", process.env.USE_FILE_STORAGE,
		", FIRESTORE_EMULATOR_HOST:", Boolean(process.env.FIRESTORE_EMULATOR_HOST),
		", GOOGLE_SERVICE_ACCOUNT_JSON:", Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
		", GOOGLE_CLOUD_PROJECT:", process.env.GOOGLE_CLOUD_PROJECT,
		", GCLOUD_PROJECT:", process.env.GCLOUD_PROJECT,
		", isServerlessProduction:", isServerlessProduction(), ")",
	)
	return out
}

export function keyToDocId(key: string): string {
	return key.startsWith("share:") ? key.slice(6) : key
}

async function initFirestore(): Promise<Firestore | null> {
	if (firestoreInitialized) return firestore

	firestoreInitialized = true
	useFirestore = shouldUseFirestore()

	if (!useFirestore) {
		log("📁 Using local file storage (set GOOGLE_CLOUD_PROJECT or run on Cloud Run for Firestore)")
		return null
	}

	try {
		const projectId =
			process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT

		firestore = createFirestoreClient(projectId)
		await firestore.collection(COLLECTION_NAME).limit(1).get()
		log("✅ Firestore initialized successfully")
		return firestore
	} catch (error) {
		logError("❌ Firestore initialization failed:", error)
		firestore = null
		useFirestore = false
		if (isServerlessProduction()) {
			throw new Error("Firestore is required in production but failed to initialize")
		}
		return null
	}
}

async function ensureStorageDir() {
	if (!existsSync(STORAGE_DIR)) {
		await mkdir(STORAGE_DIR, { recursive: true })
		log("📁 Created storage directory:", STORAGE_DIR)
	}
}

async function loadFileStorage(): Promise<FileStorage> {
	try {
		await ensureStorageDir()
		if (existsSync(STORAGE_FILE)) {
			const content = await readFile(STORAGE_FILE, "utf-8")
			const storage = JSON.parse(content) as FileStorage

			const now = Date.now()
			const cleaned: FileStorage = {}
			let removedCount = 0

			for (const [key, value] of Object.entries(storage)) {
				if (value.expiresAt > now) {
					cleaned[key] = value
				} else {
					removedCount++
				}
			}

			if (removedCount > 0) {
				log(`🧹 Cleaned ${removedCount} expired shares from file storage`)
				await saveFileStorage(cleaned)
			}

			return cleaned
		}
	} catch (error) {
		logError("❌ Failed to load file storage:", error)
	}
	return {}
}

async function saveFileStorage(storage: FileStorage): Promise<void> {
	try {
		await ensureStorageDir()
		await writeFile(STORAGE_FILE, JSON.stringify(storage, null, 2))
	} catch (error) {
		logError("❌ Failed to save file storage:", error)
		throw error
	}
}

function isExpired(expiresAtMs: number): boolean {
	return expiresAtMs <= Date.now()
}

async function storeInFirestore(
	key: string,
	data: ShareData,
	expiresAtMs: number,
): Promise<boolean> {
	const db = await initFirestore()
	if (!db) return false

	try {
		const doc: FirestoreShareDoc = {
			...data,
			expireAt: timestampFromMillis(expiresAtMs),
		}
		await db.collection(COLLECTION_NAME).doc(keyToDocId(key)).set(doc)
		return true
	} catch (error) {
		logError("❌ Firestore storage failed:", error)
		return false
	}
}

async function getFromFirestore(key: string): Promise<ShareData | null> {
	const db = await initFirestore()
	if (!db) return null

	try {
		const snapshot = await db.collection(COLLECTION_NAME).doc(keyToDocId(key)).get()
		if (!snapshot.exists) return null

		const doc = snapshot.data() as FirestoreShareDoc
		const expiresAtMs = doc.expireAt.toMillis()

		if (isExpired(expiresAtMs)) {
			await db.collection(COLLECTION_NAME).doc(keyToDocId(key)).delete()
			return null
		}

		const { expireAt: _, ...share } = doc
		return share
	} catch (error) {
		logError("❌ Firestore get failed:", error)
		return null
	}
}

async function deleteFromFirestore(key: string): Promise<void> {
	const db = await initFirestore()
	if (!db) return

	try {
		await db.collection(COLLECTION_NAME).doc(keyToDocId(key)).delete()
	} catch (error) {
		logError("❌ Firestore delete failed:", error)
	}
}

export async function storeData(
	key: string,
	data: ShareData,
	ttlSeconds: number,
): Promise<boolean> {
	log(`📦 Storing data with key: ${key}, ID: ${data.id}, TTL: ${ttlSeconds}s`)

	const expiresAt = Date.now() + ttlSeconds * 1000
	let firestoreStored = false
	let fileStored = false

	firestoreStored = await storeInFirestore(key, data, expiresAt)

	if (!useFirestore && !isServerlessProduction()) {
		try {
			const fileStorage = await loadFileStorage()
			fileStorage[key] = { data, expiresAt }
			await saveFileStorage(fileStorage)
			fileStored = true
		} catch (error) {
			logError("❌ File storage failed:", error)
		}
	}

	return firestoreStored || fileStored
}

export async function getData(key: string): Promise<ShareData | null> {
	log(`🔍 Retrieving data with key: ${key}`)

	if (useFirestore || shouldUseFirestore()) {
		const share = await getFromFirestore(key)
		if (share) return share
		if (useFirestore) return null
	}

	try {
		const fileStorage = await loadFileStorage()
		const stored = fileStorage[key]

		if (stored) {
			if (stored.expiresAt > Date.now()) {
				return stored.data
			} else {
				delete fileStorage[key]
				await saveFileStorage(fileStorage)
			}
		}
	} catch (error) {
		logError("❌ File storage get failed:", error)
	}

	return null
}

export async function deleteData(key: string): Promise<void> {
	log(`🗑️ Deleting data with key: ${key}`)

	await deleteFromFirestore(key)

	if (!useFirestore && !isServerlessProduction()) {
		try {
			const fileStorage = await loadFileStorage()
			if (fileStorage[key]) {
				delete fileStorage[key]
				await saveFileStorage(fileStorage)
			}
		} catch (error) {
			logError("❌ File storage delete failed:", error)
		}
	}
}

export async function updateData(
	key: string,
	data: ShareData,
	ttlSeconds: number,
): Promise<void> {
	log(`🔄 Updating data with key: ${key}`)

	const expiresAt = Date.now() + ttlSeconds * 1000

	await storeInFirestore(key, data, expiresAt)

	if (!useFirestore && !isServerlessProduction()) {
		try {
			const fileStorage = await loadFileStorage()
			fileStorage[key] = { data, expiresAt }
			await saveFileStorage(fileStorage)
		} catch (error) {
			logError("❌ File storage update failed:", error)
		}
	}
}
