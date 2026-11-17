-- Coleta agendada: a cada 5 minutos o banco chama a Edge Function "coletar" com a chave do cofre.
-- A chave é lida dentro do próprio job e nunca aparece no código nem nos registros.
select cron.schedule(
	'coletar-noticias',
	'*/5 * * * *',
	$job$
		select net.http_post(
			url := 'https://dzrdbeulimgzdcinukch.supabase.co/functions/v1/coletar',
			headers := jsonb_build_object(
				'Content-Type', 'application/json',
				'x-mirante-chave', (select decrypted_secret from vault.decrypted_secrets where name = 'chave_coleta')
			),
			body := '{}'::jsonb,
			timeout_milliseconds := 60000
		);
	$job$
);
