-- Notícias do Mirante (fase 1A): fontes conferidas, estado da coleta, grupos (um fato = um cartão),
-- notícias e contadores de cota. Leitura pública; escrita só pelo servidor (a coleta).

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Fontes ------------------------------------------------------------------------------------------
create table public.fontes (
	id text primary key check (id ~ '^[a-z0-9-]+$'),
	nome text not null,
	site text not null,
	logo text,
	tipo text not null check (tipo in ('rss', 'atom', 'ibge')),
	endereco text not null,
	idioma text not null check (idioma in ('pt-BR', 'en')),
	primaria boolean not null default false,
	espaco text not null check (espaco in ('mercado', 'cripto', 'tecnologia')),
	canais text[] not null default '{}',
	intervalo_min integer not null default 10 check (intervalo_min between 5 and 1440),
	ativa boolean not null default true
);

comment on table public.fontes is 'Fontes conferidas (RSS, Atom ou API oficial). Só título, trecho e link de cada notícia.';

create table public.estado_fontes (
	fonte_id text primary key references public.fontes (id) on delete cascade,
	etag text,
	modificado text,
	ultima_coleta timestamptz,
	proxima_coleta timestamptz not null default now(),
	erros_seguidos integer not null default 0,
	ultimo_erro text,
	itens_ultima integer
);

comment on table public.estado_fontes is 'Estado da coleta de cada fonte: cache (ETag, Last-Modified), agenda e erros.';

-- Grupos e notícias -------------------------------------------------------------------------------
create table public.grupos (
	id bigint generated always as identity primary key,
	titulo text not null,
	espaco text not null check (espaco in ('mercado', 'cripto', 'tecnologia')),
	canais text[] not null default '{}',
	n_fontes integer not null default 0,
	primaria boolean not null default false,
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now()
);

comment on table public.grupos is 'Um fato: as notícias de várias fontes sobre a mesma história viram um cartão só.';

create index grupos_espaco_atualizado on public.grupos (espaco, atualizado_em desc);
create index grupos_canais on public.grupos using gin (canais);

create table public.noticias (
	id bigint generated always as identity primary key,
	grupo_id bigint not null references public.grupos (id) on delete cascade,
	fonte_id text not null references public.fontes (id) on delete cascade,
	url text not null unique,
	titulo text not null,
	trecho text not null default '',
	publicado_em timestamptz not null,
	coletado_em timestamptz not null default now(),
	idioma text not null check (idioma in ('pt-BR', 'en')),
	espaco text not null check (espaco in ('mercado', 'cripto', 'tecnologia')),
	canais text[] not null default '{}',
	assinatura text[] not null default '{}'
);

comment on table public.noticias is 'Cada notícia coletada (URL canônica única), ligada ao grupo do seu fato.';

create index noticias_grupo on public.noticias (grupo_id);
create index noticias_fonte on public.noticias (fonte_id);
create index noticias_publicado on public.noticias (publicado_em desc);
create index noticias_coletado on public.noticias (coletado_em desc);

-- Guardião de cotas -------------------------------------------------------------------------------
create table public.contadores_cota (
	servico text not null,
	periodo text not null,
	usados integer not null default 0,
	teto integer not null,
	primary key (servico, periodo)
);

comment on table public.contadores_cota is 'Uso de cada serviço grátis por período, com teto abaixo do limite oficial.';

-- Acesso: leitura pública, escrita só do servidor -----------------------------------------------
alter table public.fontes enable row level security;
alter table public.estado_fontes enable row level security;
alter table public.grupos enable row level security;
alter table public.noticias enable row level security;
alter table public.contadores_cota enable row level security;

create policy "fontes: todos leem" on public.fontes for select to anon, authenticated using (true);
create policy "grupos: todos leem" on public.grupos for select to anon, authenticated using (true);
create policy "noticias: todos leem" on public.noticias for select to anon, authenticated using (true);
create policy "estado_fontes: só o servidor" on public.estado_fontes for all to service_role using (true) with check (true);
create policy "contadores_cota: só o servidor" on public.contadores_cota for all to service_role using (true) with check (true);

revoke insert, update, delete, truncate on public.fontes, public.grupos, public.noticias from anon, authenticated;
revoke all on public.estado_fontes, public.contadores_cota from anon, authenticated;

