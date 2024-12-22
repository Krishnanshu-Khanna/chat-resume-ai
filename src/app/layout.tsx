import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		template: "%s - CV Genie",
		absolute: "CV Genie",
	},
	description:
		"CV Genie, an AI-powered resume builder, simplifies the process of crafting a professional resume designed to help you secure your dream job.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
