/**
 * @jest-environment node
 */

jest.mock("../app/actions/share", () => ({
	getShareMetadata: jest.fn(),
}))

import { generateMetadata } from "../app/view/[id]/layout"
import { getShareMetadata } from "../app/actions/share"

const mockGetShareMetadata = getShareMetadata as jest.MockedFunction<
	typeof getShareMetadata
>

describe("view page SEO metadata", () => {
	beforeEach(() => {
		mockGetShareMetadata.mockReset()
	})

	it("uses the share title as the document title", async () => {
		mockGetShareMetadata.mockResolvedValue({
			success: true,
			data: {
				id: "abc",
				title: "Clé Wi-Fi du bureau",
				expiresAt: "2026-09-18T00:00:00.000Z",
				maxViews: 1,
				currentViews: 0,
				requirePassword: false,
			},
		})

		const metadata = await generateMetadata({
			params: Promise.resolve({ id: "abc" }),
		})

		expect(metadata.title).toBe("Clé Wi-Fi du bureau")
		expect(metadata.openGraph?.title).toBe("Clé Wi-Fi du bureau")
		expect(metadata.twitter?.title).toBe("Clé Wi-Fi du bureau")
	})

	it("falls back when the share has no title", async () => {
		mockGetShareMetadata.mockResolvedValue({
			success: true,
			data: {
				id: "abc",
				title: "   ",
				expiresAt: "2026-09-18T00:00:00.000Z",
				maxViews: 1,
				currentViews: 0,
				requirePassword: false,
			},
		})

		const metadata = await generateMetadata({
			params: Promise.resolve({ id: "abc" }),
		})

		expect(metadata.title).toBe("Techguys - Partage de secrets")
	})

	it("falls back when the share is missing", async () => {
		mockGetShareMetadata.mockResolvedValue({
			success: false,
			error: "Partage introuvable ou expiré",
		})

		const metadata = await generateMetadata({
			params: Promise.resolve({ id: "missing" }),
		})

		expect(metadata.title).toBe("Techguys - Partage de secrets")
	})
})
