-- Teste das regras de acesso de public.perfis. Roda numa transação e desfaz tudo no fim.
-- Cada linha do resultado deve ter ok = true.
begin;

create temporary table resultado (checagem text, ok boolean) on commit drop;
grant all on resultado to authenticated, anon;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
	('00000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@teste.invalid', '{"full_name":"Pessoa A"}', now(), now()),
	('00000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@teste.invalid', '{"full_name":"Pessoa B"}', now(), now());

insert into resultado
select 'gatilho cria os dois perfis com o nome do Google',
	(select count(*) from public.perfis where id in ('00000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-00000000000b') and nome like 'Pessoa %') = 2;

-- Como a pessoa A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);

insert into resultado select 'A vê só o próprio perfil', (select count(*) from public.perfis) = 1
	and (select id from public.perfis limit 1) = '00000000-0000-4000-8000-00000000000a';

with mudou as (
	update public.perfis set nome = 'invadido' where id = '00000000-0000-4000-8000-00000000000b' returning 1
)
insert into resultado select 'A não muda o perfil de B', (select count(*) from mudou) = 0;

with mudou as (
	update public.perfis set tema = 'preto' where id = '00000000-0000-4000-8000-00000000000a' returning 1
)
insert into resultado select 'A muda o próprio perfil', (select count(*) from mudou) = 1;

do $$
begin
	begin
		insert into public.perfis (id) values ('00000000-0000-4000-8000-00000000000c');
		insert into resultado values ('A não cria perfil', false);
	exception when insufficient_privilege then
		insert into resultado values ('A não cria perfil', true);
	end;
	begin
		delete from public.perfis where id = '00000000-0000-4000-8000-00000000000a';
		insert into resultado values ('A não apaga perfil', false);
	exception when insufficient_privilege then
		insert into resultado values ('A não apaga perfil', true);
	end;
end;
$$;

-- Como visitante (sem conta).
reset role;
set local role anon;
do $$
begin
	begin
		perform 1 from public.perfis;
		insert into resultado values ('visitante não lê perfis', false);
	exception when insufficient_privilege then
		insert into resultado values ('visitante não lê perfis', true);
	end;
end;
$$;

reset role;
select checagem, ok from resultado order by checagem;
rollback;
