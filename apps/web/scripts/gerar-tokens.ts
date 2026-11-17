import { writeFileSync } from 'node:fs';
import { gerarCss } from '../src/lib/design/gerar-css.ts';

writeFileSync(new URL('../src/lib/design/tokens.gerado.css', import.meta.url), gerarCss());
console.log('tokens.gerado.css atualizado');
