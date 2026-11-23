"""Genera src/components/stainedGlassArt.ts: la vidriera de lirios sin luz fija.

El cielo, el sol, el halo, la noche y las estrellas se definen en la app
(src/components/glassLight.ts) según la hora del visitante; aquí se deja el
marcador %%LIGHT%% dentro de <defs>.

    pip install shapely numpy
    python3 scripts/vidriera/export.py
"""
import os, sys, json, re
sys.path.insert(0, os.path.dirname(__file__))
from glass import build, svg
from variants import side, stars

OUT = os.path.join(os.path.dirname(__file__), '../../src/components/stainedGlassArt.ts')


def fix(x):
    return re.sub(r'^<svg xmlns="http://www.w3.org/2000/svg" width="\d+" height="\d+"',
                  '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"', x)


def wide():
    W, H = 888, 560
    floor = H - 22
    win = (280, 46, W - 280, H - 46)
    fl = side(W, H, False, floor, 1) + side(W, H, True, floor, 7)
    p = build(W, H, win, fl, border=22, cells=56, seed=3, rw=6, fw=12, dyn=True)
    st = [g for g, _ in stars(W, H, 12, [win, (22, 120, 270, 560), (W - 270, 120, W - 22, 560)], 4, 8, 13)]
    g = svg(W, H, p, uid='va', lead=4.0, glows=[(138, 170, 210), (W - 138, 170, 210)], dyn=True, win=win, stars=st)
    return 'va', W, H, win, g


def narrow():
    W, H = 358, 660
    f = H - 15
    win = (34, 206, W - 34, H - 132)
    fl = [
        ('sword', 50, 206, 150, 13, .3, -24), ('sword', W - 50, 206, 150, 13, -.3, 24),
        ('sword', 150, 206, 110, 11, .2, -12), ('sword', W - 150, 206, 110, 11, -.2, 12),
        ('irisbud', 179, 84, 1.0, 0, [(179, 206), (179, 84)]),
        ('iris', 94, 132, .82, -6, [(94, 206), (94, 132)], 1),
        ('iris', W - 94, 132, .82, 6, [(W - 94, 206), (W - 94, 132)], 7),
        ('sword', 30, f, 110, 12, .3, -30), ('sword', 120, f, 90, 11, .2, -12),
        ('sword', W - 30, f, 110, 12, -.3, 30), ('sword', W - 120, f, 90, 11, -.2, 12),
        ('iris', 66, f - 44, .5, -8, [(66, f), (66, f - 44)], 2),
        ('iris', W - 66, f - 44, .5, 8, [(W - 66, f), (W - 66, f - 44)], 8),
        ('iris', 179, f - 50, .58, 0, [(179, f), (179, f - 50)], 4),
    ]
    p = build(W, H, win, fl, border=15, cells=40, seed=5, rw=6, fw=9, dyn=True)
    st = [g for g, _ in stars(W, H, 5, [win, (20, 40, 160, 206), (W - 160, 40, W - 20, 206), (150, 50, 210, 206)], 4, 6, 9)]
    g = svg(W, H, p, uid='vn', lead=2.8, glows=[(94, 100, 110), (W - 94, 100, 110), (179, f - 70, 90)], dyn=True, win=win, stars=st)
    return 'vn', W, H, win, g


def block(name, doc, a):
    uid, W, H, w, g = a
    return f'''/** {doc} */
export const {name} = {{
  uid: '{uid}',
  width: {W},
  height: {H},
  window: {{ x0: {w[0]}, y0: {w[1]}, x1: {w[2]}, y1: {w[3]} }},
  svg: {json.dumps(fix(g))},
}};
'''


ts = ('// Generado por scripts/vidriera/export.py. No editar a mano.\n'
      '// Vidriera de lirios: piezas de cristal con plomo. La luz la añade glassLight.ts.\n\n'
      + block('GLASS_WIDE', 'Composición ancha: tamaño de diseño y hueco de cristal crema para el texto.', wide()) + '\n'
      + block('GLASS_NARROW', 'Composición de móvil (vertical).', narrow()))
open(OUT, 'w').write(ts)
print(len(ts))
