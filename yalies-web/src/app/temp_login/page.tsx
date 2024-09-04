"use client";
import Button from "@/components/Button";
import Link from "next/link.js";
import { useSearchParams } from "next/navigation.js";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";

export default function APIPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const {saveToken} = useAuth();

	useEffect(() => {
		if(!token) return;
		saveToken(token);
	}, [saveToken, token]);

	if(token) {
		return (
			<h1>You are now logged in.</h1>
		);
	}

	const thisUrlEncoded = encodeURIComponent(window.location.toString());
	const redirectUrl = `${process.env.NEXT_PUBLIC_YALIES_API_URL}/UNSAFE_login_3rd_party?redir=${thisUrlEncoded}`;
	return (
		<>
			<p>This is a temporary solution to get a cookie from the v1 Yalies backend.</p>
			<Link href={redirectUrl}>
				<Button>Log in with CAS</Button>
			</Link>
		</>
	);
}
