"""Vidriera floral: piezas de cristal (polígonos) separadas por plomo."""
import math, random
import numpy as np
from shapely.geometry import Polygon, Point, LineString, MultiPoint, box
from shapely.ops import unary_union, voronoi_diagram, split
from shapely import affinity, make_valid

LEAD = '#34323A'

# paleta Tiffany suave
PAL = {
    'ruby': ['#C2415E', '#D4586F', '#B8384F'],
    'rose': ['#E48A9C', '#EC9FAE', '#DD7B8F'],
    'amber': ['#E7A93E', '#EDB955', '#DD9A30'],
    'violet': ['#5E54AE', '#7065BE', '#544A9E'],
    'lilac': ['#9E92D6', '#ADA2DE', '#9184CB'],
    'leaf': ['#3E8A7E', '#47958A', '#367C71'],
    'leafl': ['#79B3A5', '#86BCAF', '#6DA89A'],
    'stem': ['#3A7F73'],
    'irisl': ['#7F8DDB', '#8996DF', '#7584D4'],
    'irisd': ['#3D47B0', '#4450B8', '#3842A6'],
    'signal': ['#F4F3FB', '#EEF0FA'],
    'irisv': ['#C3C9F0', '#CBD0F3'],
    'style': ['#B9C1EE', '#C3CAF1'],
    'bg': ['#E6F0EC', '#EDF1E4', '#E4ECF2', '#F1EEDD', '#EAF0E9', '#E8EDF4'],
    'bgdeep': ['#CFE2DA', '#D7DEEF', '#EADFB9', '#D3E4D6'],
    'border': ['#3E7F86', '#4A8F95', '#356F76'],
    'border2': ['#2F5E8F', '#3B6CA0'],
    'cream': ['#FBF7EC'],
    'wband': ['#E8D7A6', '#EAD9AC'],
    'jewel': ['#E7A93E'],
}


def bez(p0, p1, p2, p3, n=24):
    out = []
    for i in range(n + 1):
        t = i / n
        a = (1 - t) ** 3; b = 3 * (1 - t) ** 2 * t; c = 3 * (1 - t) * t * t; d = t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return out


def place(poly, x, y, s=1.0, rot=0):
    poly = affinity.scale(poly, s, s, origin=(0, 0))
    poly = affinity.rotate(poly, rot, origin=(0, 0))
    return affinity.translate(poly, x, y)


def tulip_head(w, h):
    """Tres pétalos: izquierdo, derecho delante y el central detrás. Base en (0,0), hacia arriba (-y)."""
    L = Polygon(bez((0, 0), (-w * .75, -h * .05), (-w * .7, -h * .7), (-w * .42, -h * 1.02))
                + bez((-w * .42, -h * 1.02), (-w * .25, -h * .7), (-w * .1, -h * .4), (w * .04, -h * .18))[1:])
    R = affinity.scale(L, -1, 1, origin=(0, 0))
    M = Polygon(bez((-w * .3, -h * .3), (-w * .32, -h * .8), (-w * .1, -h * 1.0), (0, -h * 1.12))
                + bez((0, -h * 1.12), (w * .1, -h * 1.0), (w * .32, -h * .8), (w * .3, -h * .3))[1:]
                + [(0, -h * .05)])
    M = M.difference(L.union(R))
    spine = LineString(bez((w * .3, h * .25), (-w * .2, -h * .3), (-w * .45, -h * .7), (-w * .48, -h * 1.3), 16))
    parts = []
    for P, sp in ((L, spine), (R, affinity.scale(spine, -1, 1, origin=(0, 0)))):
        pieces = [g for g in split(P, sp).geoms if g.area > 20]
        pieces.sort(key=lambda g: abs(g.centroid.x))
        if len(pieces) == 2:
            parts += [(pieces[1], ''), (pieces[0], '_l')]
        else:
            parts += [(P, '')]
    return parts + [(M, '_m')]


def leaf(length, width, bend=0.25):
    """Hoja lanceolada desde (0,0) hacia arriba, partida por el nervio en dos cristales."""
    tip = (length * bend, -length)
    a = bez((0, 0), (-width, -length * .3), (-width * .6 + length * bend * .5, -length * .75), tip)
    b = bez(tip, (width * .9 + length * bend * .6, -length * .7), (width * 1.1, -length * .25), (0, 0))
    whole = Polygon(a + b[1:])
    vein = bez((0, 0), (length * bend * .1, -length * .4), (length * bend * .6, -length * .8), tip, 12)
    left = Polygon(a + list(reversed(vein))[1:-1])
    right = whole.difference(left).buffer(0)
    return [left.buffer(0), right]