-- Cada notícia nova atualiza os números do seu grupo ---------------------------------------------
create or replace function public.atualizar_grupo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	update public.grupos g
	set n_fontes = s.n_fontes,
		primaria = s.primaria,
		atualizado_em = s.ultima,
		canais = s.canais
	from (
		select count(distinct n.fonte_id)::integer as n_fontes,
			bool_or(f.primaria) as primaria,
			max(n.publicado_em) as ultima,
			array(
				select distinct c
				from public.noticias n2, unnest(n2.canais) as c
				where n2.grupo_id = new.grupo_id
				order by c
			) as canais
		from public.noticias n
		join public.fontes f on f.id = n.fonte_id
		where n.grupo_id = new.grupo_id
	) s
	where g.id = new.grupo_id;
	return null;
end;
$$;

revoke execute on function public.atualizar_grupo() from public, anon, authenticated;

create trigger noticias_atualizam_grupo
	after insert on public.noticias
	for each row execute function public.atualizar_grupo();

-- Feed: cada grupo vira um cartão -----------------------------------------------------------------
-- Canal geral (nulo, manchetes ou visao-geral): os fatos das últimas 72 h, mais cobertos e oficiais
-- primeiro; depois os mais antigos. Outro canal: os do canal, do mais novo para o mais antigo.
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
	escolhidos as (
		select g.id,
			g.canais,
			case
				when geral.sim then
					extract(epoch from g.atualizado_em) / 3600
					+ 4 * ln(greatest(g.n_fontes, 1))
					+ case when g.primaria then 3 else 0 end
					- case when g.atualizado_em > now() - interval '72 hours' then 0 else 100000 end
				else extract(epoch from g.atualizado_em) / 3600
			end as nota
		from public.grupos g, geral
		where g.espaco = p_espaco
			and g.n_fontes > 0
			and g.atualizado_em > now() - interval '90 days'
			and (geral.sim or p_canal = any (g.canais))
		order by nota desc
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

-- Funções só do servidor --------------------------------------------------------------------------
create or replace function public.somar_cota(p_servico text, p_periodo text, p_teto integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_usados integer;
begin
	insert into public.contadores_cota as c (servico, periodo, usados, teto)
	values (p_servico, p_periodo, 1, p_teto)
	on conflict (servico, periodo) do update set usados = c.usados + 1, teto = excluded.teto
	returning usados into v_usados;
	return v_usados <= p_teto;
end;
$$;

revoke execute on function public.somar_cota(text, text, integer) from public, anon, authenticated;
grant execute on function public.somar_cota(text, text, integer) to service_role;

create or replace function public.conferir_chave_coleta(p_chave text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select coalesce(length(p_chave) >= 32, false) and exists (
		select 1 from vault.decrypted_secrets where name = 'chave_coleta' and decrypted_secret = p_chave
	);
$$;

revoke execute on function public.conferir_chave_coleta(text) from public, anon, authenticated;
grant execute on function public.conferir_chave_coleta(text) to service_role;

-- A chave da coleta nasce aqui, no cofre, e nunca sai do banco.
do $$
begin
	if not exists (select 1 from vault.secrets where name = 'chave_coleta') then
		perform vault.create_secret(
			encode(extensions.gen_random_bytes(32), 'hex'),
			'chave_coleta',
			'Chave da coleta agendada de notícias (pg_cron -> Edge Function coletar)'
		);
	end if;
end;
$$;

-- Fontes conferidas em 17/11/2026 -----------------------------------------------------------------
insert into public.fontes (id, nome, site, logo, tipo, endereco, idioma, primaria, espaco, canais) values
	('bcb', 'Banco Central do Brasil', 'https://www.bcb.gov.br', '/fontes/bcb.png', 'atom', 'https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/noticias', 'pt-BR', true, 'mercado', '{brasil,macro}'),
	('ibge', 'IBGE', 'https://agenciadenoticias.ibge.gov.br', '/fontes/ibge.png', 'ibge', 'https://servicodados.ibge.gov.br/api/v3/noticias/?qtd=20', 'pt-BR', true, 'mercado', '{brasil,macro}'),
	('fed', 'Federal Reserve', 'https://www.federalreserve.gov', '/fontes/fed.png', 'rss', 'https://www.federalreserve.gov/feeds/press_all.xml', 'en', true, 'mercado', '{eua,macro}'),
	('bce', 'Banco Central Europeu', 'https://www.ecb.europa.eu', '/fontes/bce.png', 'rss', 'https://www.ecb.europa.eu/rss/press.html', 'en', true, 'mercado', '{mundo,macro}'),
	('agencia-brasil-economia', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml', 'pt-BR', false, 'mercado', '{brasil}'),
	('agencia-brasil-internacional', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml', 'pt-BR', false, 'mercado', '{mundo}'),
	('infomoney', 'InfoMoney', 'https://www.infomoney.com.br', '/fontes/infomoney.png', 'rss', 'https://www.infomoney.com.br/feed/', 'pt-BR', false, 'mercado', '{brasil}'),
	('money-times', 'Money Times', 'https://www.moneytimes.com.br', '/fontes/money-times.png', 'rss', 'https://www.moneytimes.com.br/feed/', 'pt-BR', false, 'mercado', '{brasil}'),
	('g1-economia', 'g1 Economia', 'https://g1.globo.com/economia/', '/fontes/g1-economia.png', 'rss', 'https://g1.globo.com/rss/g1/economia/', 'pt-BR', false, 'mercado', '{brasil}'),
	('coindesk', 'CoinDesk', 'https://www.coindesk.com', '/fontes/coindesk.png', 'rss', 'https://www.coindesk.com/arc/outboundfeeds/rss/', 'en', false, 'cripto', '{noticias}'),
	('cointelegraph', 'Cointelegraph', 'https://cointelegraph.com', '/fontes/cointelegraph.png', 'rss', 'https://cointelegraph.com/rss', 'en', false, 'cripto', '{noticias}'),
	('livecoins', 'Livecoins', 'https://livecoins.com.br', '/fontes/livecoins.png', 'rss', 'https://livecoins.com.br/feed/', 'pt-BR', false, 'cripto', '{noticias}'),
	('portal-do-bitcoin', 'Portal do Bitcoin', 'https://portaldobitcoin.uol.com.br', '/fontes/portal-do-bitcoin.png', 'rss', 'https://portaldobitcoin.uol.com.br/feed/', 'pt-BR', false, 'cripto', '{noticias}'),
	('tecnoblog', 'Tecnoblog', 'https://tecnoblog.net', '/fontes/tecnoblog.png', 'rss', 'https://tecnoblog.net/feed/', 'pt-BR', false, 'tecnologia', '{}'),
	('canaltech', 'Canaltech', 'https://canaltech.com.br', '/fontes/canaltech.png', 'rss', 'https://canaltech.com.br/rss/', 'pt-BR', false, 'tecnologia', '{}'),
	('olhar-digital', 'Olhar Digital', 'https://olhardigital.com.br', '/fontes/olhar-digital.png', 'rss', 'https://olhardigital.com.br/feed/', 'pt-BR', false, 'tecnologia', '{}'),
	('the-verge', 'The Verge', 'https://www.theverge.com', '/fontes/the-verge.png', 'atom', 'https://www.theverge.com/rss/index.xml', 'en', false, 'tecnologia', '{}'),
	('ars-technica', 'Ars Technica', 'https://arstechnica.com', '/fontes/ars-technica.png', 'rss', 'https://feeds.arstechnica.com/arstechnica/index', 'en', false, 'tecnologia', '{}'),
	('techcrunch-ia', 'TechCrunch', 'https://techcrunch.com', '/fontes/techcrunch.png', 'rss', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'en', false, 'tecnologia', '{ia}');

insert into public.estado_fontes (fonte_id) select id from public.fontes;

-- Limpeza diária (03:17 em Brasília): notícias com mais de 90 dias, grupos vazios e histórico do cron.
select cron.schedule(
	'limpar-noticias',
	'17 6 * * *',
	$job$
		delete from public.noticias where publicado_em < now() - interval '90 days';
		delete from public.grupos g
		where g.criado_em < now() - interval '1 day'
			and not exists (select 1 from public.noticias n where n.grupo_id = g.id);
		delete from cron.job_run_details where end_time < now() - interval '7 days';
	$job$
);
