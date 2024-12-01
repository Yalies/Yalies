import styles from "./filters.module.scss";
import Dropdown, { DropdownOption } from "./Dropdown";
import { useCallback, useEffect, useState } from "react";

export default function Filters({
	filters,
	setFilterValue,
	reset,
	filtersAreDefault,
}: {
	filters: Record<string, string[]>;
	setFilterValue: (key: string, newValue: string[]) => void;
	reset: () => void;
	filtersAreDefault: boolean;
}) {
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
		const filterOptions: Record<string, unknown[]> = await response?.json();

		const filterToDropdownOption = (options: unknown[]) => {
			return (options as string[])
				.map((option) => ({ label: option.toString(), value: option.toString() }))
				.sort((a, b) => a.label.localeCompare(b.label));
		};

		setSchoolOptions(filterToDropdownOption(filterOptions["school"]));
		setYearOptions(filterToDropdownOption(filterOptions["year"]));
		setCollegeOptions(filterToDropdownOption(filterOptions["college"]));
		setMajorOptions(filterToDropdownOption(filterOptions["major"]));
	}, []);

	useEffect(() => {
		getFilters();
	}, [getFilters]);

	return (
		<div id={styles.filters}>
			<Dropdown
				label="School"
				options={schoolOptions}
				value={filters?.school || []}
				onValueChange={(val) => setFilterValue("school", val)}
			/>
			<Dropdown
				label="Year"
				options={yearOptions}
				value={filters?.year || []}
				onValueChange={(val) => setFilterValue("year", val)}
			/>
			<Dropdown
				label="College"
				options={collegeOptions}
				value={filters?.college || []}
				onValueChange={(val) => setFilterValue("college", val)}
			/>
			<Dropdown
				label="Major"
				options={majorOptions}
				value={filters?.major || []}
				onValueChange={(val) => setFilterValue("major", val)}
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