def smooth(points, n=16):
    if len(points) < 3:
        return points
    P = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            out.append(tuple(.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t
                             + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in (0, 1)))
    out.append(points[-1])
    return out


def stem(points, width):
    return LineString(smooth(points)).buffer(width / 2, cap_style=2, join_style=1)


def round_flower(r, petals=6):
    parts = []
    center = Point(0, 0).buffer(r * .3, 24)
    for k in range(petals):
        ang = 2 * math.pi * k / petals
        p = Point(0, 0).buffer(1, 24)
        p = affinity.scale(p, r * .32, r * .52)
        p = affinity.translate(p, 0, -r * .6)
        p = affinity.rotate(p, math.degrees(ang), origin=(0, 0))
        parts.append(p.difference(center))
    return parts, center


def lloyd(region, n, seed, iters=4):
    rng = np.random.default_rng(seed)
    minx, miny, maxx, maxy = region.bounds
    pts = []
    while len(pts) < n:
        x, y = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
        if region.contains(Point(x, y)):
            pts.append((x, y))
    for _ in range(iters):
        cells = voronoi_diagram(MultiPoint(pts), envelope=region.envelope.buffer(200))
        new = []
        for c in cells.geoms:
            ci = c.intersection(region)
            if not ci.is_empty and ci.area > 1:
                new.append((ci.centroid.x, ci.centroid.y))
        pts = new
    cells = voronoi_diagram(MultiPoint(pts), envelope=region.envelope.buffer(200))
    return [c for c in cells.geoms]


