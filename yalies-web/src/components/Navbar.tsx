import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Lexend_Deca } from "next/font/google";

const logoFont = Lexend_Deca({ subsets: ["latin"] });

export default function Navbar({ middleContent }: { middleContent: React.ReactNode }) {
	return (
		<nav id={styles.navbar}>
			<Link href="/" id={styles.logo} className={logoFont.className}>
				<Image width={46} height={46} src="/logo.png" alt="Yalies logo" />
				<h2>Yalies</h2>
			</Link>
			{ middleContent }
			<div id={styles.links}>
				<Link href="/about">About</Link>
				<Link href="/api">API</Link>
				<Link href="/faq">FAQ</Link>
				<button id={styles.profile_button}>
					<FontAwesomeIcon icon={faUser} />
				</button>
			</div>
		</nav>
	);
}
