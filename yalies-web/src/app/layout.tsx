import type { Metadata } from "next";
import "./globals.scss";
import mainStyle from "./main.module.scss";


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
			<body>
				<div id={mainStyle.content}>
					{children}
				</div>
			</body>
		</html>
	);
}