def polys(g):
    if g.is_empty:
        return []
    if g.geom_type == 'Polygon':
        return [g]
    return [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']


def merge_slivers(pieces, min_area):
    """Une las piezas diminutas a su vecina con el borde común más largo."""
    changed = True
    while changed:
        changed = False
        for i, (p, c) in enumerate(pieces):
            if p.area < min_area:
                best, bl = None, 0
                for j, (q, d) in enumerate(pieces):
                    if j == i:
                        continue
                    l = p.buffer(0.6).intersection(q).area
                    if l > bl:
                        best, bl = j, l
                if best is not None:
                    q, d = pieces[best]
                    pieces[best] = (unary_union([q, p]).buffer(0.3).buffer(-0.3), d)
                    pieces.pop(i)
                    changed = True
                    break
    return pieces


def path_d(poly):
    def ring(r):
        cs = list(r.coords)
        out = []
        for x, y in cs[:-1]:
            t = f'{round(x)} {round(y)}'
            if not out or out[-1] != t:
                out.append(t)
        return 'M' + 'L'.join(out) + 'Z'
    return ''.join(ring(p.exterior) + ''.join(ring(i) for i in p.interiors) for p in polys(poly))


def mix(a, b, t):
    pa = [int(a[i:i + 2], 16) for i in (1, 3, 5)]; pb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{int(x + (y - x) * t):02X}' for x, y in zip(pa, pb))


def sky(t, rnd):
    stops = [(0, '#C4D4F0'), (.3, '#D9DDF4'), (.55, '#F4ECD2'), (.72, '#D6E9CF'), (1, '#B9D8BE')]
    for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
        if t <= t1:
            c = mix(c0, c1, (t - t0) / (t1 - t0)); break
    c = shade(c, rnd.uniform(-.07, .02) if rnd.random() < .3 else rnd.uniform(-.02, .05))
    return c


def build(W, H, window, flowers, border=22, seed=3, cells=60, rw=16, fw=12):
    """window: (x0,y0,x1,y1) cristal crema para el texto. flowers: lista de (kind, x, y, scale, rot, colors)."""
    rnd = random.Random(seed)
    pieces = []  # (polygon, colorkey)
    outer = box(0, 0, W, H)
    inner = box(border, border, W - border, H - border)
    # cenefa: tramos alternos y cuadrados en las esquinas con cabujón
    band = outer.difference(inner)
    corners = [box(0, 0, border, border), box(W - border, 0, W, border), box(0, H - border, border, H), box(W - border, H - border, W, H)]
    segs = []
    seglen = 96
    for x in np.arange(border, W - border, seglen):
        segs.append(box(x, 0, min(x + seglen, W - border), border))
        segs.append(box(x, H - border, min(x + seglen, W - border), H))
    for y in np.arange(border, H - border, seglen):
        segs.append(box(0, y, border, min(y + seglen, H - border)))
        segs.append(box(W - border, y, W, min(y + seglen, H - border)))
    for k, s in enumerate(segs):
        pieces.append((s.intersection(band), 'border'))
    for c in corners:
        pieces.append((c, 'border2'))
        cx, cy = c.centroid.x, c.centroid.y
        pieces.append((Point(cx, cy).buffer(border * .26, 20), 'jewel'))
    # cristal central (ventana del texto)
    x0, y0, x1, y1 = window
    win = box(x0, y0, x1, y1).buffer(rw, join_style=1).buffer(-rw, join_style=1) if rw else box(x0, y0, x1, y1)
    win = win.intersection(inner)
    wfr = box(x0, y0, x1, y1)
    wcore = box(x0 + fw, y0 + fw, x1 - fw, y1 - fw)
    wband = []
    for (ax, ay) in ((x0, y0), (x1 - fw, y0), (x0, y1 - fw), (x1 - fw, y1 - fw)):
        wband.append((box(ax, ay, ax + fw, ay + fw), 'amber'))
    wband += [(box(x0 + fw, y0, x1 - fw, y0 + fw), 'wband'), (box(x0 + fw, y1 - fw, x1 - fw, y1), 'wband'),
              (box(x0, y0 + fw, x0 + fw, y1 - fw), 'wband'), (box(x1 - fw, y0 + fw, x1, y1 - fw), 'wband')]
    win = wfr
    # flores
    fl = []
    for f in flowers:
        kind = f[0]
        if kind == 'tulip':
            _, bx, by, s, rot, col, stem_pts, leaves = f
            for p, suf in tulip_head(46, 70):
                fl.append((place(p, bx, by, s, rot), col + suf))
            fl.append((stem(stem_pts, 8 * s), 'stem'))
            for (lx, ly, ll, lw, lb, lrot) in leaves:
                a, b = leaf(ll, lw, lb)
                fl.append((place(a, lx, ly, 1, lrot), 'leaf'))
                fl.append((place(b, lx, ly, 1, lrot), 'leafl'))
        elif kind == 'round':
            _, bx, by, r, col = f
            parts, center = round_flower(r)
            for k, p in enumerate(parts):
                fl.append((affinity.translate(p, bx, by), col + ('_l' if k % 2 else '')))
            fl.append((affinity.translate(center, bx, by), 'amber'))
        elif kind == 'iris':
            _, bx, by, s, rot, stem_pts, sd = f
            fl.append((stem(stem_pts, 7 * s), 'stem'))
            for p, k in iris_flower(sd):
                fl.append((place(p, bx, by, s, rot), k))
        elif kind == 'irisbud':
            _, bx, by, s, rot, stem_pts = f
            fl.append((stem(stem_pts, 6 * s), 'stem'))
            for p, k in iris_bud():
                fl.append((place(p, bx, by, s, rot), k))
        elif kind == 'sword':
            _, bx, by, ll, lw, lb, lrot = f
            a, b = leaf(ll, lw, lb)
            fl.append((place(a, bx, by, 1, lrot), 'leaf'))
            fl.append((place(b, bx, by, 1, lrot), 'leafl'))
        elif kind == 'grass':
            _, bx, by, ll, rot = f
            a, b = leaf(ll, ll * .15, .12)
            fl.append((place(unary_union([a, b]).buffer(0), bx, by, 1, rot), 'leaf'))
        elif kind == 'bud':
            _, bx, by, s, rot, col, stem_pts = f
            b = Polygon(bez((0, 0), (-16, -8), (-12, -30), (0, -40)) + bez((0, -40), (12, -30), (16, -8), (0, 0))[1:])
            fl.append((place(b, bx, by, s, rot), col))
            fl.append((stem(stem_pts, 6 * s), 'stem'))
    # orden de pintura: lo último tapa lo anterior
    taken = win
    final_fl = []
    for p, c in reversed(fl):
        p = make_valid(p).buffer(0)
        p = p.intersection(inner).difference(taken).buffer(0)
        for q in polys(p):
            if q.area > 4:
                final_fl.append((q, c))
        taken = taken.union(p)
    # fondo: mosaico de Voronoi relajado
    bg = inner.difference(taken)
    vor = lloyd(inner.difference(win), cells, seed)
    bgp = []
    for c in vor:
        g = c.intersection(bg)
        for q in polys(g):
            bgp.append((q, sky(q.centroid.y / H, rnd)))
    bgp = merge_slivers(bgp, 260)
    pieces += bgp + final_fl
    pieces += wband
    pieces.append((wcore, 'cream'))
    return pieces


def svg(W, H, pieces, seed=5, lead=4.2, uid='g'):
    rnd = random.Random(seed)
    defs = [f'''<filter id="{uid}tex" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.035 0.06" numOctaves="2" seed="4"/>
<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.35"/></filter>
<radialGradient id="{uid}light" cx="30%" cy="18%" r="85%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/>
<stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1c1a30" stop-opacity=".10"/></radialGradient>''']
    grads = {}

    def fill(key):
        k = key.replace('_m', '').replace('_l', '')
        base = k if k.startswith('#') else rnd.choice(PAL[k])
        if key.endswith('_m'):  # pétalo central algo más oscuro
            base = shade(base, -0.12)
        if key.endswith('_l'):  # cara iluminada del pétalo
            base = shade(base, 0.2)
        if key in ('cream',):
            return base
        ang = rnd.choice([20, 60, 110, 150])
        gid = f'{uid}{base[1:]}{ang}'
        if gid not in grads:
            a = math.radians(ang)
            x1, y1 = .5 - .5 * math.cos(a), .5 - .5 * math.sin(a)
            grads[gid] = (f'<linearGradient id="{gid}" x1="{x1:.2f}" y1="{y1:.2f}" x2="{1-x1:.2f}" y2="{1-y1:.2f}">'
                          f'<stop offset="0" stop-color="{shade(base, .14)}"/><stop offset=".6" stop-color="{base}"/>'
                          f'<stop offset="1" stop-color="{shade(base, -.10)}"/></linearGradient>')
        return f'url(#{gid})'

    body = []
    ids = []
    shapes = []
    for n, (p, key) in enumerate(pieces):
        d = path_d(p.simplify(0.35))
        if not d:
            continue
        shapes.append(f'<path id="{uid}{n}" d="{d}"/>')
        body.append(f'<use href="#{uid}{n}" fill="{fill(key)}"/>')
        ids.append(f'{uid}{n}')
    defs.append(''.join(shapes))
    leads = ''.join(f'<use href="#{i}"/>' for i in ids)
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
         f'<defs>{"".join(defs)}{"".join(grads.values())}</defs>'
         + ''.join(body)
         + f'<rect width="{W}" height="{H}" filter="url(#{uid}tex)" opacity=".18"/>'
         + f'<rect width="{W}" height="{H}" fill="url(#{uid}light)"/>'
         + f'<g fill="none" stroke="{LEAD}" stroke-width="{lead}" stroke-linejoin="round">{leads}</g>'
         + f'<g fill="none" stroke="#8A8792" stroke-opacity=".55" stroke-width="{lead*.25:.2f}" stroke-linejoin="round" transform="translate(-.4,-.4)">{leads}</g>'
         + f'<rect x="1.5" y="1.5" width="{W-3}" height="{H-3}" fill="none" stroke="{LEAD}" stroke-width="3"/>'
         + '</svg>')
    return s


