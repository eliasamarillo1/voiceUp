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


def center(W, floor):
    c = W / 2
    return [
        ('sword', c - 40, floor, 170, 14, .2, -16), ('sword', c + 40, floor, 170, 14, -.2, 16),
        ('sword', c - 100, floor, 130, 13, .3, -24), ('sword', c + 100, floor, 130, 13, -.3, 24),
        ('sword', c, floor, 150, 13, .05, 0),
        ('irisbud', c, 404, .9, 0, [(c, floor), (c, 404)]),
        ('iris', c - 64, 470, .74, -8, [(c - 60, floor), (c - 64, 470)], 11),
        ('iris', c + 64, 470, .74, 8, [(c + 60, floor), (c + 64, 470)], 13),
    ]


def wide():
    W, H = 888, 560
    floor = H - 22
    fl = side(W, H, False, floor, 1) + side(W, H, True, floor, 7) + center(W, floor)
    p = build(W, H, None, fl, border=22, cells=64, seed=3, dyn=True)
    st = [g for g, _ in stars(W, H, 14, [(22, 120, 270, 560), (W - 270, 120, W - 22, 560)], 4, 8, 13)]
    g = svg(W, H, p, uid='va', lead=4.0, glows=[(138, 170, 210), (W - 138, 170, 210), (W / 2, 440, 140)], dyn=True, stars=st)
    return 'va', W, H, g


def narrow():
    W, H = 358, 600
    f = H - 15
    fl = [
        ('sword', 50, 206, 150, 13, .3, -24), ('sword', W - 50, 206, 150, 13, -.3, 24),
        ('sword', 150, 206, 110, 11, .2, -12), ('sword', W - 150, 206, 110, 11, -.2, 12),
        ('irisbud', 179, 84, 1.0, 0, [(179, 206), (179, 84)]),
        ('iris', 94, 132, .82, -6, [(94, 214), (94, 132)], 1),
        ('iris', W - 94, 132, .82, 6, [(W - 94, 214), (W - 94, 132)], 7),
        ('sword', 30, f, 120, 12, .3, -30), ('sword', 120, f, 100, 11, .2, -12),
        ('sword', W - 30, f, 120, 12, -.3, 30), ('sword', W - 120, f, 100, 11, -.2, 12),
        ('iris', 66, f - 50, .52, -8, [(66, f), (66, f - 50)], 2),
        ('iris', W - 66, f - 50, .52, 8, [(W - 66, f), (W - 66, f - 50)], 8),
        ('iris', 179, f - 58, .6, 0, [(179, f), (179, f - 58)], 4),
    ]
    p = build(W, H, None, fl, border=15, cells=44, seed=5, dyn=True)
    st = [g for g, _ in stars(W, H, 7, [(20, 40, 160, 230), (W - 160, 40, W - 20, 230), (150, 50, 210, 230)], 4, 6, 9)]
    g = svg(W, H, p, uid='vn', lead=2.8, glows=[(94, 100, 110), (W - 94, 100, 110), (179, f - 70, 90)], dyn=True, stars=st)
    return 'vn', W, H, g


def narrow_short():
    W, H = 358, 330
    f = H - 15
    fl = [
        ('sword', 40, f, 200, 13, .3, -14), ('sword', W - 40, f, 200, 13, -.3, 14),
        ('sword', 130, f, 170, 12, .2, -8), ('sword', W - 130, f, 170, 12, -.2, 8),
        ('sword', 179, f, 150, 12, 0, 0), ('sword', 90, f, 120, 11, .3, -28), ('sword', W - 90, f, 120, 11, -.3, 28),
        ('irisbud', 30, 130, .8, -10, [(42, f), (30, 130)]), ('irisbud', W - 30, 130, .8, 10, [(W - 42, f), (W - 30, 130)]),
        ('iris', 92, 168, .72, -6, [(92, f), (92, 168)], 1),
        ('iris', W - 92, 168, .72, 6, [(W - 92, f), (W - 92, 168)], 7),
        ('iris', 179, 222, .62, 0, [(179, f), (179, 222)], 4),
    ]
    p = build(W, H, None, fl, border=15, cells=30, seed=9, dyn=True)
    st = [g for g, _ in stars(W, H, 4, [(40, 40, 320, 330)], 6, 6, 9)]
    g = svg(W, H, p, uid='vs', lead=2.8, glows=[(92, 120, 110), (W - 92, 120, 110), (179, 190, 90)], dyn=True, stars=st)
    return 'vs', W, H, g


def block(name, doc, a):
    uid, W, H, g = a
    return f'''/** {doc} */
export const {name} = {{
  uid: '{uid}',
  width: {W},
  height: {H},
  svg: {json.dumps(fix(g))},
}};
'''


ts = ('// Generado por scripts/vidriera/export.py. No editar a mano.\n'
      '// Vidriera de lirios: piezas de cristal con plomo. La luz la añade glassLight.ts.\n\n'
      + block('GLASS_WIDE', 'Composición ancha, sin hueco: el título va encima o debajo.', wide()) + '\n'
      + block('GLASS_NARROW', 'Composición de móvil (vertical), con la cartela encima.', narrow()) + '\n'
      + block('GLASS_NARROW_SHORT', 'Composición de móvil baja, con el título debajo.', narrow_short()))
open(OUT, 'w').write(ts)
print(len(ts))
