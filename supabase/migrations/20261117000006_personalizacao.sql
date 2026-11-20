-- Personalização das notícias (fase 1B), parte 1: busca em texto para o tema digitado e cartões montados
-- num lugar só. O espaço "geral", as fontes novas e as preferências de cada conta vêm na migração 0007.

create extension if not exists unaccent with schema extensions;

-- A mesma matéria pode chegar por dois feeds: ganha os dois canais, e o grupo acompanha.
create or replace trigger noticias_atualizam_grupo
	after insert or update of canais on public.noticias
	for each row execute function public.atualizar_grupo();

-- Busca em texto ---------------------------------------------------------------------------------
create or replace function public.sem_acento(texto text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
	select extensions.unaccent('extensions.unaccent'::regdictionary, lower(texto));
$$;

alter table public.noticias
	add column busca tsvector
	generated always as (to_tsvector('simple'::regconfig, public.sem_acento(titulo || ' ' || trecho))) stored;

create index noticias_busca on public.noticias using gin (busca);

-- Cartões: um lugar só para montar (feed e busca usam) ---------------------------------------------
create or replace function public.montar_cartoes(p_ids bigint[])
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
	select coalesce(jsonb_agg(c.cartao order by c.ordem), '[]'::jsonb)
	from (
		select ids.ordem,
			jsonb_build_object(
				'id', g.id,
				'titulo', principal.titulo,
				'url', principal.url,
				'trecho', principal.trecho,
				'publicadoEm', principal.publicado_em,
				'idioma', principal.idioma,
				'canais', g.canais,
				'fontes', fontes.lista
			) as cartao
		from unnest(p_ids) with ordinality as ids(id, ordem)
		join public.grupos g on g.id = ids.id
		cross join lateral (
			select n.fonte_id, n.titulo, n.url, n.trecho, n.publicado_em, n.idioma
			from public.noticias n
			join public.fontes f on f.id = n.fonte_id
			where n.grupo_id = g.id
			order by (n.idioma = 'pt-BR') desc, f.primaria desc, n.publicado_em
			limit 1
		) principal
		cross join lateral (
			select jsonb_agg(
				jsonb_build_object(
					'id', f.id, 'nome', f.nome, 'site', f.site, 'logo', f.logo, 'primaria', f.primaria,
					'url', case when f.id = principal.fonte_id then principal.url else um.url end
				)
				order by (f.id = principal.fonte_id) desc, f.primaria desc, um.publicado_em
			) as lista
			from (
				select distinct on (n.fonte_id) n.fonte_id, n.url, n.publicado_em
				from public.noticias n
				where n.grupo_id = g.id
				order by n.fonte_id, n.publicado_em
			) um
			join public.fontes f on f.id = um.fonte_id
		) fontes
	) c;
$$;

grant execute on function public.montar_cartoes(bigint[]) to anon, authenticated, service_role;

-- Feed: mesma escolha e ordem da migração 0005, cartões por montar_cartoes.
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
		select id, nota - (row_number() over (partition by fonte order by nota desc) - 1) as nota
		from candidatos
		order by 2 desc
		limit least(greatest(coalesce(p_limite, 30), 1), 60)
	)
	select public.montar_cartoes(coalesce(array(select id from escolhidos order by nota desc), '{}'));
$$;

-- Tema digitado: a frase em qualquer fonte conferida, nos últimos 30 dias.
create or replace function public.buscar_noticias(p_termo text, p_limite integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
	with termo as (
		select btrim(regexp_replace(coalesce(p_termo, ''), '\s+', ' ', 'g')) as t
	),
	consulta as (
		select phraseto_tsquery('simple'::regconfig, public.sem_acento(t)) as q
		from termo
		where char_length(t) between 2 and 40
	),
	achados as (
		select n.grupo_id, max(n.publicado_em) as quando
		from public.noticias n, consulta
		where n.busca @@ consulta.q
			and n.publicado_em > now() - interval '30 days'
		group by n.grupo_id
		order by quando desc
		limit least(greatest(coalesce(p_limite, 30), 1), 60)
	)
	select public.montar_cartoes(coalesce(array(select grupo_id from achados order by quando desc), '{}'));
$$;

revoke execute on function public.buscar_noticias(text, integer) from public;
grant execute on function public.buscar_noticias(text, integer) to anon, authenticated, service_role;
