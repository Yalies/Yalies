import styles from "./filters.module.scss";
import Dropdown from "./Dropdown";
import { useCallback, useMemo, useState } from "react";

const DELETE_ME_OPTIONS = [
	{ label: "Yale College", value: "Yale College" },
	{ label: "Divinity School", value: "Divinity School" },
	{ label: "A", value: "a" },
	{ label: "B", value: "b" },
	{ label: "C", value: "c" },
	{ label: "D", value: "d" },
	{ label: "E", value: "e" },
	{ label: "F", value: "f" },
	{ label: "G", value: "g" },
	{ label: "H", value: "h" },
	{ label: "I", value: "i" },
	{ label: "J", value: "j" },
	{ label: "K", value: "k" },
];

export default function Filters() {
	const [school, setSchool] = useState<string[]>(["Yale College"]);
	const [year, setYear] = useState<string[]>([]);
	const [college, setCollege] = useState<string[]>([]);
	const [major, setMajor] = useState<string[]>([]);

	const reset = useCallback(() => {
		setSchool(["Yale College"]);
		setYear([]);
		setCollege([]);
		setMajor([]);
	}, []);

	const filtersAreDefault = (
		school.length === 1 &&
		school[0] === "Yale College" &&
		year.length === 0 &&
		college.length === 0 &&
		major.length === 0
	);

	return (
		<div id={styles.filters}>
			<Dropdown
				label="School"
				options={DELETE_ME_OPTIONS}
				value={school}
				onValueChange={setSchool}
			/>
			<Dropdown
				label="Year"
				options={DELETE_ME_OPTIONS}
				value={year}
				onValueChange={setYear}
			/>
			<Dropdown
				label="College"
				options={DELETE_ME_OPTIONS}
				value={college}
				onValueChange={setCollege}
			/>
			<Dropdown
				label="Major"
				options={DELETE_ME_OPTIONS}
				value={major}
				onValueChange={setMajor}
			/>
			<button
				className={`${styles.reset} ${filtersAreDefault ? "" : styles.active}`}
				onClick={reset}
			>
				Reset
			</button>
		</div>
	)
};
