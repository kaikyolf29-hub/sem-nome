-- Feed com variedade: uma fonte que publica muito não ocupa a capa inteira.
-- Igual à função da migração 20261117000002, mais o passo "escolhidos" com a penalidade por repetição.
create or replace function public.feed(p_espaco text, p_canal text default null, p_limite integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
	with geral as (
		select (p_canal is null or p_canal in ('manchetes', 'visao-geral')) as sim
	),
	candidatos as (
		select g.id,
			g.canais,
			case
				when geral.sim then
					extract(epoch from g.atualizado_em) / 3600
					+ 4 * ln(greatest(g.n_fontes, 1))
					+ case when g.primaria then 3 else 0 end
					- case when g.atualizado_em > now() - interval '72 hours' then 0 else 100000 end
				else extract(epoch from g.atualizado_em) / 3600
			end as nota,
			(
				select n.fonte_id
				from public.noticias n
				join public.fontes f on f.id = n.fonte_id
				where n.grupo_id = g.id
				order by f.primaria desc, n.publicado_em
				limit 1
			) as fonte
		from public.grupos g, geral
		where g.espaco = p_espaco
			and g.n_fontes > 0
			and g.atualizado_em > now() - interval '90 days'
			and (geral.sim or p_canal = any (g.canais))
		order by nota desc
		limit least(greatest(coalesce(p_limite, 30), 1), 60) * 3
	),
	-- Variedade: cada notícia repetida da mesma fonte perde 1 hora, e as fontes se alternam.
	escolhidos as (
		select id, canais, nota - (row_number() over (partition by fonte order by nota desc) - 1) as nota
		from candidatos
		order by 3 desc
		limit least(greatest(coalesce(p_limite, 30), 1), 60)
	),
	cartoes as (
		select e.nota,
			jsonb_build_object(
				'id', e.id,
				'titulo', principal.titulo,
				'url', principal.url,
				'trecho', principal.trecho,
				'publicadoEm', principal.publicado_em,
				'idioma', principal.idioma,
				'canais', e.canais,
				'fontes', fontes.lista
			) as cartao
		from escolhidos e
		cross join lateral (
			select n.titulo, n.url, n.trecho, n.publicado_em, n.idioma
			from public.noticias n
			join public.fontes f on f.id = n.fonte_id
			where n.grupo_id = e.id
			order by (n.idioma = 'pt-BR') desc, f.primaria desc, n.publicado_em
			limit 1
		) principal
		cross join lateral (
			select jsonb_agg(
				jsonb_build_object('id', f.id, 'nome', f.nome, 'site', f.site, 'logo', f.logo, 'primaria', f.primaria, 'url', um.url)
				order by f.primaria desc, um.publicado_em
			) as lista
			from (
				select distinct on (n.fonte_id) n.fonte_id, n.url, n.publicado_em
				from public.noticias n
				where n.grupo_id = e.id
				order by n.fonte_id, n.publicado_em
			) um
			join public.fontes f on f.id = um.fonte_id
		) fontes
	)
	select coalesce(jsonb_agg(cartao order by nota desc), '[]'::jsonb) from cartoes;
$$;

revoke execute on function public.feed(text, text, integer) from public;
grant execute on function public.feed(text, text, integer) to anon, authenticated, service_role;
