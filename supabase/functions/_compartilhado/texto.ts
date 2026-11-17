// Utilidades de texto usadas na limpeza, no agrupamento e na classificação.

/** Minúsculas e sem acento: "Ações" vira "acoes". */
export function semAcento(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase();
}

// Entidades HTML de nome mais comuns, incluindo todas as letras acentuadas do Latin-1 (160 a 255).
const LATIN1 =
	'nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml'.split(
		' '
	);
const ENTIDADES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	ndash: '–',
	mdash: '—',
	lsquo: '‘',
	rsquo: '’',
	sbquo: '‚',
	ldquo: '“',
	rdquo: '”',
	bdquo: '„',
	hellip: '…',
	bull: '•',
	euro: '€',
	trade: '™',
	...Object.fromEntries(LATIN1.map((nome, i) => [nome, String.fromCodePoint(160 + i)]))
};

/** Decodifica &amp;, &ccedil;, &#8211; e &#x2014;. Entidade desconhecida fica como está. */
export function decodificarEntidades(texto: string): string {
	return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (inteira, corpo: string) => {
		if (corpo[0] === '#') {
			const codigo = corpo[1] === 'x' || corpo[1] === 'X' ? parseInt(corpo.slice(2), 16) : parseInt(corpo.slice(1), 10);
			return Number.isFinite(codigo) && codigo > 0 && codigo <= 0x10ffff ? String.fromCodePoint(codigo) : inteira;
		}
		return ENTIDADES[corpo] ?? inteira;
	});
}

/** Algum dos padrões aparece como palavra inteira no texto (já sem acento e em minúsculas)? */
export function temPalavra(texto: string, padroes: readonly string[]): boolean {
	return padroes.some((p) => new RegExp(`(?<![a-z0-9])(?:${p})(?![a-z0-9])`).test(texto));
}
