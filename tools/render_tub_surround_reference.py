#!/usr/bin/env python3
"""Render the unchanged full bathroom photograph with source-driven dimensions.

Only the Python standard library is used. Pixel anchors locate visible endpoints;
they never convert pixels to inches. Re-run against the canonical room JSON.
"""
import argparse
import base64
from datetime import datetime, timezone
from fractions import Fraction
import hashlib
import html
import json
from pathlib import Path
import xml.etree.ElementTree as ET


def sha(data):
    return hashlib.sha256(data).hexdigest()


def strip_jpeg_metadata(data):
    """Drop EXIF/XMP, Photoshop/IPTC and comments without recompressing pixels."""
    assert data[:2] == b'\xff\xd8', 'Expected JPEG input'
    result, offset, removed = bytearray(data[:2]), 2, []
    while offset < len(data):
        start = offset
        assert data[offset] == 0xff, 'Malformed JPEG marker'
        while data[offset] == 0xff:
            offset += 1
        marker = data[offset]
        offset += 1
        if marker in (0xda, 0xd9):  # SOS / EOI: preserve scan bytes verbatim.
            result.extend(data[start:])
            break
        assert marker not in (0x00, 0x01) and not 0xd0 <= marker <= 0xd7
        length = int.from_bytes(data[offset:offset+2], 'big')
        assert length >= 2 and offset + length <= len(data)
        end = offset + length
        if marker in (0xe1, 0xed, 0xfe):  # APP1, APP13, COM
            removed.append({'marker': f'0xFF{marker:02X}', 'bytes': end-start})
        else:
            result.extend(data[start:end])
        offset = end
    return bytes(result), removed


