export interface ItemComando {
	id: string;
	rotulo: string;
	tipo: 'espaco' | 'canal' | 'noticia';
	destino: string;
}

const LIMITE = 8;
const normalizar = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();

/** Busca sem acento e sem maiúsculas; quem começa a palavra vem antes de quem só contém. Até 8. */
export function buscarComandos(consulta: string, itens: readonly ItemComando[]): ItemComando[] {
	const q = normalizar(consulta.trim());
	if (!q) return itens.slice(0, LIMITE);
	const pontuados = itens.flatMap((item, ordem) => {
		const texto = normalizar(item.rotulo);
		if (!texto.includes(q)) return [];
		const inicio = texto.startsWith(q)
			? 0
			: texto.split(/[^a-z0-9]+/).some((p) => p.startsWith(q))
				? 1
				: 2;
		return [{ item, inicio, ordem }];
	});
	return pontuados
		.sort((a, b) => a.inicio - b.inicio || a.ordem - b.ordem)
		.slice(0, LIMITE)
		.map((p) => p.item);
}
