-- Personalização das notícias (fase 1B), parte 2: espaço "geral", preferências de cada conta (RLS), as 22
-- fontes dos temas gerais e a limpeza de 30 dias para eles. Separada da 0006 porque troca regras que já existem.

-- Espaço geral -------------------------------------------------------------------------------------
alter table public.fontes drop constraint fontes_espaco_check,
	add constraint fontes_espaco_check check (espaco in ('mercado', 'cripto', 'tecnologia', 'geral'));
alter table public.grupos drop constraint grupos_espaco_check,
	add constraint grupos_espaco_check check (espaco in ('mercado', 'cripto', 'tecnologia', 'geral'));
alter table public.noticias drop constraint noticias_espaco_check,
	add constraint noticias_espaco_check check (espaco in ('mercado', 'cripto', 'tecnologia', 'geral'));

-- Preferências de cada conta ---------------------------------------------------------------------
create table public.preferencias (
	id uuid primary key references auth.users (id) on delete cascade,
	temas text[] not null default '{}' check (cardinality(temas) <= 30),
	temas_proprios text[] not null default '{}' check (cardinality(temas_proprios) <= 5),
	fontes_ocultas text[] not null default '{}' check (cardinality(fontes_ocultas) <= 100),
	palavras_silenciadas text[] not null default '{}' check (cardinality(palavras_silenciadas) <= 50),
	idioma text not null default 'pt-en' check (idioma in ('pt', 'pt-en')),
	escolheu boolean not null default false,
	atualizado_em timestamptz not null default now()
);

comment on table public.preferencias is 'O que cada conta quer ver: temas, temas digitados e filtros.';

alter table public.preferencias enable row level security;

create policy "preferencias: cada um lê as suas" on public.preferencias for select to authenticated
	using ((select auth.uid()) = id);
create policy "preferencias: cada um cria as suas" on public.preferencias for insert to authenticated
	with check ((select auth.uid()) = id);
create policy "preferencias: cada um muda as suas" on public.preferencias for update to authenticated
	using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

revoke delete, truncate on public.preferencias from anon, authenticated;
revoke all on public.preferencias from anon;

create trigger preferencias_atualizado_em
	before update on public.preferencias
	for each row execute function public.tocar_atualizado_em();

-- Fontes dos temas gerais (conferidas em 17/11/2026) ----------------------------------------------
insert into public.fontes (id, nome, site, logo, tipo, endereco, idioma, primaria, espaco, canais) values
	('agencia-brasil-geral', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/geral/feed.xml', 'pt-BR', false, 'geral', '{brasil}'),
	('g1', 'g1', 'https://g1.globo.com', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/', 'pt-BR', false, 'geral', '{brasil}'),
	('agencia-brasil-politica', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/politica/feed.xml', 'pt-BR', false, 'geral', '{politica}'),
	('g1-politica', 'g1 Política', 'https://g1.globo.com/politica/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/politica/', 'pt-BR', false, 'geral', '{politica}'),
	('g1-mundo', 'g1 Mundo', 'https://g1.globo.com/mundo/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/mundo/', 'pt-BR', false, 'geral', '{mundo}'),
	('bbc-brasil', 'BBC News Brasil', 'https://www.bbc.com/portuguese', '/fontes/bbc-brasil.png', 'rss', 'https://feeds.bbci.co.uk/portuguese/rss.xml', 'pt-BR', false, 'geral', '{mundo}'),
	('dw-brasil', 'DW Brasil', 'https://www.dw.com/pt-br', '/fontes/dw-brasil.png', 'rss', 'https://rss.dw.com/xml/rss-br-all', 'pt-BR', false, 'geral', '{mundo}'),
	('ge', 'ge', 'https://ge.globo.com', '/fontes/ge.png', 'rss', 'https://ge.globo.com/rss/ge/', 'pt-BR', false, 'geral', '{esportes}'),
	('agencia-brasil-esportes', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml', 'pt-BR', false, 'geral', '{esportes}'),
	('g1-ciencia', 'g1 Ciência', 'https://g1.globo.com/ciencia/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/ciencia/', 'pt-BR', false, 'geral', '{ciencia}'),
	('pesquisa-fapesp', 'Revista Pesquisa FAPESP', 'https://revistapesquisa.fapesp.br', '/fontes/pesquisa-fapesp.png', 'rss', 'https://revistapesquisa.fapesp.br/feed/', 'pt-BR', false, 'geral', '{ciencia}'),
	('g1-saude', 'g1 Saúde', 'https://g1.globo.com/saude/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/saude/', 'pt-BR', false, 'geral', '{saude}'),
	('agencia-brasil-saude', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/saude/feed.xml', 'pt-BR', false, 'geral', '{saude}'),
	('g1-educacao', 'g1 Educação', 'https://g1.globo.com/educacao/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/educacao/', 'pt-BR', false, 'geral', '{educacao}'),
	('agencia-brasil-educacao', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml', 'pt-BR', false, 'geral', '{educacao}'),
	('g1-pop-arte', 'g1 Pop & Arte', 'https://g1.globo.com/pop-arte/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/pop-arte/', 'pt-BR', false, 'geral', '{cultura}'),
	('agencia-brasil-cultura', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/cultura/feed.xml', 'pt-BR', false, 'geral', '{cultura}'),
	('g1-natureza', 'g1 Natureza', 'https://g1.globo.com/natureza/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/natureza/', 'pt-BR', false, 'geral', '{meio-ambiente}'),
	('agencia-brasil-meio-ambiente', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/meio-ambiente/feed.xml', 'pt-BR', false, 'geral', '{meio-ambiente}'),
	('agencia-brasil-justica', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br', '/fontes/agencia-brasil.png', 'rss', 'https://agenciabrasil.ebc.com.br/rss/justica/feed.xml', 'pt-BR', false, 'geral', '{justica}'),
	('g1-carros', 'g1 Carros', 'https://g1.globo.com/carros/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/carros/', 'pt-BR', false, 'geral', '{carros}'),
	('g1-turismo', 'g1 Turismo e Viagem', 'https://g1.globo.com/turismo-e-viagem/', '/fontes/g1.png', 'rss', 'https://g1.globo.com/rss/g1/turismo-e-viagem/', 'pt-BR', false, 'geral', '{viagem}');

insert into public.estado_fontes (fonte_id)
select id from public.fontes where espaco = 'geral'
on conflict (fonte_id) do nothing;

-- Limpeza diária: temas gerais ficam 30 dias; os outros espaços, 90.
select cron.alter_job(
	(select jobid from cron.job where jobname = 'limpar-noticias'),
	command := $job$
		delete from public.noticias
		where publicado_em < now() - interval '90 days'
			or (espaco = 'geral' and publicado_em < now() - interval '30 days');
		delete from public.grupos g
		where g.criado_em < now() - interval '1 day'
			and not exists (select 1 from public.noticias n where n.grupo_id = g.id);
		delete from cron.job_run_details where end_time < now() - interval '7 days';
	$job$
);
