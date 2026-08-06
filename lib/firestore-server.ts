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

export function createFirestoreClient(projectId?: string): Firestore {
  const { Firestore } = getFirestoreModule()
  const settings = { ignoreUndefinedProperties: true }
  return projectId
    ? new Firestore({ projectId, ...settings })
    : new Firestore(settings)
}

export function timestampFromMillis(ms: number): Timestamp {
  const { Timestamp } = getFirestoreModule()
  return Timestamp.fromMillis(ms)
}
