import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { DESTINO_PADRAO } from './espacos.ts';

/** Vai para /para-voce/tudo substituindo o endereço atual (nunca deixa tela branca). */
export function irParaPadrao(): Promise<void> {
	return goto(resolve('/(app)/[espaco]/[[canal]]', DESTINO_PADRAO), { replace: true });
}
