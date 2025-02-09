export const camelize = (str: string) => {
	return str
		.replace(/[^a-zA-Z0-9]+/g, ' ') // Remplace tous les caractères non alphanumériques par des espaces
		.trim() // Supprime les espaces en début et en fin de chaîne
		.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => (index === 0 ? match.toLowerCase() : match.trim().toUpperCase()))
		.replace(/\s+/g, ''); // Supprime les espaces restants
};
