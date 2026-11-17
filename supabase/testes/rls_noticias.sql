-- Teste do banco das notícias: leitura pública, escrita só do servidor, grupos e função feed().
-- Roda numa transação e desfaz tudo no fim. Cada linha do resultado deve ter ok = true.
begin;

create temporary table resultado (checagem text, ok boolean) on commit drop;
grant all on resultado to authenticated, anon;

-- Como dono do banco (a coleta faz isso com a chave de servidor).
with g as (
	insert into public.grupos (titulo, espaco) values ('teste: Copom mantém a Selic', 'mercado') returning id
)
insert into public.noticias (grupo_id, fonte_id, url, titulo, trecho, publicado_em, idioma, espaco, canais)
select g.id, x.fonte, x.url, x.titulo, 'trecho', now() - x.atraso, 'pt-BR', 'mercado', x.canais
from g, (values
	('infomoney', 'https://teste.invalid/a', 'teste: Copom mantém a Selic em 15%', interval '20 minutes', array['brasil']),
	('bcb', 'https://teste.invalid/b', 'teste: Copom mantém a taxa Selic', interval '30 minutes', array['macro'])
) as x(fonte, url, titulo, atraso, canais);

-- Em outro comando: o que um comando insere não aparece para ele mesmo.
insert into resultado
select 'gatilho conta 2 fontes no grupo, com primária e canais unidos',
	coalesce((select n_fontes = 2 and primaria and canais @> array['brasil', 'macro']
		from public.grupos where titulo = 'teste: Copom mantém a Selic'), false);

with g as (
	insert into public.grupos (titulo, espaco) values ('teste: notícia velha', 'mercado') returning id
)
insert into public.noticias (grupo_id, fonte_id, url, titulo, publicado_em, idioma, espaco)
select g.id, 'infomoney', 'https://teste.invalid/velha', 'teste: notícia velha', now() - interval '100 days', 'pt-BR', 'mercado' from g;

-- Como visitante (sem conta).
set local role anon;

insert into resultado select 'visitante lê as 19 fontes', (select count(*) from public.fontes) = 19;

insert into resultado
select 'feed traz o grupo com 2 fontes, a primária primeiro',
	exists (
		select 1 from jsonb_array_elements(public.feed('mercado', null, 60)) i
		where i ->> 'titulo' like 'teste: Copom%'
			and jsonb_array_length(i -> 'fontes') = 2
			and i -> 'fontes' -> 0 ->> 'id' = 'bcb'
	);

insert into resultado
select 'feed do canal macro traz o grupo; o de câmbio não',
	exists (select 1 from jsonb_array_elements(public.feed('mercado', 'macro', 60)) i where i ->> 'titulo' like 'teste: Copom%')
	and not exists (select 1 from jsonb_array_elements(public.feed('mercado', 'cambio', 60)) i where i ->> 'titulo' like 'teste: Copom%');

insert into resultado
select 'notícia de 100 dias não aparece no feed',
	not exists (select 1 from jsonb_array_elements(public.feed('mercado', null, 60)) i where i ->> 'titulo' = 'teste: notícia velha');

do $$
begin
	begin
		insert into public.noticias (grupo_id, fonte_id, url, titulo, publicado_em, idioma, espaco)
		values (1, 'bcb', 'https://teste.invalid/x', 'x', now(), 'pt-BR', 'mercado');
		insert into resultado values ('visitante não insere notícia', false);
	exception when insufficient_privilege then
		insert into resultado values ('visitante não insere notícia', true);
	end;
	begin
		perform 1 from public.estado_fontes;
		insert into resultado values ('visitante não lê o estado das fontes', false);
	exception when insufficient_privilege then
		insert into resultado values ('visitante não lê o estado das fontes', true);
	end;
	begin
		perform 1 from public.contadores_cota;
		insert into resultado values ('visitante não lê os contadores de cota', false);
	exception when insufficient_privilege then
		insert into resultado values ('visitante não lê os contadores de cota', true);
	end;
	begin
		perform public.somar_cota('x', 'x', 1);
		insert into resultado values ('visitante não soma cota', false);
	exception when insufficient_privilege then
		insert into resultado values ('visitante não soma cota', true);
	end;
	begin
		perform public.conferir_chave_coleta('x');
		insert into resultado values ('visitante não confere a chave da coleta', false);
	exception when insufficient_privilege then
		insert into resultado values ('visitante não confere a chave da coleta', true);
	end;
end;
$$;

-- Como pessoa com conta: lê o feed, mas também não escreve.
reset role;
set local role authenticated;
do $$
begin
	begin
		update public.fontes set nome = 'invadido' where id = 'bcb';
		insert into resultado values ('pessoa com conta não muda fontes', false);
	exception when insufficient_privilege then
		insert into resultado values ('pessoa com conta não muda fontes', true);
	end;
end;
$$;

reset role;
insert into resultado
select 'cota: soma até o teto e depois recusa',
	public.somar_cota('teste', '2026-11', 2) and public.somar_cota('teste', '2026-11', 2) and not public.somar_cota('teste', '2026-11', 2);

insert into resultado
select 'chave da coleta existe no cofre e uma chave errada não passa',
	exists (select 1 from vault.secrets where name = 'chave_coleta') and not public.conferir_chave_coleta(repeat('0', 64));

select checagem, ok from resultado order by checagem;
rollback;
