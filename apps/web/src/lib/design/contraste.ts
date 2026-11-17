/** Razão de contraste WCAG 2.1 entre duas cores `#rrggbb`. */
export function razaoContraste(frente: string, fundo: string): number {
	const [a, b] = [luminancia(frente), luminancia(fundo)].sort((x, y) => y - x);
	return (a + 0.05) / (b + 0.05);
}

function luminancia(hex: string): number {
	const h = hex.replace('#', '');
	if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`cor inválida (use #rrggbb): ${hex}`);
	const [r, g, b] = [0, 2, 4].map((i) => {
		const c = parseInt(h.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
