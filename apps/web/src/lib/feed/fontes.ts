/** Iniciais para o avatar da fonte ("Gazeta do Pregão" → "GP"). */
export function iniciais(nome: string): string {
	const palavras = nome
		.replace(/\(.*?\)/g, '')
		.split(/\s+/)
		.filter((p) => p.length > 2 || /^[A-Z]/.test(p));
	return (palavras[0]?.[0] ?? '?').toUpperCase() + (palavras[1]?.[0] ?? '').toUpperCase();
}
