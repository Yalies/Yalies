"use client";

import useAuth from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import styles from "./peoplegrid.module.scss";
import { Person } from "../../../yalies-shared/datatypes";
import Image from "next/image";

export default function PeopleGrid() {
	const {getToken} = useAuth();

	const [people, setPeople] = useState<Person[]>([]);

	useEffect(() => { // TODO: Convert to use SWR
		(async () => {
			const token = getToken();
			if(!token) return;
			let response;
			try {
				response = await fetch(`${process.env.NEXT_PUBLIC_YALIES_API_URL}/api/people`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						page: 1,
						page_size: 10,
						filters: {
							school_code: "YC",
						},
					}),
				});
			} catch(e) {
				console.error(e);
			}
			const people: Person[] = await response?.json();
			setPeople(people);
		})();
	}, [getToken]);
	
	const peopleElems = useMemo(() => {
		return people.map(person => {
			const longValues = [
				person.email && (
					<div title="Email" className={styles.row}>
						{/* TODO: FA icon */}
						<p className={styles.long_value}>
							<a href={`mailto:${person.email}`}>{person.email}</a>
						</p>
					</div>
				),
				person.college && (
					<div title="Residential College" className={styles.row}>
						{/* TODO: college icon */}
						<p className={styles.long_value}>
							{person.college}
						</p>
					</div>
				),
				person.year && (
					<div title="Graduation Year" className={styles.row}>
						{/* TODO: FA icon */}
						<p className={styles.long_value}>
							{person.year}
						</p>
					</div>
				),
			];

			const pills = [
				person.netid && (
					<div className={styles.pill}>NetID {person.netid}</div>
				),
				person.upi && (
					<div className={styles.pill}>UPI {person.upi}</div>
				),
				person.major && (
					<div className={styles.pill_metadata}>{person.major}</div>
				),
				person.birthday && (
					<div className={styles.pill_metadata}>{person.birthday}</div>
				),
				person.address && (
					<div className={styles.pill_metadata}>{person.address}</div>
				),
			];

			return (
				<div key={person.netid} className={styles.person}>
					<div className={styles.info_box}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={person.image || "/no_image.png"}
							alt={`${person.first_name} ${person.last_name}`}
						/>
						<div className={styles.details}>
							<h3 className={styles.name}>{person.last_name}, {person.first_name}</h3>
							{longValues}
						</div>
					</div>
					<div className={styles.pills}>
						{pills}
					</div>
				</div>
			);
		});
	}, [people]);

	return (
		<div id={styles.people_grid}>
			{peopleElems}
		</div>
	);
};
