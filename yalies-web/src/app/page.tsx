"use client";
import PeopleGrid from "@/components/PeopleGrid";
import { useCallback, useEffect, useState } from "react";
import { Person } from "../../../yalies-shared/src/datatypes.js";
import Navbar from "@/components/Navbar";
import Filters from "@/components/Filters";
import Topbar from "@/components/Topbar";
import Splash from "@/components/Splash";


export default function HomePage() {
	const [isUnauthenticated, setUnauthenticated] = useState(false);
	const [people, setPeople] = useState<Person[]>([]);
	const [birthdayPeople, setBirthdayPeople] = useState<Person[]>([]);
	const [hasReachedEnd, setHasReachedEnd] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);

	const getPeople = useCallback(async () => {
		if(hasReachedEnd) return;
		let response;
		try {
			response = await fetch(`${process.env.NEXT_PUBLIC_YALIES_API_URL}/v2/people`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					filters: {
						school: "Yale College",
					},
					page: currentPage,
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
			if(response.status === 401) {
				setUnauthenticated(true);
				return;
			}
			if(response.status === 403) {
				window.location.href = "/forbidden";
				return;
			}
			console.error("Error fetching people", response.status, response.statusText, await response.text());
			return;
		}
		const newPeople: Person[] = await response?.json();
		if(newPeople.length === 0) {
			setHasReachedEnd(true);
			return;
		}
		setPeople([...people, ...newPeople]);
		setCurrentPage(currentPage + 1);
	}, [currentPage, hasReachedEnd, people]);

	const getTodaysBirthdays = useCallback(async () => {
		let response;
		try {
			response = await fetch(`${process.env.NEXT_PUBLIC_YALIES_API_URL}/v2/people`, {
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
			if(response.status === 401) {
				setUnauthenticated(true);
				return;
			}
			if(response.status === 403) {
				window.location.href = "/forbidden";
				return;
			}
			console.error("Error fetching people", response.status, response.statusText, await response.text());
			return;
		}
		const newPeople: Person[] = await response?.json();
		setBirthdayPeople(newPeople);
	}, []);

	useEffect(() => { // TODO: Convert to use SWR
		getTodaysBirthdays();
		getPeople();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if(isUnauthenticated) {
		return (
			<>
				<Topbar>
					<Navbar />
				</Topbar>
				<Splash />
			</>
		);
	}

	const peopleToDisplay = [
		...birthdayPeople,
		...people,
	];

	return (
		<>
			<Topbar>
				<Navbar />
				<Filters />
			</Topbar>
			<PeopleGrid
				people={peopleToDisplay}
				loadMoreFunction={getPeople}
				hasReachedEnd={hasReachedEnd}
			/>
		</>
	);
}
