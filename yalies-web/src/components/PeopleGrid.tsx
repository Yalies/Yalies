"use client";

import useAuth from "@/hooks/useAuth";

export default function PeopleGrid() {
	const {getToken} = useAuth();
	
	console.log(getToken());

	return (
		<p>People grid</p>
	);
};
