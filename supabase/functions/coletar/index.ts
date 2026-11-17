// Edge Function "coletar": chamada pelo pg_cron a cada 5 minutos (supabase/migrations/*_agendar_coleta.sql).
// Confere a chave guardada no cofre do banco, respeita o teto mensal de chamadas e roda uma rodada de coleta.
import { createClient } from '@supabase/supabase-js';
import { bancoSupabase } from './banco.ts';
import { rodada } from './rodada.ts';

/** 80% das ~500 mil chamadas grátis por mês das Edge Functions. */
const TETO_MENSAL = 400_000;

const json = (corpo: unknown, status = 200) =>
	new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (pedido) => {
	if (pedido.method !== 'POST') return json({ erro: 'use POST' }, 405);
	// Sem a chave no formato certo, recusa antes de ir ao banco.
	const chave = pedido.headers.get('x-mirante-chave') ?? '';
	if (!/^[0-9a-f]{64}$/.test(chave)) return json({ erro: 'não autorizado' }, 401);

	const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	const { data: autorizado } = await db.rpc('conferir_chave_coleta', { p_chave: chave });
	if (autorizado !== true) return json({ erro: 'não autorizado' }, 401);

	const periodo = new Date().toISOString().slice(0, 7);
	const { data: dentroDoTeto, error } = await db.rpc('somar_cota', {
		p_servico: 'edge-coletar',
		p_periodo: periodo,
		p_teto: TETO_MENSAL
	});
	if (error) return json({ erro: error.message }, 500);
	if (dentroDoTeto === false) return json({ pausado: true, motivo: 'teto mensal de chamadas' });

	try {
		return json(await rodada(bancoSupabase(db)));
	} catch (erro) {
		return json({ erro: erro instanceof Error ? erro.message : String(erro) }, 500);
	}
});
