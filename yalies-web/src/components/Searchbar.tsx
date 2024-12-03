import Input from "./Input";
import styles from "./searchbar.module.scss";

export default function Searchbar({
	value,
	onChange,
}: {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<div id={styles.search_wrapper}>
			<Input
				placeholder="Search Yalies"
				value={value}
				onChange={onChange}
			/>
		</div>
	)
};
