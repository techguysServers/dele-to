/**
 * @jest-environment node
 */

import { mkdtemp, rm, readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { tmpdir } from "os"

describe("share-storage file fallback", () => {
  const originalEnv = process.env
  let tempDir: string

  beforeEach(async () => {
    jest.resetModules()
    tempDir = await mkdtemp(path.join(tmpdir(), "share-storage-"))
    process.env = {
      ...originalEnv,
      USE_FILE_STORAGE: "true",
      DEBUG_ENABLED: "false",
    }
  })

  afterEach(async () => {
    process.env = originalEnv
    if (tempDir && existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it("stores and retrieves shares using file storage", async () => {
    const cwdSpy = jest.spyOn(process, "cwd").mockReturnValue(tempDir)
    const { storeData, getData, deleteData, keyToDocId } = await import(
      "@/lib/share-storage"
    )

    expect(keyToDocId("share:abc-123")).toBe("abc-123")

    const share = {
      id: "abc-123",
      title: "Test",
      encryptedContent: "encrypted",
      iv: "iv",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      maxViews: 1,
      currentViews: 0,
      requirePassword: false,
      createdAt: new Date().toISOString(),
    }

    const stored = await storeData("share:abc-123", share, 60)
    expect(stored).toBe(true)

    const retrieved = await getData("share:abc-123")
    expect(retrieved).toMatchObject({ id: "abc-123", title: "Test" })

    await deleteData("share:abc-123")
    const afterDelete = await getData("share:abc-123")
    expect(afterDelete).toBeNull()

    const storageFile = path.join(tempDir, ".secure-shares", "shares.json")
    expect(existsSync(storageFile)).toBe(true)
    const content = await readFile(storageFile, "utf-8")
    expect(content).not.toContain("abc-123")

    cwdSpy.mockRestore()
  })
})
