import styles from "./filters.module.scss";
import Dropdown, { DropdownOption } from "./Dropdown";
import { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faCaretUp } from "@fortawesome/free-solid-svg-icons";

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
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const datePickerRef = React.useRef<HTMLDivElement>(null);

	const handleDateChange = (date: Date | null) => {
		if (date) {
			const month = (date.getMonth() + 1);
			const day = date.getDate();
			
			// Update month and day separately
			setFilterValue("birth_month", [month.toString()]);
			setFilterValue("birth_day", [day.toString()]);
		} else {
			// Clear both filters
			setFilterValue("birth_month", []);
			setFilterValue("birth_day", []);
		}
		setSelectedDate(date);
		setIsCalendarOpen(false);
	};

	// Update selectedDate when filters change
	useEffect(() => {
		if (filters.birth_month?.length && filters.birth_day?.length) {
			const month = parseInt(filters.birth_month[0]) - 1; // Convert to 0-based month for Date object
			const day = parseInt(filters.birth_day[0]);
			const date = new Date(2000, month, day);
			setSelectedDate(date);
		} else {
			setSelectedDate(null);
		}
	}, [filters.birth_month, filters.birth_day]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
				setIsCalendarOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const formatSelectedDate = (date: Date | null) => {
		if (!date) return "Birthday";
		const month = date.toLocaleString('default', { month: 'long' });
		const day = date.getDate();
		return `${month} ${day}`;
	};

	const renderCustomHeader = ({
		date,
		changeMonth,
		decreaseMonth,
		increaseMonth,
		prevMonthButtonDisabled,
		nextMonthButtonDisabled,
	}: {
		date: Date;
		changeMonth: (month: number) => void;
		decreaseMonth: () => void;
		increaseMonth: () => void;
		prevMonthButtonDisabled: boolean;
		nextMonthButtonDisabled: boolean;
	}) => (
		<div className={styles.calendarHeader}>
			<button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
				{"<"}
			</button>
			<select
				value={date.getMonth()}
				onChange={({ target: { value } }) => changeMonth(parseInt(value))}
			>
				{Array.from({ length: 12 }, (_, i) => (
					<option key={i} value={i}>
						{new Date(2000, i).toLocaleString('default', { month: 'long' })}
					</option>
				))}
			</select>
			<button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
				{">"}
			</button>
		</div>
	);

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

		const filterToDropdownOption = (options: unknown[], sort?: (a: DropdownOption, b: DropdownOption) => number): DropdownOption[] => {
			return (options as string[])
				.map((option) => ({ label: option.toString(), value: option.toString() }))
				.sort(sort || ((a, b) => a.label.localeCompare(b.label)));
		};

		const schoolSortFn = (a: DropdownOption, b: DropdownOption) => {
			if(a.label === "Yale College") return -1;
			if(b.label === "Yale College") return 1;
			return a.label.localeCompare(b.label);
		};
		const yearSortFn = (a: DropdownOption, b: DropdownOption) => {
			const stringA = a.label.toString();
			const stringB = b.label.toString();
			return -1 * stringA.localeCompare(stringB);
		}

		setSchoolOptions(filterToDropdownOption(filterOptions["school"], schoolSortFn));
		setYearOptions(filterToDropdownOption(filterOptions["year"], yearSortFn));
		setCollegeOptions(filterToDropdownOption(filterOptions["college"]));
		setMajorOptions(filterToDropdownOption(filterOptions["major"]));
	}, []);

	useEffect(() => {
		getFilters();
	}, [getFilters]);

	return (
		<div className={styles.filters}>
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
			<div className={styles.dropdown_container} ref={datePickerRef}>
				<button
					className={`${styles.dropdown_button} ${selectedDate ? styles.selected : ""} ${isCalendarOpen ? styles.active : ""}`}
					onClick={() => setIsCalendarOpen(!isCalendarOpen)}
				>
					{formatSelectedDate(selectedDate)}
					<FontAwesomeIcon
						icon={selectedDate ? faX : faCaretUp}
						onClick={(e) => {
							e.stopPropagation();
							if (selectedDate) {
								handleDateChange(null);
							}
						}}
					/>
				</button>
				{isCalendarOpen && (
					<div className={styles.datePickerPopper}>
						<DatePicker
							selected={selectedDate}
							onChange={handleDateChange}
							dateFormat="MMMM d"
							showMonthDropdown={false}
							showYearDropdown={false}
							dropdownMode="select"
							renderCustomHeader={renderCustomHeader}
							inline
						/>
					</div>
				)}
			</div>
			<button
				className={`${styles.reset} ${filtersAreDefault ? "" : styles.active}`}
				onClick={reset}
			>
				Reset
			</button>
		</div>
	);
}
