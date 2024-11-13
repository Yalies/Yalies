"use client";
import { useMemo } from "react";
import { Person } from "../../../yalies-shared/src/datatypes.js";
import styles from "./peoplegrid.module.scss";

export default function PeopleGrid({
	people,
}: {
	people: Person[];
}) {
	const peopleElems = useMemo(() => {
		return people.map(person => {
			const longValues = [
				person.email && (
					<div key="email" title="Email" className={styles.row}>
						{/* TODO: FA icon */}
						<p className={styles.long_value}>
							<a href={`mailto:${person.email}`}>{person.email}</a>
						</p>
					</div>
				),
				person.college_code && (
					<div key="college_code" title="Residential College" className={styles.row}>
						{/* TODO: college icon */}
						<p className={styles.long_value}>
							{person.college_code}
						</p>
					</div>
				),
				person.year && (
					<div key="year" title="Graduation Year" className={styles.row}>
						{/* TODO: FA icon */}
						<p className={styles.long_value}>
							{person.year}
						</p>
					</div>
				),
			];

			const pills = [
				person.netid && (
					<div key="netid" className={styles.pill}>NetID {person.netid}</div>
				),
				person.upi && (
					<div key="upi" className={styles.pill}>UPI {person.upi}</div>
				),
				person.major && (
					<div key="major" className={styles.pill_metadata}>{person.major}</div>
				),
				person.birth_month && person.birth_day && (
					<div key="birthday" className={styles.pill_metadata}>{person.birth_month} {person.birth_day}</div>
				),
				person.address && (
					<div key="address" className={styles.pill_metadata}>{person.address}</div>
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
