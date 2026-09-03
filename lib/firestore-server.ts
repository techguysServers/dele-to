import { createRequire } from "module"
import type { Firestore, Timestamp } from "@google-cloud/firestore"

type FirestoreModule = typeof import("@google-cloud/firestore")

const require = createRequire(import.meta.url)

let firestoreModule: FirestoreModule | null = null

function getFirestoreModule(): FirestoreModule {
  if (!firestoreModule) {
    firestoreModule = require("@google-cloud/firestore") as FirestoreModule
  }
  return firestoreModule
}

function parseServiceAccountCredentials():
  | { client_email: string; private_key: string }
  | undefined {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) return undefined

  const parsed = JSON.parse(raw) as {
    client_email?: string
    private_key?: string
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key",
    )
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  }
}

export function createFirestoreClient(projectId?: string): Firestore {
  const { Firestore } = getFirestoreModule()
  const credentials = parseServiceAccountCredentials()

  return new Firestore({
    ...(projectId ? { projectId } : {}),
    ...(credentials ? { credentials } : {}),
    ignoreUndefinedProperties: true,
  })
}

export function timestampFromMillis(ms: number): Timestamp {
  const { Timestamp } = getFirestoreModule()
  return Timestamp.fromMillis(ms)
}
