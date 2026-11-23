import { createElement } from 'react';

/** En la web, el SVG de la vidriera se inserta tal cual (gradientes, textura y plomo incluidos). */
export function GlassArt({ svg }: { svg: string }) {
  return createElement('div', {
    'aria-hidden': true,
    style: { position: 'absolute', inset: 0, pointerEvents: 'none', lineHeight: 0 },
    dangerouslySetInnerHTML: { __html: svg },
  });
}
