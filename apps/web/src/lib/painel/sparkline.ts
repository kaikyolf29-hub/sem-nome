/** Atributo `d` de uma linha que liga os valores, do menor (embaixo) ao maior (em cima). */
export function caminhoSparkline(
	valores: readonly number[],
	largura: number,
	altura: number
): string {
	if (valores.length < 2) return '';
	const min = Math.min(...valores);
	const max = Math.max(...valores);
	const passo = largura / (valores.length - 1);
	const y = (v: number) => (max === min ? altura / 2 : altura - ((v - min) / (max - min)) * altura);
	const r = (n: number) => Math.round(n * 100) / 100;
	return valores.map((v, i) => `${i === 0 ? 'M' : 'L'}${r(i * passo)},${r(y(v))}`).join(' ');
}
