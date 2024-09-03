import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.scss";
import Button from "./Button";

export default function Navbar() {
	return (
		<header id={styles.navbar}>
			<Link href="/" id={styles.logo}>
				<Image width={46} height={46} src="/logo.png" alt="Yalies logo" />
				<h2>Yalies</h2>
			</Link>
			<nav id={styles.links}>
				<Link href="/"><Button>Home</Button></Link>
				<Link href="/about"><Button>About</Button></Link>
				<Link href="/faq"><Button>FAQ</Button></Link>
				<Link href="/api"><Button>API</Button></Link>
				<Button>Log out</Button>
			</nav>
		</header>
	);
}
