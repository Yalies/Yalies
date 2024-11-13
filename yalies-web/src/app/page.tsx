"use client";
import PeopleGrid from "@/components/PeopleGrid";
import { useEffect, useState } from "react";
import { Person } from "../../../yalies-shared/src/datatypes.js";

export default function HomePage() {
	const [people, setPeople] = useState<Person[]>([]);

	useEffect(() => { // TODO: Convert to use SWR
		(async () => {
			let response;
			try {
				response = await fetch(`${process.env.NEXT_PUBLIC_YALIES_API_URL}/api/people`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({}),
				});
			} catch(e) {
				console.error(e);
			}
			const people: Person[] = await response?.json();
			setPeople(people);
		})();
	}, []);
	return (
		<>
			<h1>Home page</h1>
			<PeopleGrid people={people} />
		</>
	);
}
