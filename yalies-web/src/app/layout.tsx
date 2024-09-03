import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.scss";
import mainStyle from "./main.module.scss";
import Navbar from "@/components/Navbar";

// TODO: og yalies specifies a unicode range, probably wider than latin
const font = Lexend_Deca({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Yalies",
	description: "The Yale search engine! ✨",
};

export default function RootLayout({
	children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={font.className}>
				<div id={mainStyle.content}>
					<Navbar />
					{children}
				</div>
			</body>
		</html>
	);
}