def shade(hexc, f):
    r, g, b = int(hexc[1:3], 16), int(hexc[3:5], 16), int(hexc[5:7], 16)
    if f >= 0:
        r, g, b = [int(v + (255 - v) * f) for v in (r, g, b)]
    else:
        r, g, b = [int(v * (1 + f)) for v in (r, g, b)]
    return f'#{r:02X}{g:02X}{b:02X}'


# ---------------- lirio barbado (como la referencia de Elias) ----------------
def petal(L, Wd, ruffle=0.0, n=7, base=0.55, seed=0):
    """Pétalo que nace en (0,0) y crece hacia -y. Base estrecha, punta ancha y ondulada."""
    rng = random.Random(seed)
    ph = rng.uniform(0, 6)
    pts = []
    N = 90
    for i in range(N):
        th = 2 * math.pi * i / N
        y = L / 2 * (1 - math.cos(th))
        x = Wd / 2 * math.sin(th) * (y / L) ** base
        if ruffle:
            k = (y / L) ** 2.5
            f = 1 + ruffle * k * math.sin(n * th + ph)
            x *= f; y = y * (1 + ruffle * .5 * k * math.sin(n * th + ph))
        pts.append((x, -y))
    g = make_valid(Polygon(pts)).buffer(0)
    r = max(1.5, min(L, Wd) * .045)
    g = g.buffer(r, join_style=1).buffer(-2 * r, join_style=1).buffer(r, join_style=1)
    if g.geom_type != 'Polygon':
        g = max(polys(g), key=lambda q: q.area)
    return g


