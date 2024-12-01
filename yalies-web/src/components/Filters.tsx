import styles from "./filters.module.scss";
import Dropdown, { DropdownOption } from "./Dropdown";
import { useCallback, useEffect, useState } from "react";

export default function Filters() {
	const [school, setSchool] = useState<string[]>(["Yale College"]);
	const [year, setYear] = useState<string[]>([]);
	const [college, setCollege] = useState<string[]>([]);
	const [major, setMajor] = useState<string[]>([]);

	const [schoolOptions, setSchoolOptions] = useState<DropdownOption[]>([
		{ label: "Yale College", value: "Yale College" },
	]);
	const [yearOptions, setYearOptions] = useState<DropdownOption[]>([]);
	const [collegeOptions, setCollegeOptions] = useState<DropdownOption[]>([]);
	const [majorOptions, setMajorOptions] = useState<DropdownOption[]>([]);

	const getFilters = useCallback(async () => {
		let response;
		try {
			response = await fetch(`${process.env.NEXT_PUBLIC_YALIES_API_URL}/v2/filters`, {
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch(e) {
			console.error(e);
			return;
		}
		if(!response) {
			console.error("No response from server");
			return;
		}
		if(!response.ok) {
			console.error("Error fetching filters", response.status, response.statusText, await response.text());
			return;
		}
		const filters: Record<string, unknown[]> = await response?.json();

		const filterToDropdownOption = (options: unknown[]) => {
			return (options as string[])
				.map((option) => ({ label: option.toString(), value: option.toString() }))
				.sort((a, b) => a.label.localeCompare(b.label));
		};

		setSchoolOptions(filterToDropdownOption(filters["school"]));
		setYearOptions(filterToDropdownOption(filters["year"]));
		setCollegeOptions(filterToDropdownOption(filters["college"]));
		setMajorOptions(filterToDropdownOption(filters["major"]));
	}, []);

	useEffect(() => {
		getFilters();
	}, [getFilters]);

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
				options={schoolOptions}
				value={school}
				onValueChange={setSchool}
			/>
			<Dropdown
				label="Year"
				options={yearOptions}
				value={year}
				onValueChange={setYear}
			/>
			<Dropdown
				label="College"
				options={collegeOptions}
				value={college}
				onValueChange={setCollege}
			/>
			<Dropdown
				label="Major"
				options={majorOptions}
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
