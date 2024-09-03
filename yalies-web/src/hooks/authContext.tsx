import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {getCookie, setCookie} from "cookies-next";

type AuthContextType = {
	token: string | null;
	saveToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType>({
	token: null,
	saveToken: () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	
	useEffect(() => {
		const tokenCokie = getCookie("token");
		setToken(tokenCokie || null);
	}, []);

	const saveToken = useCallback((token: string | null) => {
		setToken(token);
		setCookie("token", token);
	}, []);

	return (
		<AuthContext.Provider value={{
			token,
			saveToken,
		}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