def lens(L, Wd, y0=0):
    a = bez((0, -y0), (-Wd, -y0 - L * .3), (-Wd * .6, -y0 - L * .8), (0, -y0 - L), 16)
    b = bez((0, -y0 - L), (Wd * .6, -y0 - L * .8), (Wd, -y0 - L * .3), (0, -y0), 16)
    return Polygon(a + b[1:])


def halves(P, ang=0):
    """Parte un pétalo por su nervio (eje y local antes de rotar)."""
    line = LineString([(0, 40), (0, -400)])
    line = affinity.rotate(line, ang, origin=(0, 0))
    g = [q for q in split(P, line).geoms if q.area > 15]
    return g if len(g) == 2 else [P]


def fan(L, spread, n, y0=4):
    """Abanico de vetas desde la base del pétalo, en rayos alternos."""
    out = []
    for k in range(n):
        a0 = math.radians(-spread + 2 * spread * k / n); a1 = math.radians(-spread + 2 * spread * (k + 1) / n)
        pts = [(0, -y0)]
        for t in range(7):
            a = a0 + (a1 - a0) * t / 6
            rr = L * (0.78 + 0.22 * math.cos((k + .5 - n / 2) / n * math.pi))
            pts.append((rr * math.sin(a), -y0 - rr * math.cos(a)))
        out.append((Polygon(pts).buffer(0), 'signal' if k % 2 == 0 else 'irisv'))
    return out


def splitn(P, angles):
    """Parte P con rayos desde el origen (vetas) en varios trozos ordenados de izquierda a derecha."""
    g = [P]
    for a in angles:
        line = affinity.rotate(LineString([(0, 30), (0, -400)]), a, origin=(0, 0))
        nxt = []
        for q in g:
            nxt += [r for r in split(q, line).geoms if r.area > 15]
        g = nxt
    return sorted(g, key=lambda q: q.centroid.x)


def iris_flower(seed=0):
    out = []
    rot = lambda P, a, x=0, y=0: affinity.translate(affinity.rotate(P, a, origin=(0, 0)), x, y)
    # estandartes: dos laterales detrás y uno central grande, ondulados y abombados
    for a in (-28, 28):
        hs = splitn(petal(80, 72, .16, 7, .36, seed + a), [0])
        for k, h in enumerate(hs):
            out.append((rot(h, a, 0, -36), 'irisl' + ('_l' if (k == 0) == (a < 0) else '_m')))
    c = petal(94, 84, .16, 8, .34, seed + 1)
    for h, suf in zip(splitn(c, [-14, 14]), ['_l', '', '_m']):
        out.append((affinity.translate(h, 0, -34), 'irisl' + suf))
    # caídas: muy abiertas y colgando, con bordes rizados y vetas blancas
    for a in (-148, 148, 180):
        big = a == 180
        P = petal(108 if big else 100, 94 if big else 88, .2, 9, .4, seed + a + 5)
        for k, h in enumerate(splitn(P, [0])):
            light = (k == 0) if a <= 0 else (k == 1)
            out.append((rot(h, a, 0, -30), 'irisd' + ('_l' if light and not big else ('_m' if not light else ''))))
        for q, key in fan(64 if big else 58, 20, 5, 6):
            out.append((rot(q.intersection(P.buffer(-6)), a, 0, -30), key))
    # brazos del estilo (pétalos pequeños claros en el centro) y barbas amarillas
    for a in (-148, 148, 180):
        out.append((rot(petal(36, 24, .08, 5, .55, seed + a), a, 0, -30), 'style'))
    for a in (-148, 148, 180):
        out.append((rot(lens(26, 6, 22), a, 0, -30), 'amber'))
    return out


def iris_bud():
    b = Polygon(bez((0, 0), (-12, -14), (-9, -46), (0, -62)) + bez((0, -62), (9, -46), (12, -14), (0, 0))[1:])
    sheath = Polygon(bez((0, 6), (-12, -4), (-10, -20), (-3, -30)) + bez((-3, -30), (2, -16), (8, -6), (0, 6))[1:])
    return [(b, 'irisd'), (b.intersection(box(0, -70, 20, 10)), 'irisd_l'), (sheath, 'leaf')]
