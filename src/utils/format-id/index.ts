export const formatId = (input: string): string => {
	const result = input
		.toLowerCase() // Met tout en minuscule
		.replace(/[^a-z0-9\s-]/g, '') // Supprime tout sauf les lettres, les nombres et les espaces
		.trim() // Supprime les espaces en début et fin de chaîne
		.replace(/\s+/g, '-'); // Remplace les espaces par des tirets
	if (result) {
		return result;
	}
	throw new Error("This input can't be used as an ID");
};
