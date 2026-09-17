/**
 * @jest-environment node
 */

import { mkdtemp, rm } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { tmpdir } from "os"

describe("never-expiring shares", () => {
  const originalEnv = process.env
  let tempDir: string
  let cwdSpy: jest.SpiedFunction<typeof process.cwd>

  beforeEach(async () => {
    jest.resetModules()
    tempDir = await mkdtemp(path.join(tmpdir(), "share-never-"))
    cwdSpy = jest.spyOn(process, "cwd").mockReturnValue(tempDir)
    process.env = {
      ...originalEnv,
      USE_FILE_STORAGE: "true",
      DEBUG_ENABLED: "false",
      FIRESTORE_EMULATOR_HOST: "",
      GOOGLE_SERVICE_ACCOUNT_JSON: "",
      GOOGLE_CLOUD_PROJECT: "",
      GCLOUD_PROJECT: "",
      K_SERVICE: "",
      VERCEL: "",
    }
  })

  afterEach(async () => {
    cwdSpy.mockRestore()
    process.env = originalEnv
    if (tempDir && existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it("creates and reads a share that never expires", async () => {
    const { createSecureShare, getShareMetadata, getSecureShare } = await import(
      "@/app/actions/share"
    )

    const created = await createSecureShare({
      title: "Forever",
      encryptedContent: "encrypted-payload",
      iv: "iv-value",
      expirationTime: "never",
      maxViews: 5,
      requirePassword: false,
    })

    expect(created.success).toBe(true)
    expect(created.id).toBeTruthy()

    const meta = await getShareMetadata(created.id!)
    expect(meta.success).toBe(true)
    expect(new Date((meta.data as { expiresAt: string }).expiresAt).getUTCFullYear()).toBe(9999)

    const share = await getSecureShare(created.id!)
    expect(share.success).toBe(true)
    expect(new Date((share.data as { expiresAt: string }).expiresAt).getUTCFullYear()).toBe(9999)
  })
})
