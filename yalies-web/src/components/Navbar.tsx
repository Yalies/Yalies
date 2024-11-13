import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faUser, faX } from "@fortawesome/free-solid-svg-icons";
import { Lexend_Deca } from "next/font/google";

const logoFont = Lexend_Deca({ subsets: ["latin"] });

export default function Navbar() {
	return (
		<div id={styles.topbar}>
			<nav id={styles.navbar}>
				<Link href="/" id={styles.logo} className={logoFont.className}>
					<Image width={46} height={46} src="/logo.png" alt="Yalies logo" />
					<h2>Yalies</h2>
				</Link>
				<div id={styles.search_wrapper}>
					<input placeholder="Search Yalies" />
					<p>Showing 3200 results<br />Faster than CourseTable</p>
				</div>
				<div id={styles.links}>
					<Link href="/about">About</Link>
					<Link href="/api">API</Link>
					<Link href="/faq">FAQ</Link>
					<button id={styles.profile_button}>
						<FontAwesomeIcon icon={faUser} />
					</button>
				</div>
			</nav>
			<div id={styles.filters}>
				<button className={styles.active}>
					Yale College
					<FontAwesomeIcon icon={faX} />
				</button>
				<button>
					Year
					<FontAwesomeIcon icon={faCaretUp} />
				</button>
				<button>
					College
					<FontAwesomeIcon icon={faCaretUp} />
				</button>
				<button>
					Major
					<FontAwesomeIcon icon={faCaretUp} />
				</button>
				<button className={styles.reset}>Reset</button>
			</div>
		</div>
	);
}

