-- Testes da função feed(): variedade de fontes e a fonte do título na frente.
-- Roda numa transação e desfaz tudo no fim. Cada linha do resultado deve ter ok = true.
begin;
do $$
declare g bigint; i int;
begin
	for i in 1..3 loop
		insert into public.grupos (titulo, espaco) values ('teste-div im ' || i, 'tecnologia') returning id into g;
		insert into public.noticias (grupo_id, fonte_id, url, titulo, publicado_em, idioma, espaco, canais)
		values (g, 'techcrunch-ia', 'https://teste.invalid/im' || i, 'teste-div im ' || i, now() + interval '1 day' - (i || ' minutes')::interval, 'en', 'tecnologia', '{ia}');
	end loop;
	insert into public.grupos (titulo, espaco) values ('teste-div outra', 'tecnologia') returning id into g;
	insert into public.noticias (grupo_id, fonte_id, url, titulo, publicado_em, idioma, espaco, canais)
	values (g, 'tecnoblog', 'https://teste.invalid/tb', 'teste-div outra', now() + interval '1 day' - interval '40 minutes', 'pt-BR', 'tecnologia', '{ia}');
end $$;
select 'canal ia: a 2ª posição é de outra fonte' as checagem,
	(select i -> 'fontes' -> 0 ->> 'id' from jsonb_array_elements(public.feed('tecnologia', 'ia', 10)) with ordinality as x(i, n) where n = 2) = 'tecnoblog' as ok
union all
select 'canal geral: idem',
	(select i -> 'fontes' -> 0 ->> 'id' from jsonb_array_elements(public.feed('tecnologia', null, 10)) with ordinality as x(i, n) where n = 2) = 'tecnoblog';

-- Grupo misto (Fed em inglês + Agência Brasil): o título é o em português, e a fonte dele vem primeiro.
with g as (insert into public.grupos (titulo, espaco) values ('teste-misto', 'mercado') returning id)
insert into public.noticias (grupo_id, fonte_id, url, titulo, publicado_em, idioma, espaco, canais)
select g.id, x.f, x.u, x.t, now() + interval '2 days' - x.a, x.i, 'mercado', '{macro}' from g, (values
	('fed', 'https://teste.invalid/fed', 'teste-misto: Fed holds rates steady', interval '30 minutes', 'en'),
	('agencia-brasil-internacional', 'https://teste.invalid/ab', 'teste-misto: Fed mantém os juros', interval '10 minutes', 'pt-BR')
) as x(f, u, t, a, i);
select 'grupo misto: título em português e a fonte dele na frente' as checagem,
	(select i ->> 'titulo' = 'teste-misto: Fed mantém os juros' and i -> 'fontes' -> 0 ->> 'id' = 'agencia-brasil-internacional'
	 and i -> 'fontes' -> 0 ->> 'url' = 'https://teste.invalid/ab'
	 from jsonb_array_elements(public.feed('mercado', 'macro', 60)) i where i ->> 'titulo' like 'teste-misto%') as ok;
rollback;
