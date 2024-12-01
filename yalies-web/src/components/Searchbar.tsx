import Input from "./Input";
import styles from "./searchbar.module.scss";

export default function Searchbar() {
	return (
		<div id={styles.search_wrapper}>
			<Input placeholder="Search Yalies" />
		</div>
	)
};