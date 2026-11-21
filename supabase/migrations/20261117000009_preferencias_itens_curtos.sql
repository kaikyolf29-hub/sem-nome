-- Cada item das listas de preferências tem no máximo 60 letras. Sem isso, uma conta podia gravar
-- textos enormes e ir enchendo o banco grátis (500 MB). O app já limita os termos a 40.

create or replace function public.itens_curtos(p_itens text[], p_max integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
	select coalesce(bool_and(char_length(x) <= p_max), true) from unnest(p_itens) as x
$$;

alter table public.preferencias
	add constraint preferencias_itens_curtos check (
		public.itens_curtos(temas, 60)
		and public.itens_curtos(temas_proprios, 60)
		and public.itens_curtos(fontes_ocultas, 60)
		and public.itens_curtos(palavras_silenciadas, 60)
	);
