-- Teste da personalização: preferências (RLS e limites), busca em texto e espaço geral.
-- Roda numa transação e desfaz tudo no fim. Cada linha do resultado deve ter ok = true.
begin;

create temporary table resultado (checagem text, ok boolean) on commit drop;
grant all on resultado to authenticated, anon;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
	('00000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a1@teste.invalid', '{}', now(), now()),
	('00000000-0000-4000-8000-0000000000b1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b1@teste.invalid', '{}', now(), now());

insert into public.preferencias (id, temas) values ('00000000-0000-4000-8000-0000000000b1', '{esportes}');

-- Notícias de teste no espaço geral (uma por grupo).
do $$
declare g bigint; x record;
begin
	for x in select * from (values
		('ge', 'https://teste.invalid/1', 'Boom da energia solar preocupa operadores', interval '1 hour', '{esportes}'::text[]),
		('ge', 'https://teste.invalid/2', 'Leilão de energia eólica e solar movimenta o setor', interval '2 hours', '{esportes}'::text[]),
		('g1', 'https://teste.invalid/3', 'Petróleo sobe 3% com corte da Opep', interval '3 hours', '{brasil}'::text[]),
		('g1', 'https://teste.invalid/4', 'Energia solar antiga de 40 dias', interval '40 days', '{brasil}'::text[])
	) as t(fonte, url, titulo, atraso, canais)
	loop
		insert into public.grupos (titulo, espaco) values (x.titulo, 'geral') returning id into g;
		insert into public.noticias (grupo_id, fonte_id, url, titulo, publicado_em, idioma, espaco, canais)
		values (g, x.fonte, x.url, x.titulo, now() - x.atraso, 'pt-BR', 'geral', x.canais);
	end loop;
end;
$$;

-- Forma do cartão: igual à da migração 0005 (a fonte do título primeiro).
with g as (insert into public.grupos (titulo, espaco) values ('teste-forma', 'mercado') returning id)
insert into public.noticias (grupo_id, fonte_id, url, titulo, trecho, publicado_em, idioma, espaco, canais)
select g.id, x.f, x.u, x.t, 'trecho', timestamptz '2026-11-17 12:00:00+00' + x.a, 'pt-BR', 'mercado', '{teste-forma}'
from g, (values
	('bcb', 'https://teste.invalid/f1', 'teste-forma: BC mantém juros', interval '0'),
	('infomoney', 'https://teste.invalid/f2', 'teste-forma: BC mantém os juros', interval '5 minutes')
) as x(f, u, t, a);

insert into resultado
select 'feed mantém a forma do cartão',
	(select jsonb_build_object('titulo', i ->> 'titulo', 'url', i ->> 'url', 'fontes', jsonb_path_query_array(i -> 'fontes', '$[*].id'), 'canais', i -> 'canais')
	 from jsonb_array_elements(public.feed('mercado', 'teste-forma', 10)) i)
	= jsonb_build_object('titulo', 'teste-forma: BC mantém juros', 'url', 'https://teste.invalid/f1', 'fontes', '["bcb", "infomoney"]'::jsonb, 'canais', '["teste-forma"]'::jsonb);

insert into resultado
select 'feed do espaço geral traz a notícia do ge no canal esportes',
	exists (select 1 from jsonb_array_elements(public.feed('geral', 'esportes', 60)) i where i -> 'fontes' -> 0 ->> 'id' = 'ge');

insert into resultado
select 'busca acha a frase, sem diferença de maiúsculas e espaços',
	exists (select 1 from jsonb_array_elements(public.buscar_noticias('  ENERGIA   solar ')) i where i ->> 'titulo' = 'Boom da energia solar preocupa operadores');

insert into resultado
select 'busca pede a frase junta: "eólica e solar" não entra',
	not exists (select 1 from jsonb_array_elements(public.buscar_noticias('energia solar')) i where i ->> 'titulo' like 'Leilão%');

insert into resultado
select 'busca sem acento acha com acento',
	exists (select 1 from jsonb_array_elements(public.buscar_noticias('petroleo')) i where i ->> 'titulo' like 'Petróleo%');

insert into resultado
select 'busca ignora notícias com mais de 30 dias',
	not exists (select 1 from jsonb_array_elements(public.buscar_noticias('energia solar')) i where i ->> 'titulo' like '%40 dias');

insert into resultado
select 'termo de 1 caractere devolve lista vazia', public.buscar_noticias('a') = '[]'::jsonb;

-- Como a pessoa A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

insert into public.preferencias (id, temas, temas_proprios) values ('00000000-0000-4000-8000-0000000000a1', '{brasil,mundo}', '{corinthians}');
insert into resultado select 'A lê só as próprias preferências',
	(select count(*) from public.preferencias) = 1 and (select temas from public.preferencias) = '{brasil,mundo}';

with mudou as (update public.preferencias set temas = '{x}' where id = '00000000-0000-4000-8000-0000000000b1' returning 1)
insert into resultado select 'A não muda as preferências de B', (select count(*) from mudou) = 0;

do $$
begin
	begin
		update public.preferencias set temas_proprios = '{a1,a2,a3,a4,a5,a6}' where id = '00000000-0000-4000-8000-0000000000a1';
		insert into resultado values ('6 temas digitados são recusados', false);
	exception when check_violation then
		insert into resultado values ('6 temas digitados são recusados', true);
	end;
	begin
		delete from public.preferencias where id = '00000000-0000-4000-8000-0000000000a1';
		insert into resultado values ('A não apaga as preferências pelo app', false);
	exception when insufficient_privilege then
		insert into resultado values ('A não apaga as preferências pelo app', true);
	end;
end;
$$;

reset role;
set local role anon;
do $$
begin
	begin
		perform 1 from public.preferencias;
		insert into resultado values ('visitante não lê preferências', false);
	exception when insufficient_privilege then
		insert into resultado values ('visitante não lê preferências', true);
	end;
end;
$$;
insert into resultado select 'visitante usa a busca', jsonb_typeof(public.buscar_noticias('petroleo')) = 'array';

reset role;
select checagem, ok from resultado order by checagem;
rollback;
