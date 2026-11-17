import { espacamentos, marca, movimento, raios, temas, tipos, type PaletaTema } from './tokens.ts';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function variaveisTema(p: PaletaTema): string[] {
	return Object.entries(p).flatMap(([k, v]) =>
		Array.isArray(v)
			? v.map((cor, i) => `\t--${kebab(k).replace(/s$/, '')}-${i + 1}: ${cor};`)
			: [`\t--${kebab(k)}: ${v};`]
	);
}

/** CSS com as variáveis de todos os temas e as globais. Fonte: tokens.ts. */
export function gerarCss(): string {
	const globais = [
		`\t--marca: ${marca.base};`,
		`\t--marca-de: ${marca.degradeDe};`,
		`\t--marca-ate: ${marca.degradeAte};`,
		...Object.entries(raios).map(([k, v]) => `\t--raio-${k}: ${v}px;`),
		...espacamentos.map((v, i) => `\t--espaco-${i}: ${v}px;`),
		...Object.entries(tipos).map(([k, v]) => `\t--tipo-${k}: ${v}px;`),
		`\t--dur-rapido: ${movimento.rapido}ms;`,
		`\t--dur-medio: ${movimento.medio}ms;`,
		`\t--dur-lento: ${movimento.lento}ms;`,
		`\t--curva: ${movimento.curva};`,
		`\t--mola: ${movimento.mola};`
	];
	const blocos = Object.entries(temas).map(
		([nome, p]) => `:root[data-tema='${nome}'] {\n${variaveisTema(p).join('\n')}\n}`
	);
	return [
		'/* Gerado por scripts/gerar-tokens.ts a partir de src/lib/design/tokens.ts. Não edite. */',
		`:root {\n${globais.join('\n')}\n}`,
		...blocos,
		''
	].join('\n\n');
}
