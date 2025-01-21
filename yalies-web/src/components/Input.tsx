import styles from "./input.module.scss";

export default function Input({
	placeholder,
	value,
	onChange,
	autofocus,
	onSubmit,
}: {
	placeholder: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	autofocus?: boolean;
	onSubmit: () => void;
}) {
	const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if(e.key === "Enter") onSubmit();
	};

	return (
		<input
			className={styles.input}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			autoFocus={autofocus}
			onKeyUp={onKeyUp}
		/>
	);
};