def fraction(value):
    n = Fraction(str(value)).limit_denominator(16)
    whole, remainder = divmod(n.numerator, n.denominator)
    glyph = {(1, 2): '½', (1, 4): '¼', (3, 4): '¾', (1, 8): '⅛',
             (3, 8): '⅜', (5, 8): '⅝', (7, 8): '⅞'}
    if not remainder:
        return str(whole)
    suffix = glyph.get((remainder, n.denominator), f' {remainder}/{n.denominator}')
    return (str(whole) if whole else '') + suffix


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--room-json', required=True, type=Path)
    parser.add_argument('--photo', required=True, type=Path)
    parser.add_argument('--output-dir', type=Path, default=Path(__file__).resolve().parents[1] / 'wiki-images')
    args = parser.parse_args()
    raw = args.room_json.read_bytes()
    data = json.loads(raw)
    source_photo = args.photo.read_bytes()
    assert sha(source_photo) == data['photo']['sha256'], 'Source photo does not match room JSON'
    photo, removed_metadata = strip_jpeg_metadata(source_photo)
    assert (data['photo']['width_px'], data['photo']['height_px']) == (1350, 1800)
    p, a = data['points'], data['photo']['anchors_px']
    ta = data['tub']['photo_anchors_px']
    x = lambda key: p[key]['x']
    z = lambda key: p[key]['z']
    width = x('wall_br') - x('wall_bl')
    height = z('wall_tl') - z('wall_bl')
    small_top = p['small_tl']['z_interval_in']
    assert small_top == data['sources']['small_vertical']['interval_in']
    records = {}

    def measurement(key, value, boundary, source_keys, approximate=False, calculated=False, display_value=None):
        vals = value if isinstance(value, list) else [value]
        assert all(isinstance(v, (int, float)) for v in vals), key
        shown = value if display_value is None else display_value
        label = ('≈' if approximate else '') + ('–'.join(fraction(v) for v in shown) if isinstance(shown, list) else fraction(shown)) + '″'
        records[key] = dict(value_in=value, display_value_in=shown, label=label,
                            measure_boundary=boundary, approximate=approximate, calculated=calculated,
                            confidence=('calculated from approximate observations' if calculated and approximate else
                                        'approximate photo reading or owner report' if approximate else
                                        'owner-reported; not independently field-verified'),
                            sources=[{'kind': data['sources'][k]['kind'],
                                      'photos': [data['sources'][k][v] for v in ('filename', 'supporting_filename')
                                                 if data['sources'][k].get(v)] + data['sources'][k].get('filenames', [])}
                                     for k in source_keys])
        return label

    measurement('wall_width', width, 'left_backer_corner_to_right_backer_corner', ['wall_width'])
    measurement('wall_height', height, 'tub_stone_rim_to_backer_top', ['wall_height'])
    measurement('left_gap', x('large_bl') - x('wall_bl'), 'left_backwall_to_large_niche_front_left', ['large_horizontal'], True)
    measurement('large_width', x('large_br') - x('large_bl'), 'large_niche_front_left_to_front_right', ['large_horizontal'], True, True)
    measurement('between_niches', x('small_bl') - x('large_br'), 'large_niche_front_right_to_small_niche_front_left', ['large_horizontal', 'small_horizontal'], True, True)
    measurement('small_width', x('small_br') - x('small_bl'), 'small_niche_front_left_to_front_right', ['small_horizontal'], True, True)
    right_gap = width - x('small_br')
    measurement('right_gap', right_gap, 'small_niche_front_right_to_right_backwall', ['wall_width', 'small_horizontal'], True, True, round(right_gap * 4) / 4)
    measurement('large_top_gap', height - z('large_tl'), 'large_niche_front_top_to_backer_top', ['wall_height', 'large_vertical'], True, True)
    measurement('large_height', z('large_tl') - z('large_bl'), 'large_niche_front_bottom_to_front_top', ['large_vertical'], True, True)
    measurement('large_bottom', z('large_bl'), 'tub_stone_rim_to_large_niche_front_bottom', ['large_vertical'], True)
    measurement('large_top', z('large_tl'), 'tub_stone_rim_to_large_niche_front_top', ['large_vertical'], True)
    measurement('small_top_gap', [height - small_top[1], height - small_top[0]], 'small_niche_front_top_to_backer_top', ['wall_height', 'small_vertical'], True, True)
    measurement('small_height', [v - z('small_bl') for v in small_top], 'small_niche_front_bottom_to_front_top', ['small_vertical', 'small_bottom'], True, True)
    measurement('small_bottom', z('small_bl'), 'tub_stone_rim_to_small_niche_front_bottom', ['small_bottom'], True)
    measurement('small_top', small_top, 'tub_stone_rim_to_small_niche_front_top', ['small_vertical'], True)
    measurement('tub_height', z('tub_side_tl') - z('tub_side_bl'), 'current_photo_floor_to_tub_stone_rim', ['tub_height'])
    measurement('tub_depth', x('tub_side_tr') - x('tub_side_tl'), 'backwall_to_outer_front_tub_stone_edge', ['shower_depth'], True)
    assert sum(records[k]['value_in'] for k in ('left_gap', 'large_width', 'between_niches', 'small_width', 'right_gap')) == width

    out = args.output_dir
    out.mkdir(parents=True, exist_ok=True)
    stem = 'bathroom-tub-surround-'
    original = out / (stem + 'source.jpg')
    original.write_bytes(photo)
    embedded = base64.b64encode(photo).decode('ascii')
    output_records = []
    for lang in ('en', 'es'):
        en = lang == 'en'
        title = 'Tub Surround measurements' if en else 'Medidas del contorno de la tina'
        subtitle = 'Inches · Niche measurements use the front opening edges' if en else 'Pulgadas · Los nichos se miden en los bordes frontales'
        parts = [f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1350" height="2090" viewBox="0 0 1350 2090" role="img" aria-labelledby="title desc" xml:lang="{lang}">',
                 f'<title id="title">{title}</title>',
                 '<desc id="desc">' + html.escape('Full photograph with backer, both niche openings, complete bathtub and current floor; dimensions are source observations, not scaled from the photograph.' if en else 'Fotografía completa con panel de respaldo, ambos nichos, tina y piso actual; las medidas provienen de observaciones, no de la escala de la foto.') + '</desc>',
                 '<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L9,4.5 L0,9 Z" fill="#ffc857" stroke="#17252b" stroke-width=".8"/></marker></defs>',
                 '<style>text{font-family:Arial,Helvetica,sans-serif} .dim{stroke:#ffc857;stroke-width:3;fill:none;marker-start:url(#arrow);marker-end:url(#arrow)} .halo{stroke:#17252b;stroke-width:6;fill:none;opacity:.85} .ext{stroke:#ffc857;stroke-width:2;fill:none;stroke-dasharray:7 5} .box{fill:#132b35;fill-opacity:.95;stroke:#fff;stroke-width:1} .num{fill:#fff;font-weight:700;font-size:31px;text-anchor:middle;dominant-baseline:central} .small{font-size:21px;fill:#fff;text-anchor:middle;dominant-baseline:central}</style>',
                 '<rect width="1350" height="2090" fill="#fff"/>',
                 f'<text x="45" y="64" font-size="45" font-weight="700" fill="#122b35">{title}</text>',
                 f'<text x="45" y="105" font-size="25" fill="#44545a">{subtitle}</text>',
                 f'<image id="full-source-photo" x="0" y="140" width="1350" height="1800" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/jpeg;base64,{embedded}"/>',
                 '<g transform="translate(0 140)">']
        label_bounds = []
        label_parts = []
        def line(start, end, cls):
            parts.append(f'<path class="{cls}" d="M{start[0]},{start[1]} L{end[0]},{end[1]}"/>')

        def box(text, cx, cy, size=31, rotate=0, second=None):
            # Conservative character widths avoid overlap for fraction ranges.
            w = max(len(text) * size * .57 + 22, len(second or '') * 11.4 + 22)
            h = 47 if second is None else 73
            label_parts.append(f'<g transform="translate({cx} {cy}) rotate({rotate})"><rect class="box" x="{-w/2:.1f}" y="{-h/2}" width="{w:.1f}" height="{h}" rx="8"/><text class="num" style="font-size:{size}px" y="{-11 if second else 0}">{html.escape(text)}</text>')
            if second:
                label_parts.append(f'<text class="small" y="20">{html.escape(second)}</text>')
            label_parts.append('</g>')
            rw, rh = (h, w) if rotate in (-90, 90) else (w, h)
            label_bounds.append([cx - rw / 2, cy - rh / 2, cx + rw / 2, cy + rh / 2])

        def dim(key, start, end, label, ends=None, rotate=0, second=None, size=31):
            parts.append(f'<g id="dimension-{key}" data-measure-boundary="{records[key]["measure_boundary"]}">')
            if ends:
                for actual, projected in zip(ends, (start, end)):
                    line(actual, projected, 'ext')
            line(start, end, 'halo')
            line(start, end, 'dim')
            cx, cy = label
            midpoint = ((start[0]+end[0])/2, (start[1]+end[1])/2)
            if not rotate and (abs(cy-midpoint[1]) > 35 or abs(cx-midpoint[0]) > 35):
                line(midpoint, (cx, cy), 'ext')
            box(records[key]['label'], cx, cy, size, rotate, second)
            parts.append('</g>')

        # Entire backer span, using actual photographed boundary anchors.
        dim('wall_width', (a['wall_tl'][0], 385), (a['wall_tr'][0], 385), (637, 385), (a['wall_tl'], a['wall_tr']), second='back wall' if en else 'pared del fondo')
        dim('wall_height', (125, a['wall_tl'][1]), (125, a['wall_bl'][1]), (125, 747), (a['wall_tl'], a['wall_bl']), rotate=-90, second='rim → backer top' if en else 'borde → panel arriba')

        # Horizontal chain, staggered only to preserve readable numbers.
        chain_x = [324, a['large_tl'][0], a['large_tr'][0], a['small_tl'][0], a['small_tr'][0], 946]
        chain_ends = [(324, 797), a['large_tl'], a['large_tr'], a['small_tl'], a['small_tr'], (946, 803)]
        chain = ['left_gap', 'large_width', 'between_niches', 'small_width', 'right_gap']
        for i, key in enumerate(chain):
            cx = (chain_x[i] + chain_x[i+1]) / 2
            cy = 655 if i % 2 == 0 else 713
            if key == 'right_gap':
                cx, cy = 1000, 695
            dim(key, (chain_x[i], 748), (chain_x[i+1], 748), (cx, cy), chain_ends[i:i+2], size=28,
                second=('calculated' if en else 'calculado') if key == 'right_gap' else None)

        # Three segments beside each niche: top gap, opening height, bottom gap.
        large_y = [451, a['large_tl'][1], a['large_bl'][1], 1111]
        large_ends = [(500, 451), a['large_tl'], a['large_bl'], (500, 1111)]
        for i, key in enumerate(('large_top_gap', 'large_height', 'large_bottom')):
            label_y = 550 if i == 0 else (large_y[i]+large_y[i+1])/2
            dim(key, (440, large_y[i]), (440, large_y[i+1]), (440, label_y), large_ends[i:i+2], rotate=-90, size=28)
        small_y = [461, a['small_tr'][1], a['small_br'][1], 1105]
        small_ends = [(742, 461), a['small_tr'], a['small_br'], (742, 1105)]
        for i, key in enumerate(('small_top_gap', 'small_height', 'small_bottom')):
            label = [(1010, 556), (1000, 864), (1000, 1015)][i]
            dim(key, (810, small_y[i]), (810, small_y[i+1]), label, small_ends[i:i+2], size=28)

        # Tops above rim are explicitly shown, never the small range midpoint.
        dim('large_top', (370, a['large_tl'][1]), (370, a['wall_bl'][1]), (370, 935), (a['large_tl'], a['wall_bl']), rotate=-90, size=26)
        dim('small_top', (1210, a['small_tr'][1]), (1210, a['wall_br'][1]), (1210, 957), (a['small_tr'], a['wall_br']), rotate=-90, size=28)
        dim('tub_height', (150, ta['height_start'][1]), (150, ta['height_end'][1]), (150, 1450), (ta['height_start'], ta['height_end']), rotate=-90, second='current floor → rim' if en else 'piso actual → borde')
        dim('tub_depth', tuple(ta['depth_start']), tuple(ta['depth_end']), (1140, 1185), size=31)
        # Paint every numeric label after every arrow/leader, without moving it.
        parts.append('<g id="dimension-labels">')
        parts.extend(label_parts)
        parts.append('</g>')
        parts.append('</g>')
        footer = [
            '≈ approximate · Calculated gaps inherit approximate readings. Photo is not to scale.',
            '71¼″: tub rim to backer top · 22″: current photo floor to rim · ≈33″: back wall to outer front.',
            'Niche vertical dimensions start at the tub rim; top gaps end at the top of the backer.'
        ] if en else [
            '≈ aproximado · Los espacios calculados conservan la incertidumbre. Foto sin escala.',
            '71¼″: borde a panel arriba · 22″: piso actual a borde · ≈33″: pared al frente exterior.',
            'Las alturas de nichos parten del borde de la tina; los espacios superiores llegan al panel.'
        ]
        for i, text in enumerate(footer):
            parts.append(f'<text x="35" y="{1977 + i*36}" font-size="24" fill="#243c46">{html.escape(text)}</text>')
        parts.append('</svg>')
        svg = '\n'.join(parts).encode()
        root = ET.fromstring(svg)
        assert len(root.findall('.//{http://www.w3.org/2000/svg}image')) == 1
        assert len(root.findall('.//{http://www.w3.org/2000/svg}g[@data-measure-boundary]')) == len(records)
        assert all(0 <= left < right <= 1350 and 0 <= top < bottom <= 1800 for left, top, right, bottom in label_bounds)
        for i, first in enumerate(label_bounds):
            for second in label_bounds[i+1:]:
                assert not (max(first[0], second[0]) < min(first[2], second[2]) and
                            max(first[1], second[1]) < min(first[3], second[3])), 'Dimension labels overlap'
        path = out / (stem + f'measurements-{lang}.svg')
        path.write_bytes(svg)
        output_records.append({'asset': path.name, 'sha256': sha(svg), 'language': lang,
                               'width_px': 1350, 'height_px': 2090, 'dimension_count': len(records)})

    manifest = {'version': 1, 'generated_at': datetime.now(timezone.utc).isoformat(),
                'generator': 'tools/render_tub_surround_reference.py',
                'canonical_room_json_sha256': sha(raw),
                'photo': {'asset': original.name, 'sha256': sha(photo), 'original_source_sha256': sha(source_photo),
                          'public_metadata_scrubbed_sha256': sha(photo), 'width_px': 1350, 'height_px': 1800,
                          'embedded_public_jpeg_unchanged': True, 'pixels_reencoded': False, 'cropped': False,
                          'removed_metadata_segments': removed_metadata},
                'pixel_anchors': a, 'tub_pixel_anchors': {k: v for k, v in ta.items() if isinstance(v, list)},
                'measurements': records, 'outputs': output_records,
                'coordinate_policy': 'Photo anchors identify edges; no pixel-to-inch conversion; no cardinal direction inferred.',
                'missing_measurements': ['Actual tub outer width across', 'Niche depths', 'Outer tub edge to selected tile stop'],
                'excluded_references': 'Unlocated sill/casing and separate west-wall measurements are not placed on this photo.',
                'review_scope': 'Tape-photo evidence checked before authoring; SVG layout requires separate visual review.'}
    manifest_path = out / (stem + 'manifest.json')
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'outputs': output_records, 'manifest': manifest_path.name,
                      'photo_sha256': sha(photo), 'measurement_count': len(records)}, indent=2))


if __name__ == '__main__':
    main()
