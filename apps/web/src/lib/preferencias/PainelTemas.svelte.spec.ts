import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { i18n } from '#lib/i18n/index.ts';
import { criarPreferencias } from './estado.svelte.ts';
import { painelTemas } from './painel.svelte.ts';
import PainelTemas from './PainelTemas.svelte';

function memoria() {
	const dados = new Map<string, string>();
	return {
		getItem: (k: string) => dados.get(k) ?? null,
		setItem: (k: string, v: string) => void dados.set(k, v)
	};
}

const fontes = async () => [
	{ id: 'ge', nome: 'ge', logo: null, espaco: 'geral', canais: ['esportes'] },
	{ id: 'g1', nome: 'g1', logo: null, espaco: 'geral', canais: ['brasil'] },
	{ id: 'ab-geral', nome: 'Agência Brasil', logo: null, espaco: 'geral', canais: ['brasil'] },
	{ id: 'ab-esportes', nome: 'Agência Brasil', logo: null, espaco: 'geral', canais: ['esportes'] }
];

describe('PainelTemas', () => {
	beforeEach(() => i18n.definir('pt-BR'));

	it('primeira visita: temas padrão marcados; marcar Esportes e "Pronto" grava', async () => {
		const estado = criarPreferencias(memoria());
		let fechou = false;
		render(PainelTemas, {
			primeiraVisita: true,
			onfechar: () => (fechou = true),
			estado,
			carregarFontes: fontes
		});
		await expect
			.element(page.getByRole('dialog', { name: 'O que você quer ver?' }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('checkbox', { name: /Brasil/ })).toBeChecked();
		await expect.element(page.getByRole('checkbox', { name: /Esportes/ })).not.toBeChecked();
		// A linha do tema mostra as fontes dele, sem repetir nomes.
		await expect.element(page.getByText('ge e Agência Brasil')).toBeInTheDocument();
		await page.getByRole('checkbox', { name: /Esportes/ }).click();
		expect(estado.atual.temas).not.toContain('esportes');
		await page.getByRole('button', { name: 'Pronto' }).click();
		expect(estado.atual.temas).toContain('esportes');
		expect(estado.atual.escolheu).toBe(true);
		expect(fechou).toBe(true);
	});

	it('primeira visita: "Pular" mantém o padrão e marca que escolheu', async () => {
		const estado = criarPreferencias(memoria());
		render(PainelTemas, {
			primeiraVisita: true,
			onfechar: () => {},
			estado,
			carregarFontes: fontes
		});
		await page.getByRole('checkbox', { name: /Esportes/ }).click();
		await page.getByRole('button', { name: 'Pular' }).click();
		expect(estado.atual.temas).toEqual(['mercado', 'brasil', 'mundo', 'tecnologia']);
		expect(estado.atual.escolheu).toBe(true);
	});

	it('o 6º tema digitado mostra o aviso de limite', async () => {
		const estado = criarPreferencias(memoria());
		render(PainelTemas, {
			primeiraVisita: false,
			onfechar: () => {},
			estado,
			carregarFontes: fontes
		});
		const campo = page.getByRole('textbox', { name: 'Novo tema' });
		for (const termo of ['Corinthians', 'energia solar', 'Petrobras', 'Recife', 'vacinas']) {
			await campo.fill(termo);
			await page.getByRole('button', { name: 'Adicionar' }).click();
		}
		expect(estado.atual.temasProprios).toHaveLength(5);
		await expect
			.element(page.getByRole('button', { name: 'Tirar o tema corinthians' }))
			.toBeInTheDocument();
		await campo.fill('Flamengo');
		await userEvent.keyboard('{Enter}');
		await expect
			.element(page.getByRole('status').filter({ hasText: 'Você já tem 5 temas' }))
			.toBeInTheDocument();
		expect(estado.atual.temasProprios).toHaveLength(5);
	});

	it('filtros: idioma, palavra silenciada e fonte escondida (todas as do mesmo nome)', async () => {
		const estado = criarPreferencias(memoria());
		render(PainelTemas, {
			primeiraVisita: false,
			onfechar: () => {},
			estado,
			carregarFontes: fontes
		});
		await page.getByRole('radio', { name: 'Só português' }).click();
		expect(estado.atual.idioma).toBe('pt');
		await page.getByRole('textbox', { name: 'Palavra ou expressão' }).fill('Bolsa Família');
		await page.getByRole('button', { name: 'Silenciar' }).click();
		expect(estado.atual.palavrasSilenciadas).toEqual(['bolsa familia']);
		await page.getByRole('checkbox', { name: 'Agência Brasil', exact: true }).click();
		expect(estado.atual.fontesOcultas).toEqual(['ab-geral', 'ab-esportes']);
	});

	it('Esc fecha e o foco volta ao botão que abriu', async () => {
		const botao = document.createElement('button');
		botao.textContent = 'Abrir temas';
		document.body.append(botao);
		botao.focus();
		painelTemas.abrir(botao);
		render(PainelTemas, {
			primeiraVisita: false,
			onfechar: () => painelTemas.fechar(),
			estado: criarPreferencias(memoria()),
			carregarFontes: fontes
		});
		await expect
			.element(page.getByRole('dialog', { name: 'Notícias e temas' }))
			.toBeInTheDocument();
		await expect.poll(() => botao === document.activeElement).toBe(false);
		await userEvent.keyboard('{Escape}');
		expect(painelTemas.aberto).toBe(false);
		await expect.poll(() => document.activeElement).toBe(botao);
		botao.remove();
	});
});
