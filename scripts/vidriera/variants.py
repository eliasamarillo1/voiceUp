"""Dos variantes grandes de la vidriera: A (atardecer) y B (noche con estrellas)."""
import sys, os, json, re, math, random
sys.path.insert(0, os.path.dirname(__file__))
from glass import build, svg, Polygon

SKY_SUNSET = [(0, '#AFC0EE'), (.28, '#D7D3F0'), (.5, '#FBE3B0'), (.66, '#F6D79A'), (.78, '#CFE6C6'), (1, '#A9D3B4')]
SKY_NIGHT = [(0, '#1E2860'), (.35, '#2B3A80'), (.58, '#3B4F93'), (.72, '#2F625C'), (1, '#1E4A43')]


def star(x, y, r):
    pts = []
    for k in range(8):
        a = math.pi / 4 * k
        rr = r if k % 2 == 0 else r * .36
        pts.append((x + rr * math.sin(a), y - rr * math.cos(a)))
    return Polygon(pts)


def stars(W, H, n, avoid, seed, rmin=5, rmax=9):
    rnd = random.Random(seed)
    out = []
    tries = 0
    while len(out) < n and tries < 2000:
        tries += 1
        x, y = rnd.uniform(30, W - 30), rnd.uniform(30, H * .45)
        if any(x0 - 14 < x < x1 + 14 and y0 - 14 < y < y1 + 14 for x0, y0, x1, y1 in avoid):
            continue
        if any(math.hypot(x - a, y - b) < 60 for a, b in [(p[0], p[1]) for p in out]):
            continue
        out.append((x, y, rnd.uniform(rmin, rmax)))
    return [(star(x, y, r), 'amber') for x, y, r in out]


def side(W, H, mirror, floor, sd):
    m = (lambda x: W - x) if mirror else (lambda x: x)
    r = -1 if mirror else 1
    return [
        ('sword', m(110), floor, 380, 20, .12 * r, -5 * r), ('sword', m(150), floor, 340, 18, -.18 * r, 10 * r),
        ('sword', m(80), floor, 300, 17, .3 * r, -16 * r), ('sword', m(190), floor, 260, 16, -.25 * r, 18 * r),
        ('sword', m(40), floor, 200, 15, .35 * r, -24 * r), ('sword', m(240), floor, 180, 14, -.3 * r, 26 * r),
        ('sword', m(130), floor, 230, 14, .2 * r, 4 * r),
        ('irisbud', m(262), 196, 1.0, 10 * r, [(m(232), floor), (m(250), 330), (m(262), 196)]),
        ('irisbud', m(36), 250, 1.1, -14 * r, [(m(62), floor), (m(46), 340), (m(36), 250)]),
        ('iris', m(54), 420, .7, -10 * r, [(m(60), floor), (m(54), 420)], sd + 5),
        ('iris', m(238), 390, 1.0, 8 * r, [(m(222), floor), (m(230), 460), (m(238), 390)], sd + 3),
        ('iris', m(138), 236, 1.45, -3 * r, [(m(128), floor), (m(126), 380), (m(138), 236)], sd),
    ]


def wide(stops, glow, uid, extra_fn=None):
    W, H = 888, 560
    floor = H - 22
    win = (280, 46, W - 280, H - 46)
    fl = side(W, H, False, floor, 1) + side(W, H, True, floor, 7)
    extra = extra_fn(W, H, win) if extra_fn else ()
    p = build(W, H, win, fl, border=22, cells=56, seed=3, rw=6, fw=12, stops=stops, extra=extra)
    g = svg(W, H, p, uid=uid, lead=4.0, glows=[(138, 170, 210), (W - 138, 170, 210)], glow=glow)
    return W, H, win, g


def narrow(stops, glow, uid, extra_fn=None):
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
    extra = extra_fn(W, H, win) if extra_fn else ()
    p = build(W, H, win, fl, border=15, cells=40, seed=5, rw=6, fw=9, stops=stops, extra=extra)
    g = svg(W, H, p, uid=uid, lead=2.8, glows=[(94, 100, 110), (W - 94, 100, 110), (179, f - 70, 90)], glow=glow)
    return W, H, win, g


def fix(x):
    return re.sub(r'^<svg xmlns="http://www.w3.org/2000/svg" width="\d+" height="\d+"',
                  '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"', x)


def ts(wd, nr, note):
    (W, H, a, g), (w2, h2, b, g2) = wd, nr
    return f'''// Generado por scripts/vidriera ({note}). No editar a mano.

/** Composición ancha: tamaño de diseño y hueco de cristal crema para el texto. */
export const GLASS_WIDE = {{
  width: {W},
  height: {H},
  window: {{ x0: {a[0]}, y0: {a[1]}, x1: {a[2]}, y1: {a[3]} }},
  svg: {json.dumps(fix(g))},
}};

/** Composición de móvil (vertical). */
export const GLASS_NARROW = {{
  width: {w2},
  height: {h2},
  window: {{ x0: {b[0]}, y0: {b[1]}, x1: {b[2]}, y1: {b[3]} }},
  svg: {json.dumps(fix(g2))},
}};
'''


if __name__ == '__main__':
    which = sys.argv[1]
    out = sys.argv[2]
    if which == 'A':
        t = ts(wide(SKY_SUNSET, ('#FFF3CF', '#FBD98E'), 'va'), narrow(SKY_SUNSET, ('#FFF3CF', '#FBD98E'), 'vn'), 'variante A, atardecer')
    else:
        st = lambda W, H, win: stars(W, H, 12 if W > 500 else 6, [win], 4, 10, 15)
        t = ts(wide(SKY_NIGHT, ('#FFF1C4', '#F2CF7A'), 'vb', st), narrow(SKY_NIGHT, ('#FFF1C4', '#F2CF7A'), 'vm', st), 'variante B, noche')
    open(out, 'w').write(t)
    print(len(t))
