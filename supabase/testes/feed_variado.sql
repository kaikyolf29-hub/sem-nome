-- Teste da variedade do feed: uma fonte que publica muito não ocupa as primeiras posições.
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
rollback;
