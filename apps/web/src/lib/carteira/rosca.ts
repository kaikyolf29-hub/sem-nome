export interface Fatia {
	rotulo: string;
	valor: number;
}

export interface Arco {
	rotulo: string;
	pct: number;
	/** Graus a partir do topo, no sentido horário. */
	inicio: number;
	fim: number;
}

/** Ângulos de cada fatia (fatias ≤ 0 saem; total zero não desenha). */
export function arcos(fatias: readonly Fatia[]): Arco[] {
	const validas = fatias.filter((f) => f.valor > 0);
	const total = validas.reduce((s, f) => s + f.valor, 0);
	if (total <= 0) return [];
	let angulo = 0;
	return validas.map((f) => {
		const pct = (f.valor / total) * 100;
		const inicio = angulo;
		angulo += (pct / 100) * 360;
		return { rotulo: f.rotulo, pct, inicio, fim: angulo };
	});
}

/** Caminho SVG de um arco de anel (rosca) entre dois ângulos. */
export function caminhoArco(
	cx: number,
	cy: number,
	r: number,
	inicio: number,
	fim: number
): string {
	const ponto = (a: number) => {
		const rad = ((a - 90) * Math.PI) / 180;
		return `${(cx + r * Math.cos(rad)).toFixed(3)} ${(cy + r * Math.sin(rad)).toFixed(3)}`;
	};
	const grande = fim - inicio > 180 ? 1 : 0;
	const fimAjustado = fim - inicio >= 360 ? fim - 0.001 : fim;
	return `M ${ponto(inicio)} A ${r} ${r} 0 ${grande} 1 ${ponto(fimAjustado)}`;
}
