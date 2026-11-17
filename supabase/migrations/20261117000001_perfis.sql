-- Perfis do Mirante: um por conta. Cada pessoa só lê e muda o próprio perfil (RLS).
create table public.perfis (
	id uuid primary key references auth.users (id) on delete cascade,
	nome text not null default '',
	avatar_url text,
	idioma text not null default 'pt-BR' check (idioma in ('pt-BR', 'en')),
	moeda_principal text not null default 'BRL'
		check (moeda_principal in ('BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'MXN')),
	tema text not null default 'sistema' check (tema in ('sistema', 'claro', 'escuro', 'preto')),
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);

comment on table public.perfis is 'Preferências de cada conta do Mirante. Criado sozinho no primeiro login.';

alter table public.perfis enable row level security;

create policy "perfis: cada um lê o próprio"
	on public.perfis for select
	to authenticated
	using ((select auth.uid()) = id);

create policy "perfis: cada um muda o próprio"
	on public.perfis for update
	to authenticated
	using ((select auth.uid()) = id)
	with check ((select auth.uid()) = id);

-- Sem insert nem delete pelo app: o perfil nasce com a conta e some com ela.
revoke insert, delete, truncate on public.perfis from anon, authenticated;
revoke all on public.perfis from anon;

-- Cria o perfil no primeiro login, com nome e foto que o Google mandar.
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.perfis (id, nome, avatar_url)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
		new.raw_user_meta_data ->> 'avatar_url'
	)
	on conflict (id) do nothing;
	return new;
end;
$$;

revoke execute on function public.criar_perfil() from public, anon, authenticated;

create trigger ao_criar_usuario
	after insert on auth.users
	for each row execute function public.criar_perfil();

-- Mantém atualizado_em em dia.
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	new.atualizado_em := now();
	return new;
end;
$$;

create trigger perfis_atualizado_em
	before update on public.perfis
	for each row execute function public.tocar_atualizado_em();
