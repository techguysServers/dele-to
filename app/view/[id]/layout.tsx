import type { Metadata } from "next";
import { getShareMetadata } from "@/app/actions/share";

const DEFAULT_TITLE = "Techguys - Partage de secrets";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const result = await getShareMetadata(id);
	const shareTitle = result.success ? result.data?.title?.trim() : "";
	const title = shareTitle || DEFAULT_TITLE;

	return {
		title,
		openGraph: {
			title,
		},
		twitter: {
			title,
		},
	};
}

export default function ViewShareLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
