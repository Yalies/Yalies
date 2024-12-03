import styles from "./faq.module.scss";
import Navbar from "@/components/Navbar";
import Topbar from "@/components/Topbar";
import { Lexend_Deca } from "next/font/google";

const logoFont = Lexend_Deca({ subsets: ["latin"] });

export default function FAQPage() {
	return (
		<>
			<Topbar>
				<Navbar />
			</Topbar>
			<div id={styles.faq_page} className={logoFont.className}>
				<h1>FAQ</h1>
				<h2>How can I remove my information from Yalies?</h2>
				<p>
					Yalies only uses data that is already publicly available to Yale students—absolutely
					no protected information is revealed. NetIDs, UPIs, and emails come from the <a href="https://directory.yale.edu/">Yale Directory</a>, 
					and everything else comes from the <a href="https://students.yale.edu/facebook/">Yale Face Book</a>.
				</p>
				<h3>Removing information from the Face Book and Yalies</h3>
				<p>
					We&apos;ve made a tool to guide you through the process of swiftly removing your data 
					from the Yale Face Book and Yalies. <a href="https://yalies.io/remove_data">Access the tool here.</a>
				</p>
				<h3>Removing information from the Yale Directory</h3>
				<p>
					Because directory information is generally public record as a matter of FERPA policy,
					Yale does not have an interactive website that allows you to remove it.
					If you would like your information removed, Yale recommends that you contact <a href="mailto:registrar@yale.edu">registrar@yale.edu</a> to 
					request removal. Bear in mind this may prevent you from using some university services.
				</p>
				<h2>How can I add a pronunciation for my name?</h2>
				<p>
					Yalies draws name pronunciations from <a href="name-coach.com">NameCoach</a>, a third-party
					company that Yale uses to provide name pronunciations, plus additional information like phonetic
					spelling and pronouns. You can provide this imformation to Yale by visiting <a href="https://yub.yale.edu/">Yale Hub</a>.
				</p>
				<h2>I can&apos;t log in to Yalies, how do I re-gain access?</h2>
				<p>
					You need to add yourself back to the directory of students at the <a href="https://directory.yale.edu/">Yale Directory</a>.
					You can do so in your <a href="https://yub.yale.edu/">Yale Hub</a> account under the personal data tab, directory listing option.
				</p>
			</div>
		</>
	);
}
