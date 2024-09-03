"use client";

import { useAuth } from "@/hooks/authContext";

export default function PeopleGrid() {
	const {token} = useAuth();

	console.log(token);
	
	return (
		<p>People grid</p>
	);
};
