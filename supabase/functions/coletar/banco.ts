// BancoColeta de verdade, sobre o supabase-js com a chave de servidor (só existe dentro da função).
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Recente } from '../_compartilhado/agrupar.ts';
import type { BancoColeta, EstadoFonte, FonteComEstado } from './rodada.ts';

function ou<T>(resposta: { data: T | null; error: { message: string } | null }): T {
	if (resposta.error) throw new Error(resposta.error.message);
	return resposta.data as T;
}

export function bancoSupabase(db: SupabaseClient): BancoColeta {
	return {
		async fontesVencidas(ate) {
			const linhas = ou(
				await db
					.from('fontes')
					.select('id, nome, tipo, endereco, idioma, primaria, espaco, canais, intervalo_min, estado:estado_fontes(*)')
					.eq('ativa', true)
			) as unknown as (Omit<FonteComEstado, 'estado'> & { estado: EstadoFonte | EstadoFonte[] | null })[];
			return linhas
				.map((f) => ({ ...f, estado: (Array.isArray(f.estado) ? f.estado[0] : f.estado) as EstadoFonte }))
				.filter((f) => f.estado && Date.parse(f.estado.proxima_coleta) <= ate.getTime())
				.sort((a, b) => Date.parse(a.estado.proxima_coleta) - Date.parse(b.estado.proxima_coleta));
		},

		async recentes(desde, espaco) {
			return ou(
				await db
					.from('noticias')
					.select('grupo_id, assinatura, publicado_em')
					.eq('espaco', espaco)
					.gte('publicado_em', desde.toISOString())
					.order('publicado_em', { ascending: false })
					.limit(3000)
			) as Recente[];
		},

		async urlsExistentes(urls) {
			if (urls.length === 0) return new Set();
			const linhas = ou(await db.from('noticias').select('url').in('url', urls)) as { url: string }[];
			return new Set(linhas.map((l) => l.url));
		},

		async criarGrupo(item) {
			const linha = ou(
				await db.from('grupos').insert({ titulo: item.titulo, espaco: item.espaco }).select('id').single()
			) as { id: number };
			return linha.id;
		},

		async inserir(itens) {
			ou(
				await db.from('noticias').upsert(
					itens.map((i) => ({
						grupo_id: i.grupo_id,
						fonte_id: i.fonte_id,
						url: i.url,
						titulo: i.titulo,
						trecho: i.trecho,
						publicado_em: i.publicadoEm,
						idioma: i.idioma,
						espaco: i.espaco,
						canais: i.canais,
						assinatura: i.assinatura
					})),
					{ onConflict: 'url', ignoreDuplicates: true }
				)
			);
		},

		async salvarEstado(fonte_id, estado) {
			ou(await db.from('estado_fontes').update(estado).eq('fonte_id', fonte_id));
		}
	};
}
