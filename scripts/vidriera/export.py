import sys, json
sys.path.insert(0, '.')
from glass import build, svg
from glass import build, svg


def hero_svg(W, H, window, flowers, cells, seed, uid, border, lead):
    return svg(W, H, build(W, H, window, flowers, border=border, cells=cells, seed=seed, rw=6, fw=12 if W > 700 else 9), uid=uid, lead=lead)

K = 0.82  # escala horizontal de los laterales para el ancho real de la app (888 px)


def side(W, H, mirror, floor, sd, k=K):
    m = (lambda x: W - x * k) if mirror else (lambda x: x * k)
    r = -1 if mirror else 1
    fs = 0.9
    return [
        ('sword', m(120), floor, 310, 19, .12 * r, -6 * r), ('sword', m(150), floor, 280, 17, -.18 * r, 12 * r),
        ('sword', m(95), floor, 235, 16, .3 * r, -20 * r), ('sword', m(200), floor, 205, 15, -.25 * r, 22 * r),
        ('sword', m(60), floor, 160, 14, .35 * r, -28 * r), ('sword', m(250), floor, 140, 13, -.3 * r, 30 * r),
        ('irisbud', m(56), 290, .95, -12 * r, [(m(76), floor), (m(62), 360), (m(56), 290)]),
        ('iris', m(232), 338, .74, 8 * r, [(m(218), floor), (m(224), 400), (m(232), 338)], sd + 3),
        ('iris', m(138), 196, 1.02, -4 * r, [(m(130), floor), (m(128), 340), (m(138), 196)], sd),
    ]


W, H = 888, 480
floor = H - 22
DW = (252, 42, W - 252, H - 42)
desk = hero_svg(W, H, DW, side(W, H, False, floor, 1) + side(W, H, True, floor, 7), 50, 3, 'vd', 22, 4.0)

MW_, MH = 358, 600
mf = MH - 15
mob_fl = [
    ('sword', 60, 150, 120, 12, .3, -30), ('sword', MW_ - 60, 150, 120, 12, -.3, 30),
    ('iris', 84, 92, .55, -6, [(84, 150), (84, 92)], 1),
    ('iris', MW_ - 84, 92, .55, 6, [(MW_ - 84, 150), (MW_ - 84, 92)], 7),
    ('irisbud', 179, 70, .9, 0, [(179, 150), (179, 70)]),
    ('sword', 40, mf, 90, 12, .3, -35), ('sword', 70, mf, 80, 11, .2, -10),
    ('sword', MW_ - 40, mf, 90, 12, -.3, 35), ('sword', MW_ - 70, mf, 80, 11, -.2, 10),
    ('sword', 150, mf, 70, 10, .2, -20), ('sword', MW_ - 150, mf, 70, 10, -.2, 20),
    ('iris', 179, mf - 40, .42, 0, [(179, mf), (179, mf - 40)], 4),
]
MWIN = (40, 150, MW_ - 40, MH - 112)
mob = hero_svg(MW_, MH, MWIN, mob_fl, 34, 5, 'vm', 15, 3.4)

import re
fix = lambda x: re.sub(r'^<svg xmlns="http://www.w3.org/2000/svg" width="\d+" height="\d+"', '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"', x)
desk, mob = fix(desk), fix(mob)
ts = f'''// Generado por el script de la vidriera (glass.py). No editar a mano.
// Vidriera de lirios: piezas de cristal con plomo, cielo arriba y prado abajo.

/** Composición ancha: tamaño de diseño y hueco de cristal crema para el texto. */
export const GLASS_WIDE = {{
  width: {W},
  height: {H},
  window: {{ x0: {DW[0]}, y0: {DW[1]}, x1: {DW[2]}, y1: {DW[3]} }},
  svg: {json.dumps(desk)},
}};

/** Composición de móvil (vertical). */
export const GLASS_NARROW = {{
  width: {MW_},
  height: {MH},
  window: {{ x0: {MWIN[0]}, y0: {MWIN[1]}, x1: {MWIN[2]}, y1: {MWIN[3]} }},
  svg: {json.dumps(mob)},
}};
'''
open(__import__('os').path.join(__import__('os').path.dirname(__file__), '../../src/components/stainedGlassArt.ts'), 'w').write(ts)
print(len(ts))
