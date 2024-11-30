export function logError(scope: string, message: string, error: Error | null) {
	console.error(`[${scope}]\t\t\t${message}\t\t\t${error ? error : ""}`);
};
