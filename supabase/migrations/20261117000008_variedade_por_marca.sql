-- Variedade por marca no feed(): o que a pessoa vê repetido é a logo, e as seções de um veículo
-- (g1, g1 Política, g1 Mundo; as várias da Agência Brasil) dividem a mesma. Antes, cada seção
-- contava como uma fonte diferente e o g1 tomava a frente dos canais.

-- O g1 Economia usava uma cópia da logo do g1 com outro nome: passa a usar a mesma.
update public.fontes set logo = '/fontes/g1.png' where id = 'g1-economia';

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
				-- A marca é a logo: seções do mesmo veículo (g1, g1 Política, g1 Mundo) contam como uma só.
				select coalesce(f.logo, n.fonte_id)
				from public.noticias n
				join public.fontes f on f.id = n.fonte_id
				where n.grupo_id = g.id
				order by f.primaria desc, n.publicado_em
				limit 1
			) as marca
		from public.grupos g, geral
		where g.espaco = p_espaco
			and g.n_fontes > 0
			and g.atualizado_em > now() - interval '90 days'
			and (geral.sim or p_canal = any (g.canais))
		order by nota desc
		limit least(greatest(coalesce(p_limite, 30), 1), 60) * 3
	),
	-- Variedade: cada notícia repetida da mesma marca perde 1 hora, e as marcas se alternam.
	escolhidos as (
		select id, nota - (row_number() over (partition by marca order by nota desc) - 1) as nota
		from candidatos
		order by 2 desc
		limit least(greatest(coalesce(p_limite, 30), 1), 60)
	)
	select public.montar_cartoes(coalesce(array(select id from escolhidos order by nota desc), '{}'));
$$;
