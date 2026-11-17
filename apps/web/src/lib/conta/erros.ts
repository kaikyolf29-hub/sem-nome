import type { ChaveMensagem } from '#lib/i18n/tipos.ts';

/** Traduz erros do login para mensagens claras (nunca o texto cru do Supabase). */
export function mensagemDeErro(erro: { message?: string; code?: string } | null): ChaveMensagem {
	const texto = `${erro?.code ?? ''} ${erro?.message ?? ''}`.toLowerCase();
	if (texto.includes('provider is not enabled') || texto.includes('unsupported provider'))
		return 'conta.erroProvedor';
	if (texto.includes('access_denied')) return 'conta.erroCancelado';
	if (texto.includes('failed to fetch') || texto.includes('networkerror')) return 'conta.erroRede';
	return 'conta.erroGenerico';
}
