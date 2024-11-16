"use client";
import PeopleGrid from "@/components/PeopleGrid";
import { useEffect, useState } from "react";
import { Person } from "../../../yalies-shared/src/datatypes.js";

export default function HomePage() {
	const [people, setPeople] = useState<Person[]>([]);
	const [birthdayPeople, setBirthdayPeople] = useState<Person[]>([]);

	const getPeople = async () => {
		let response;
		try {
			response = await fetch(`${process.env.NEXT_PUBLIC_YALIES_API_URL}/api/people`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					filters: {
						school: "Yale College",
					},
					page_size: 20,
				}),
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
			console.error("Error fetching people", response.status, response.statusText, await response.text());
			return;
		}
		const people: Person[] = await response?.json();
		setPeople(people);
	};

	const getTodaysBirthdays = async () => {
		let response;
		try {
			response = await fetch(`${process.env.NEXT_PUBLIC_YALIES_API_URL}/api/people`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					filters: {
						school: "Yale College",
						birth_day: new Date().getDate(),
						birth_month: new Date().getMonth() + 1,
					},
					page_size: 100,
				}),
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
			console.error("Error fetching people", response.status, response.statusText, await response.text());
			return;
		}
		const people: Person[] = await response?.json();
		setBirthdayPeople(people);
	};

	useEffect(() => { // TODO: Convert to use SWR
		getTodaysBirthdays();
		getPeople();
	}, []);

	const peopleToDisplay = [
		...birthdayPeople,
		...people,
	];

	return (
		<>
			<PeopleGrid people={peopleToDisplay} />
		</>
	);
}
