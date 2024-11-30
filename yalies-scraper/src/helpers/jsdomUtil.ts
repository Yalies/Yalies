export function getTextContentNonRecursive(element: Element): string {
	return Array.from(element.childNodes)
		.filter(node => node.nodeType === 3) // 3: magic number for text node
		.map(node => node.textContent)
		.join("");
};
