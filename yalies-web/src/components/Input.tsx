import styles from "./input.module.scss";

export default function Input({
	placeholder,
	value,
	onChange,
	autofocus,
}: {
	placeholder: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	autofocus?: boolean;
}) {
	return (
		<input
			className={styles.input}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			autoFocus={autofocus}
		/>
	);
};
