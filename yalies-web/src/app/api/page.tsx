import styles from "./api.module.scss";
import Navbar from "@/components/Navbar";
import Topbar from "@/components/Topbar";
import { Lexend_Deca } from "next/font/google";

const logoFont = Lexend_Deca({ subsets: ["latin"] });

export default function APIPage() {
	return (
		<>
			<Topbar>
				<Navbar />
			</Topbar>
			<div id={styles.api_page} className={logoFont.className}>
				<h1>API</h1>
				<p>The Yalies V2 API is in development.</p>
				<p>
					For now, please use the V1 API.<br />
					<a href="https://yalies.io/apidocs">Documentation</a>
				</p>
			</div>
		</>
	);
}
