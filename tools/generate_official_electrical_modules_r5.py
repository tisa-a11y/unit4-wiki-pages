#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
1231 11th Avenue Unit 4 — Official Working Electrical Plans (Rev R5)
Two-Module Landscape Blueprint Set (100% EN & ES Parity, Python 3.9+ Clean — Zero f-strings):
  - Module 1: Kitchen Electrical (Sheets E-00, E-11, E-12, E-13, E-14)
  - Module 2: Whole-Unit Highlighted Segments (Sheets E-00, E-21, E-22, E-23, E-24, E-25)

All Rev R4 Independent Peer-Review Findings Resolved in Rev R5:
  - BD-1: Kitchen West 66-1/4" Range Wall plotted at true X = 31.5" (South Step = 174.25" -> North = 108.0"),
          keeping X = 0..31.5", Y = 174.25..234.25 as the 59-3/4" Rear-Door Alcove.
  - BD-2 & BD-3: Mathematically verified zero viewBox clipping and zero badge-on-badge overlaps across EN & ES.
  - BD-4: Hood box at 33" +- 2-1/4" N of South Step (confirm hood top knockout side), 83"-86" AFF (+t), ~1" proud.
  - BD-5: Under-Sink 2-Gang restored to 14" AFF (+t) with 2 separate TR receptacles on 2 separate yokes (NEC 210.7);
          South window CL 87" vs. 90" HOLD flagged; Pie-Safe drawn as flush-sealed 26"-59" W, 43"-80" AFF wall patch;
          Sink Pendants placed at true 75"/99" W, 15" off South wall.
  - BD-6 & IG-5 & IG-6: Every individual outlet, switch, ceiling light, Vanity Light, Laundry Light/Switch,
          2x Hall 3-Way, all 4 Attic J-Boxes, wire runs, NO OUTLET ON PANEL WALL, and D6/L6 Pocket-Door Holds plotted.
  - BD-7: Mandatory Red Gate on #10 & #11 reused wire gauge check (14 AWG leg requires 15A AFCI breaker per NEC 240.4(D)(3)).
  - BD-8 & MP-2: 100% EN/ES translation parity with proper UTF-8 Spanish accents and full safety/hold notes.
  - IG-1 & IG-8: #16 uses 15A AFCI-Only breaker (BRN115AF, NEVER GFCI breaker) -> unswitched 14/2 to Smoke/CO chain
          (>=36" from Bath/registers, >=10-20 ft from Range) + LINE-only GFCI Attic Outlet <=25 ft from Furnace.
  - IG-3 & IG-4: Strict scaleX === scaleY (1:1 true scale) on all floor plans and wall elevations, with dual
          AFF / Bare Subfloor (+t, est. 3/4") datums, compass roses, and graphical scale bars on every drawing sheet.
  - IG-7 & IG-9 & MP-4: Surface active electrical/SPEC.md holds (80A vs 100A feeder, Panel side-entry notches,
          SFEC 362.10 ENT vs NM-B / 6hvRcQ7Gmh3fG5m7 hold), Panel-accessible GFCI reset for LG WKG101HVA,
          and timeout=30 + --disable-dev-shm-usage on headless Chrome PDF export.
"""

import argparse
import html
import os
import subprocess

DEFAULT_OUT_DIR = "/Users/tisavo/Agent Shared - Mini Hosted/1231 11th Avenue Unit 4/electrical/2026-11-23-official-electrical-plans-R5"

CHROME_PATHS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
]

CIRCUITS = [
    ("#1", "NEW", "Kitchen East Counter", "Encimera Este Cocina",
     "20A AFCI/GFCI (BRN120DF)", "20A AFCI/GFCI (BRN120DF)", "12/2", "w12",
     "East 1 (10\" N), East 2 (45\" N) — 50\" bore band",
     "Este 1 (10\" N), Este 2 (45\" N) — franja 50\""),
    ("#2", "NEW", "Kitchen South Counter", "Encimera Sur Cocina",
     "20A AFCI/GFCI (BRN120DF)", "20A AFCI/GFCI (BRN120DF)", "12/2", "w12",
     "South 1 (24\" W), South 2 (62\" W — verify CL 87\" vs 90\")",
     "Sur 1 (24\" O), Sur 2 (62\" O — verificar eje 87\" vs 90\")"),
    ("#3", "NEW", "Kitchen West Counter", "Encimera Oeste Cocina",
     "20A AFCI/GFCI (BRN120DF)", "20A AFCI/GFCI (BRN120DF)", "12/2", "w12",
     "West 1 (9\" N), West 2 (57\" N of Step) — ~1\" tile mud rings",
     "Oeste 1 (9\" N), Oeste 2 (57\" N del escalón) — aros ~1\" azulejo"),
    ("#4", "NEW", "Fridge", "Refrigerador",
     "20A AFCI/GFCI (BRN120DF)", "20A AFCI/GFCI (BRN120DF)", "12/2", "w12",
     "Fridge single 20A TR (East 68\" N of SE, 15\" AFF behind 28\" Haier)",
     "Toma sencilla 20A TR Refri (Este 68\" N de SE, 15\" AFF tras Haier 28\")"),
    ("#5", "NEW", "Dishwasher", "Lavavajillas",
     "20A AFCI/GFCI (BRN120DF)", "20A AFCI/GFCI (BRN120DF)", "12/2", "w12",
     "Under-Sink 2-Gang LEFT yoke (separate 20A TR receptacle & neutral, 14\" AFF)",
     "Caja Doble Fregadero yugo IZQ. (receptáculo 20A TR y neutro separados, 14\" AFF)"),
    ("#6", "NEW", "Disposal", "Triturador",
     "15A AFCI/GFCI (BRN115DF)", "15A AFCI/GFCI (BRN115DF)", "14/2", "w14",
     "Under-Sink 2-Gang RIGHT yoke (separate 15A TR & neutral) + Air Button (90\" W)",
     "Caja Doble Fregadero yugo DER. (15A TR y neutro separados) + Botón Aire (90\" O)"),
    ("#7", "NEW", "Gas Range", "Estufa de Gas",
     "15A AFCI/GFCI (BRN115DF)", "15A AFCI/GFCI (BRN115DF)", "14/2", "w14",
     "Range 15A TR (West 33\" N of Step, 3\" AFF low Viking pocket)",
     "Toma Estufa 15A TR (Oeste 33\" N del escalón, 3\" AFF hueco bajo Viking)"),
    ("#8", "NEW", "Range Hood", "Campana Extractora",
     "15A AFCI (BRN115AF) + BRLW1 Lock", "15A AFCI (BRN115AF) + Bloqueo BRLW1", "14/2", "w14",
     "Hood flush 1-gang 2\"x3\" ~1\" proud (33\" +- 2-1/4\" N, 83\"-86\" AFF; NO 4x4 @ 100\")",
     "Caja Campana 1-gang 2\"x3\" ~1\" salida (33\" +- 2-1/4\" N, 83\"-86\" AFF; NO 4x4 a 100\")"),
    ("#9", "NEW", "Kitchen Lights", "Luces de Cocina",
     "15A AFCI (BRN115AF)", "15A AFCI (BRN115AF)", "14/2", "w14",
     "Entry 3-Switch (North 35.5\" W of NE, 48\" AFF) -> Ceiling, Sink Pendants, Under-Cab",
     "3-Apagadores Entrada (Norte 35.5\" O de NE, 48\" AFF) -> Techo, Colgantes, Bajo Gab."),
    ("#10", "EXIST", "Living, Dining, Bed & Hall Outlets", "Tomas Sala, Comedor, Rec. y Pasillo",
     "20A AFCI* (15A if 14 AWG reused!)", "20A AFCI* (¡15A si reusa 14 AWG!)", "12/2", "w12",
     "Reuse + New: Dining 1-4, Living 1-5, Hall 1 (18\" AFF) & Bed 1-5 (11.5\" dark horiz.) via J-Boxes (NO Panel-wall box; D6/L6 hold; verify reused vs. new on site w/ C-10)",
     "Reuso + Nuevo: Comedor 1-4, Sala 1-5, Pasillo 1 (18\" AFF) y Rec. 1-5 (11.5\" horiz. oscuro) vía Cajas (SIN caja en Panel; pausa D6/L6; verificar en obra con C-10)"),
    ("#11", "SPARE", "Spare (Future Bedroom / Room Split)", "Reserva (División Recámara / Cuartos)",
     "Open Space", "Espacio Libre", "-", "wsp",
     "Open spare — ready to split Bed/Hall J-Box off #10 later with zero drywall demo",
     "Reserva libre — lista para dividir Caja Recámara/Pasillo desde #10 sin romper tablaroca"),
    ("#12", "EXIST", "Room Lights (Common Rooms)", "Luces Cuartos Comunes",
     "15A AFCI (BRN115AF)", "15A AFCI (BRN115AF)", "14/2 + 14/3", "w143",
     "Living, Dining, Bed, Hall 1-2 (2x 3-Way 14/3) & Laundry Light/Switch via Lights J-Box",
     "Luces/apagadores Sala, Comedor, Recámara, Pasillo 1-2 (3-Vías 14/3) y Lavandería"),
    ("#13", "NEW", "Bathroom (Outlets, Lights & Fan)", "Baño (Tomas, Luces y Extractor)",
     "20A AFCI/GFCI (BRN120DF)", "20A AFCI/GFCI (BRN120DF)", "12/2", "w12",
     "1 circuit via Bath J-Box (100% 12/2): Vanity, Toilet (sep. drop!), Ceiling + Vanity Lights, Fan",
     "1 circuito vía Caja Baño (100% 12/2): Lavabo, Inodoro (bajada sep.), Luces Techo/Espejo, Extractor"),
    ("#14", "NEW", "Laundry WashTower", "Lavandería WashTower",
     "20A AFCI/GFCI at Panel (BRN120DF)", "20A AFCI/GFCI en Panel (BRN120DF)", "12/2", "w12",
     "Washer/Dryer 1x 20A duplex (East wall @ 38\" AFF; both 120V LG cords; Panel GFCI reset)",
     "Lavadora/Secadora 1 toma doble 20A (muro Este a 38\" AFF; ambos cables 120V LG; reset en Panel)"),
    ("#15", "NEW", "Attic Furnace", "Calefactor en Ático",
     "15A Standard (BR115)", "15A Estándar (BR115)", "14/2", "w14",
     "Dedicated to F1 Furnace + local Disconnect Switch at platform (174\", 258\")",
     "Dedicado a Calefactor F1 + Desconectador local en plataforma (174\", 258\")"),
    ("#16", "NEW", "Attic Light, Outlet & Smoke/CO", "Luz/Toma Ático y Humo/CO",
     "15A AFCI-ONLY (BRN115AF — NO GFCI!)", "15A SOLO-AFCI (BRN115AF — ¡SIN GFCI!)", "14/2 + 14/3", "w143",
     "Unswitched 14/2+14/3 to Smoke/COs; LINE-only GFCI Attic Outlet (<=25 ft F1) + Hatch Switch",
     "14/2+14/3 directo a Humo/CO; Toma GFCI en Ático SOLO-LINE (<=25 pies F1) + Apagador Escotilla"),
    ("#17", "SPARE", "Spare (Future Living/Dining Split)", "Reserva (División Sala/Comedor)",
     "Open Space", "Espacio Libre", "-", "wsp",
     "Optional future split from Living/Dining J-Box", "División futura opcional desde Caja Sala/Comedor"),
    ("#18", "SPARE", "Spare (Future Bedroom Split)", "Reserva (División Recámara)",
     "Open Space", "Espacio Libre", "-", "wsp",
     "Optional future split from Bed/Hall J-Box", "División futura opcional desde Caja Recámara/Pasillo"),
    ("#19", "SPARE", "Spare (Future Toilet Bidet Split)", "Reserva (División Bidet Inodoro)",
     "Open Space", "Espacio Libre", "-", "wsp",
     "Zero-tile-demo future split using separate Toilet 12/2 drop in Bath J-Box",
     "División futura sin romper azulejo usando bajada 12/2 separada en Caja Baño"),
    ("#20", "SPARE", "Spare (Open)", "Reserva (Libre)",
     "Open Space", "Espacio Libre", "-", "wsp",
     "Open panel space", "Espacio libre en panel"),
]

CSS = """
@page { size: letter landscape; margin: 0.25in; }
* { box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 10.5pt;
  background: #e9edf2; color: #16202a; margin: 0; padding: 12px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.sheet {
  width: 100%; max-width: 10.4in; background: #ffffff;
  margin: 0 auto 14px auto; padding: 7px 11px 6px 11px;
  border: 1.5px solid #1e2d3d; box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  page-break-after: always; break-after: page; position: relative;
}
.sheet:last-child { page-break-after: avoid; break-after: avoid; }
@media print {
  body { background: #fff; padding: 0; }
  .sheet { margin: 0; box-shadow: none; width: 100%; max-width: none; border: 1.2px solid #1e2d3d; break-inside: avoid; page-break-inside: avoid; }
}
.hdr {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 2.5px solid #1e2d3d; padding-bottom: 4px; margin-bottom: 6px;
}
.hdr-left h1 { margin: 0; font-size: 15px; color: #0f2537; }
.hdr-left .sub { font-size: 10px; color: #334155; margin-top: 2px; font-weight: 600; }
.hdr-right { text-align: right; flex-shrink: 0; white-space: nowrap; margin-left: 8px; }
.sheet-num {
  display: inline-block; background: #0f2537; color: #fff; font-weight: 800;
  font-size: 14px; padding: 2px 9px; border-radius: 3px;
}
.rev-tag { font-size: 9.2px; color: #991b1b; margin-top: 2px; font-weight: 700; }
.legend-bar {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px;
  padding: 4px 8px; margin-bottom: 6px; font-size: 9.5px;
}
.pill {
  display: inline-flex; align-items: center; font-weight: 700;
  padding: 1.5px 6px; border-radius: 3px; border: 1px solid #cbd5e1;
}
.pill-box { background: #1e293b; border-color: #0f172a; color: #ffffff; }
.pill-12 { background: #fef08a; border-color: #ca8a04; color: #713f12; }
.pill-14 { background: #ffffff; border-color: #475569; color: #0f172a; }
.pill-143 { background: #fee2e2; border-color: #dc2626; color: #991b1b; }
.pill-ex { background: #e0f2fe; border-color: #0284c7; color: #0c4a6e; border-style: dashed; }
.pill-hold { background: #fef2f2; border-color: #b91c1c; color: #991b1b; }
table { width: 100%; border-collapse: collapse; font-size: 9.3px; }
th, td { border: 1px solid #cbd5e1; padding: 1.5px 4px; line-height: 1.18; text-align: left; vertical-align: top; }
.ptbl-compact th, .ptbl-compact td { font-size: 7.9px; padding: 0.9px 3.5px; line-height: 1.08; }
th { background: #0f2537; color: #fff; font-weight: 700; font-size: 9.2px; }
tr:nth-child(even) td { background: #f8fafc; }
.bx { background: #1e293b; color: #fff; font-weight: 700; padding: 1px 5px; border-radius: 2px; font-size: 8.8px; white-space: nowrap; }
.b-new { background: #dcfce7; color: #14532d; font-weight: 700; padding: 1px 4px; border-radius: 2px; font-size: 8.5px; }
.b-ex { background: #e0f2fe; color: #0c4a6e; font-weight: 700; padding: 1px 4px; border-radius: 2px; border: 1px dashed #0284c7; font-size: 8.5px; }
.b-sp { background: #f1f5f9; color: #64748b; font-weight: 700; padding: 1px 4px; border-radius: 2px; font-size: 8.5px; }
.w12 { background: #fef08a; color: #713f12; font-weight: 800; padding: 1px 5px; border-radius: 2px; border: 1px solid #ca8a04; white-space: nowrap; }
.w14 { background: #ffffff; color: #0f172a; font-weight: 800; padding: 1px 5px; border-radius: 2px; border: 1px solid #475569; white-space: nowrap; }
.w143 { background: #fee2e2; color: #991b1b; font-weight: 800; padding: 1px 5px; border-radius: 2px; border: 1px solid #dc2626; white-space: nowrap; }
.wsp { color: #94a3b8; font-weight: 700; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.grid-65 { display: grid; grid-template-columns: 1.62fr 1fr; gap: 10px; }
.box { border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 8px; background: #fff; }
.box h3 { margin: 0 0 4px 0; font-size: 10.5px; color: #0f2537; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
.box ul { margin: 3px 0 0 0; padding-left: 15px; font-size: 9.4px; line-height: 1.36; }
.svg-wrap { border: 1px solid #94a3b8; border-radius: 4px; background: #fcfdff; padding: 4px; text-align: center; }
.svg-wrap svg { max-height: 4.25in; width: auto; max-width: 100%; margin: 0 auto; display: block; }
.svg-cap { font-size: 9.5px; font-weight: 700; color: #1e293b; margin-bottom: 2px; text-align: left; }
.ftr {
  margin-top: 6px; padding-top: 4px; border-top: 1px solid #cbd5e1;
  display: flex; justify-content: space-between; font-size: 8.8px; color: #475569;
}
.note-red { background: #fef2f2; border-left: 3.5px solid #dc2626; padding: 5px 8px; font-size: 9.3px; margin-top: 5px; line-height: 1.35; }
.note-blue { background: #eff6ff; border-left: 3.5px solid #2563eb; padding: 5px 8px; font-size: 9.3px; margin-top: 5px; line-height: 1.35; }

/* U4_R5_WEB_TOPBAR_START */
.u4-doc-topbar {
  max-width: 10.4in;
  margin: 0 auto 10px auto;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #d9dedc;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
}
.u4-doc-topbar-left, .u4-doc-topbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.u4-doc-navbtn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid #d9dedc;
  background: #f4f5f3;
  color: #1d2326;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-weight: 600;
  font-size: 12px;
  text-decoration: none;
}
.u4-doc-navbtn:hover {
  border-color: #1f5f7a;
  background: #e3eef2;
  color: #1f5f7a;
}
.u4-doc-navbtn.is-primary {
  background: #1f5f7a;
  border-color: #1f5f7a;
  color: #ffffff;
}
.u4-lang-seg {
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(3, minmax(30px, 1fr));
  align-items: center;
  padding: 2px;
  height: 32px;
  min-width: 100px;
  border-radius: 999px;
  border: 1px solid #d9dedc;
  background: #f4f5f3;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 700;
}
.u4-lang-seg .u4-seg-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc((100% - 4px) / 3);
  height: calc(100% - 4px);
  border-radius: 999px;
  background: #1f5f7a;
  transition: transform 170ms cubic-bezier(0.22, 0.9, 0.32, 1);
  pointer-events: none;
}
.u4-lang-seg[data-lang="es"] .u4-seg-thumb { transform: translateX(100%); }
.u4-lang-seg[data-lang="ru"] .u4-seg-thumb { transform: translateX(200%); }
.u4-lang-seg a.u4-seg-opt {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 6px;
  color: #485358;
  text-decoration: none;
}
.u4-lang-seg a.u4-seg-opt.is-active { color: #ffffff; }
.u4-seg-switch {
  position: relative;
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 2px;
  height: 32px;
  min-width: 64px;
  border-radius: 999px;
  border: 1px solid #d9dedc;
  background: #f4f5f3;
  color: #485358;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}
.u4-seg-switch .u4-seg-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  border-radius: 999px;
  background: #1f5f7a;
  transition: transform 160ms ease;
}
.u4-seg-switch[aria-checked="true"] .u4-seg-thumb { transform: translateX(100%); }
.u4-seg-switch .u4-seg-opt {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  color: #485358;
}
.u4-seg-switch[aria-checked="false"] .u4-seg-opt.is-a,
.u4-seg-switch[aria-checked="true"] .u4-seg-opt.is-b { color: #ffffff; }
html[data-theme="dark"] body,
html.dark body { background: #121618; }
html[data-theme="dark"] .u4-doc-topbar,
html.dark .u4-doc-topbar { background: #1a2023; border-color: #2c3539; color: #e4e9ea; }
html[data-theme="dark"] .u4-doc-navbtn,
html.dark .u4-doc-navbtn { background: #121618; border-color: #2c3539; color: #e4e9ea; }
html[data-theme="dark"] .u4-doc-navbtn:hover,
html.dark .u4-doc-navbtn:hover { border-color: #7cc0dc; background: #1d3440; color: #7cc0dc; }
html[data-theme="dark"] .u4-doc-navbtn.is-primary,
html.dark .u4-doc-navbtn.is-primary { background: #7cc0dc; border-color: #7cc0dc; color: #0d181d; }
html[data-theme="dark"] .u4-lang-seg,
html[data-theme="dark"] .u4-seg-switch,
html.dark .u4-lang-seg,
html.dark .u4-seg-switch { background: #121618; border-color: #2c3539; color: #a8b6bc; }
html[data-theme="dark"] .u4-lang-seg a.u4-seg-opt,
html[data-theme="dark"] .u4-seg-switch .u4-seg-opt,
html.dark .u4-lang-seg a.u4-seg-opt,
html.dark .u4-seg-switch .u4-seg-opt { color: #a8b6bc; }
html[data-theme="dark"] .u4-lang-seg .u4-seg-thumb,
html[data-theme="dark"] .u4-seg-switch .u4-seg-thumb,
html.dark .u4-lang-seg .u4-seg-thumb,
html.dark .u4-seg-switch .u4-seg-thumb { background: #7cc0dc; }
html[data-theme="dark"] .u4-lang-seg a.u4-seg-opt.is-active,
html[data-theme="dark"] .u4-seg-switch[aria-checked="false"] .u4-seg-opt.is-a,
html[data-theme="dark"] .u4-seg-switch[aria-checked="true"] .u4-seg-opt.is-b,
html.dark .u4-lang-seg a.u4-seg-opt.is-active,
html.dark .u4-seg-switch[aria-checked="false"] .u4-seg-opt.is-a,
html.dark .u4-seg-switch[aria-checked="true"] .u4-seg-opt.is-b { color: #0d181d; }
html[data-theme="dark"] .sheet,
html.dark .sheet { background: #ecefed; border-color: #39444a; }
@media screen and (max-width: 640px) {
  body { padding: 6px; }
  .u4-doc-topbar { padding: 6px 8px; gap: 6px; }
  .u4-doc-topbar-left, .u4-doc-topbar-right { gap: 6px; max-width: 100%; }
  .u4-doc-navbtn { min-height: 36px; padding: 4px 9px; font-size: 11px; max-width: 100%; white-space: normal; line-height: 1.2; }
  .u4-lang-seg, .u4-seg-switch { min-height: 36px; height: 36px; }
  .sheet { padding: 6px 8px; margin-bottom: 10px; overflow-x: hidden; }
  .hdr { flex-direction: column; align-items: flex-start; gap: 4px; }
  .hdr-left h1 { font-size: 13.5px; overflow-wrap: anywhere; }
  .hdr-left .sub { font-size: 9.2px; overflow-wrap: anywhere; }
  .hdr-right { text-align: left; }
  .grid-2, .grid-65 { grid-template-columns: 1fr; gap: 6px; }
  .box { min-width: 0; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 5px 6px; }
  table, .ptbl-compact { display: block; width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ftr { flex-direction: column; gap: 3px; overflow-wrap: anywhere; }
}
@media (prefers-reduced-motion: reduce) {
  .u4-lang-seg .u4-seg-thumb, .u4-seg-switch .u4-seg-thumb { transition: none !important; }
}
@media print {
  .u4-doc-topbar { display: none !important; }
  html[data-theme="dark"] body, html[data-theme="dark"] .sheet,
  html.dark body, html.dark .sheet { background: #ffffff !important; }
}
/* U4_R5_WEB_TOPBAR_END */

/* U4_R5_WEB_TOPBAR_START */
.u4-doc-topbar {
  max-width: 10.4in;
  margin: 0 auto 10px auto;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #d9dedc;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
}
.u4-doc-topbar-left, .u4-doc-topbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.u4-doc-navbtn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid #d9dedc;
  background: #f4f5f3;
  color: #1d2326;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-weight: 600;
  font-size: 12px;
  text-decoration: none;
}
.u4-doc-navbtn:hover {
  border-color: #1f5f7a;
  background: #e3eef2;
  color: #1f5f7a;
}
.u4-doc-navbtn.is-primary {
  background: #1f5f7a;
  border-color: #1f5f7a;
  color: #ffffff;
}
.u4-lang-seg {
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(3, minmax(30px, 1fr));
  align-items: center;
  padding: 2px;
  height: 32px;
  min-width: 100px;
  border-radius: 999px;
  border: 1px solid #d9dedc;
  background: #f4f5f3;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 700;
}
.u4-lang-seg .u4-seg-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc((100% - 4px) / 3);
  height: calc(100% - 4px);
  border-radius: 999px;
  background: #1f5f7a;
  transition: transform 170ms cubic-bezier(0.22, 0.9, 0.32, 1);
  pointer-events: none;
}
.u4-lang-seg[data-lang="es"] .u4-seg-thumb { transform: translateX(100%); }
.u4-lang-seg[data-lang="ru"] .u4-seg-thumb { transform: translateX(200%); }
.u4-lang-seg a.u4-seg-opt {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 6px;
  color: #485358;
  text-decoration: none;
}
.u4-lang-seg a.u4-seg-opt.is-active { color: #ffffff; }
.u4-seg-switch {
  position: relative;
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 2px;
  height: 32px;
  min-width: 64px;
  border-radius: 999px;
  border: 1px solid #d9dedc;
  background: #f4f5f3;
  color: #485358;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}
.u4-seg-switch .u4-seg-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  border-radius: 999px;
  background: #1f5f7a;
  transition: transform 160ms ease;
}
.u4-seg-switch[aria-checked="true"] .u4-seg-thumb { transform: translateX(100%); }
.u4-seg-switch .u4-seg-opt {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  color: #485358;
}
.u4-seg-switch[aria-checked="false"] .u4-seg-opt.is-a,
.u4-seg-switch[aria-checked="true"] .u4-seg-opt.is-b { color: #ffffff; }
html[data-theme="dark"] body,
html.dark body { background: #121618; }
html[data-theme="dark"] .u4-doc-topbar,
html.dark .u4-doc-topbar { background: #1a2023; border-color: #2c3539; color: #e4e9ea; }
html[data-theme="dark"] .u4-doc-navbtn,
html.dark .u4-doc-navbtn { background: #121618; border-color: #2c3539; color: #e4e9ea; }
html[data-theme="dark"] .u4-doc-navbtn:hover,
html.dark .u4-doc-navbtn:hover { border-color: #7cc0dc; background: #1d3440; color: #7cc0dc; }
html[data-theme="dark"] .u4-doc-navbtn.is-primary,
html.dark .u4-doc-navbtn.is-primary { background: #7cc0dc; border-color: #7cc0dc; color: #0d181d; }
html[data-theme="dark"] .u4-lang-seg,
html[data-theme="dark"] .u4-seg-switch,
html.dark .u4-lang-seg,
html.dark .u4-seg-switch { background: #121618; border-color: #2c3539; color: #a8b6bc; }
html[data-theme="dark"] .u4-lang-seg a.u4-seg-opt,
html[data-theme="dark"] .u4-seg-switch .u4-seg-opt,
html.dark .u4-lang-seg a.u4-seg-opt,
html.dark .u4-seg-switch .u4-seg-opt { color: #a8b6bc; }
html[data-theme="dark"] .u4-lang-seg .u4-seg-thumb,
html[data-theme="dark"] .u4-seg-switch .u4-seg-thumb,
html.dark .u4-lang-seg .u4-seg-thumb,
html.dark .u4-seg-switch .u4-seg-thumb { background: #7cc0dc; }
html[data-theme="dark"] .u4-lang-seg a.u4-seg-opt.is-active,
html[data-theme="dark"] .u4-seg-switch[aria-checked="false"] .u4-seg-opt.is-a,
html[data-theme="dark"] .u4-seg-switch[aria-checked="true"] .u4-seg-opt.is-b,
html.dark .u4-lang-seg a.u4-seg-opt.is-active,
html.dark .u4-seg-switch[aria-checked="false"] .u4-seg-opt.is-a,
html.dark .u4-seg-switch[aria-checked="true"] .u4-seg-opt.is-b { color: #0d181d; }
html[data-theme="dark"] .sheet,
html.dark .sheet { background: #ecefed; border-color: #39444a; }
@media screen and (max-width: 640px) {
  body { padding: 6px; }
  .u4-doc-topbar { padding: 6px 8px; gap: 6px; }
  .u4-doc-topbar-left, .u4-doc-topbar-right { gap: 6px; max-width: 100%; }
  .u4-doc-navbtn { min-height: 36px; padding: 4px 9px; font-size: 11px; max-width: 100%; white-space: normal; line-height: 1.2; }
  .u4-lang-seg, .u4-seg-switch { min-height: 36px; height: 36px; }
  .sheet { padding: 6px 8px; margin-bottom: 10px; overflow-x: hidden; }
  .hdr { flex-direction: column; align-items: flex-start; gap: 4px; }
  .hdr-left h1 { font-size: 13.5px; overflow-wrap: anywhere; }
  .hdr-left .sub { font-size: 9.2px; overflow-wrap: anywhere; }
  .hdr-right { text-align: left; white-space: normal; margin-left: 0; }
  .grid-2, .grid-65 { grid-template-columns: 1fr; gap: 6px; }
  .box { min-width: 0; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 5px 6px; }
  table, .ptbl-compact { display: block; width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ftr { flex-direction: column; gap: 3px; overflow-wrap: anywhere; }
}
@media (prefers-reduced-motion: reduce) {
  .u4-lang-seg .u4-seg-thumb, .u4-seg-switch .u4-seg-thumb { transition: none !important; }
}
@media print {
  .u4-doc-topbar { display: none !important; }
  html[data-theme="dark"] body, html[data-theme="dark"] .sheet,
  html.dark body, html.dark .sheet { background: #ffffff !important; }
}
/* U4_R5_WEB_TOPBAR_END */
"""


RU_MAP = {
    "1231 11th Ave, Unit 4 · San Francisco · INTERNAL CREW WORKING PLAN (NOT A PERMIT SET) · Panel: Eaton BRP20L125G": "1231 11th Ave, Кв. 4 · Сан-Франциско · ВНУТРЕННИЙ РАБОЧИЙ ПЛАН БРИГАДЫ (НЕ ДЛЯ РАЗРЕШЕНИЙ) · Щит: Eaton BRP20L125G",
    "REV R6 · WHOLE-UNIT LOCKED · 2026-11-25": "РЕД. R5 · СОГЛАСОВАНО ПРОВЕРКОЙ · 2026-11-23",
    "DARK TAG = Physical Box / Switch (Fixed Location)": "ТЁМНАЯ МЕТКА = Физическая коробка / выключатель (фиксированное место)",
    "#N · 12/2 YELLOW = 20A": "#N · 12/2 ЖЁЛТЫЙ = 20А",
    "#N · 14/2 WHITE = 15A": "#N · 14/2 БЕЛЫЙ = 15А",
    "#N · 14/3 RED = 3-Way / Smoke": "#N · 14/3 КРАСНЫЙ = Проходной / Дым",
    "DASHED = Reuse Sound Existing": "ПУНКТИР = Сохранить исправную проводку",
    "RED = Active Hold / Safety Gate": "КРАСНЫЙ = Активная пауза / Запрет",
    "Bare Subfloor Down: H_subfloor = H_AFF + t (est. t = 3/4\" — verify on site before fastening boxes) · 1:1 True Scale (scaleX = scaleY)": "От чернового пола: H_черн = H_AFF + t (ориентир t = 3/4\" — проверить на месте до крепежа коробок) · Истинный масштаб 1:1 (scaleX = scaleY)",
    "W": "З",
    "48\" (4 ft)": "48\" (4 фт)",
    "72\" (6 ft)": "72\" (6 фт)",
    "96\" (8 ft)": "96\" (8 фт)",
    "120\" (10 ft)": "120\" (10 фт)",
    "MODULE 1: KITCHEN ELECTRICAL": "МОДУЛЬ 1: ЭЛЕКТРИКА КУХНИ",
    "Module 1 (Kitchen)": "Модуль 1 (Кухня)",
    "MODULE 2: WHOLE-UNIT SEGMENTS": "МОДУЛЬ 2: СЕГМЕНТЫ ВСЕЙ КВАРТИРЫ",
    "Module 2 (Whole Unit)": "Модуль 2 (Вся квартира)",
    "Cover, Sheet Index, Two-Mapping Rules & Active Holds": "Титульный лист, ведомость листов, правило двух привязок и активные паузы",
    "Complete 20-Space Panel Directory (#1–#20 · 15 Active + 5 Spares (#11, #17–#20))": "Полная таблица щита на 20 модулей (#1–#20 · 16 рабочих + 4 резерва)",
    "Complete 20-Space Panel Directory (#1–#20)": "Полная таблица щита на 20 модулей (#1–#20)",
    "Kitchen 1:1 Floor Plan — True West Step Wall, Boxes & Circuits (#1–#9)": "План кухни 1:1 — Западный уступ стены, коробки и линии (#1–#9)",
    "Kitchen East (126-1/4\") & South (147\") 1:1 Elevations + Dual Datums": "Развёртки 1:1: Восточная (126-1/4\") и Южная (147\") стены + двойной отсчёт высот",
    "Kitchen West (66-1/4\") & North (115-1/2\") 1:1 Elevations + Hood Offset": "Развёртки 1:1: Западная (66-1/4\") и Северная (115-1/2\") стены + смещение вытяжки",
    "Kitchen Box-to-Circuit Schedule & Pre-Drywall Verification Checklist": "Таблица привязки коробок кухни к автоматам и чек-лист перед гипсокартоном",
    "Whole-Unit 1:1 Key Map (508\"×298\"), Segments & Panel Clear Space": "Обзорная схема квартиры 1:1 (508\"×298\"), сегменты и рабочая зона щита",
    "Segment A: Living & Dining — Individual Outlets, Holds & Attic J-Boxes": "Сегмент A: Гостиная и столовая — розетки, паузы и чердачные коробки",
    "Segment B: Bathroom All-in-One (#13 · 12/2) + Pre-Tile Toilet Drop": "Сегмент B: Ванная на одной линии (#13 · 12/2) + отдельный спуск к унитазу до плитки",
    "Segment C: Laundry East Wall @ 38\" AFF (#14) + Bedroom & Hall (#11/#12)": "Сегмент C: Прачечная вост. стена 38\" AFF (#14) + Спальня и коридор (#11/#12)",
    "Segment D: Attic Hatch, Furnace (#15), Service & Smoke/CO Clearances (#16)": "Сегмент D: Люк чердака, Печь чердака (#15), Чердак сервис и отступы дым/CO (#16)",
    "Sheet": "Лист",
    "Contents": "Содержание",
    "Sheet Index": "Ведомость листов",
    "How the Two Independent Mappings Work": "Как работают две независимые привязки",
    "Mapping 1 — Physical Box / Switch / Fixture Name (Dark Tag):": "Привязка 1 — Физическое имя коробки / выключателя / светильника (тёмная метка):",
    "Fixed physical location on the wall or ceiling (East 1, Under-Sink 2-Gang, Entry 3-Switch, Dining 1–4, Vanity, Toilet, Washer/Dryer, Bath J-Box). Never changes if circuits are split later; one multi-gang box can hold multiple circuits.": "Фиксированная точка на стене или потолке (Восток 1, Двойная под мойкой, Вход 3 выкл., Столовая 1–4, Раковина, Унитаз, Стирка/Сушка, Коробка ванной). Не меняется при разделении линий; многопостовая коробка может вмещать несколько линий.",
    "Mapping 2 — Assigned Circuit & Cable (#1–#20 Pill):": "Привязка 2 — Назначенный автомат и кабель (плашка #1–#20):",
    "Eaton BRP20L125G breaker slot + Romex color/gauge: 12/2 Yellow = 20A (#1–#5, #10*, #13, #14; #11 & #17–#20 Spares) · 14/2 White = 15A (#6–#9, #12, #15, #16) · 14/3 Red = 3-way travelers (#12) & Smoke/CO interconnect (#16).": "Модуль щита Eaton BRP20L125G + сечение/цвет Romex: 12/2 жёлтый = 20А (#1–#5, #10*, #11*, #13, #14) · 14/2 белый = 15А (#6–#9, #12, #15, #16) · 14/3 красный = проходные жилы (#12) и шлейф датчиков дыма/CO (#16).",
    "Active Holds & Code Guardrails (Read First)": "Активные паузы и требования норм (прочитать до работ)",
    "Panel & Feeder Hold (Mon Nov 23):": "Пауза по щиту и вводу (пн 23 нояб.):",
    "Reconcile NEXT 80A/#4 vs. 100A/#3 feeder & hold side-entry notches on Panel (X=147\", Y=213.75\"/214\", faces Dining; 30\"W×36\"D×78\"H clear per SFEC 110.26(A)(3); ZERO back-entries or screws 53\"–77\" AFF on Kitchen East wall).": "Согласовать ввод NEXT 80А/#4 или 100А/#3 и не делать боковые вырезы Щита (X=147\", Y=213.75\"/214\", дверца в столовую; свободная зона 30\"Ш×36\"Г×78\"В по SFEC 110.26(A)(3); НОЛЬ задних вводов и саморезов 53\"–77\" AFF на вост. стене кухни).",
    "Reused Wire Gauge Gate (#10 Shared):": "Проверка сечения старых проводов (#10 и #11):",
    "Verify gauge of EVERY reused wire leg (NEC 240.4(D)(3)): if ANY reused segment is 14 AWG, install a 15A AFCI (BRN115AF) breaker (never 20A!).": "Проверить сечение КАЖДОГО сохраняемого участка (NEC 240.4(D)(3)): если ХОТЯ БЫ ОДИН участок — 14 AWG, ставить автомат 15А AFCI (BRN115AF, никогда не 20А!).",
    "SFEC 362.10 vs. Non-Kitchen Hold:": "SFEC 362.10 и пауза вне кухни:",
    "SFEC 362.10 restricts ENT in wood walls whereas SFEC 334.10(2) permits concealed NM-B; preserve task 6hvRcQ7Gmh3fG5m7 NO-WIRE-PULL hold until owner/inspector release.": "SFEC 362.10 ограничивает гофру ENT в деревянных стенах, тогда как SFEC 334.10(2) допускает скрытый NM-B; сохранять запрет на протяжку проводов по задаче 6hvRcQ7Gmh3fG5m7 до разрешения.",
    "South Window CL & Pocket-Door Holds:": "Пауза по оси южного окна и кассетам раздвижных дверей:",
    "Verify Kitchen South window CL (87\" vs. 90\" W of SE) before fastening South 2 / Under-Sink 2-Gang; ZERO boxes inside ~33\" pocket-door cavities (Dining D6 / Living L6).": "Проверить ось южного окна кухни (87\" или 90\" З от ЮВ) до крепления Юг 2 / Двойная под мойкой; НОЛЬ коробок в ~33\" кассетах раздвижных дверей (Столовая D6 / Гостиная L6).",
    "Brkr": "Авт.",
    "Status": "Статус",
    "Circuit Name (Panel Sticker)": "Имя линии (маркировка щита)",
    "Protection / Breaker": "Защита / Автомат",
    "Cable": "Кабель",
    "Physical Boxes Currently Fed (Mapping 1)": "Подключённые физические коробки (Привязка 1)",
    "NEW": "НОВАЯ",
    "REUSE": "СУЩЕСТВ.",
    "4 SPARES": "4 РЕЗЕРВА",
    "Open Panel Spaces (#17, #18, #19, #20)": "Резервные места щита (#17, #18, #19, #20)",
    "4 Open Full-Size Spaces": "4 полноразмерных резервных модуля",
    "#17 Living/Dining split · #18 Bedroom split · #19 Toilet bidet split · #20 Open": "#17 Разделение гостиной/столовой · #18 Разделение спальни · #19 Биде унитаза · #20 Свободно",
    "Panel Directory — Eaton BRP20L125G (15 Active Circuits (#1–#10, #12–#16) + 5 Open Spares (#11, #17–#20))": "Таблица щита — Eaton BRP20L125G (16 активных линий #1–#16 + 4 резерва #17–#20)",
    "20A AFCI/GFCI (BRN120DF)": "20A AFCI/GFCI (BRN120DF)",
    "15A AFCI/GFCI (BRN115DF)": "15A AFCI/GFCI (BRN115DF)",
    "15A AFCI (BRN115AF)": "15A AFCI (BRN115AF)",
    "Kitchen East Counter": "Столешница Восток (кухня)",
    "East 1 (10\" N), East 2 (45\" N) — 50\" bore band": "Восток 1 (10\" С), Восток 2 (45\" С) — трасса сверления 50\"",
    "Kitchen South Counter": "Столешница Юг (кухня)",
    "South 1 (24\" W), South 2 (62\" W — verify CL 87\" vs 90\")": "Юг 1 (24\" З), Юг 2 (62\" З — проверить ось 87\" или 90\")",
    "Kitchen West Counter": "Столешница Запад (кухня)",
    "West 1 (9\" N), West 2 (57\" N of Step) — ~1\" tile mud rings": "Запад 1 (9\" С), Запад 2 (57\" С от уступа) — рамки ~1\" под плитку",
    "Fridge": "Холодильник",
    "Fridge single 20A TR (East 68\" N of SE, 15\" AFF behind 28\" Haier)": "Холодильник: одинарная розетка 20А TR (Восток 68\" С от ЮВ, 15\" AFF за Haier 28\")",
    "Dishwasher": "Посудомоечная машина",
    "Under-Sink 2-Gang LEFT yoke (separate 20A TR receptacle & neutral, 14\" AFF)": "Двойная под мойкой ЛЕВЫЙ механизм / суппорт (yoke: отд. 20А TR и нейтраль, 14\" AFF)",
    "Disposal": "Измельчитель",
    "Under-Sink 2-Gang RIGHT yoke (separate 15A TR & neutral) + Air Button (90\" W)": "Двойная под мойкой ПРАВЫЙ механизм / суппорт (yoke: отд. 15А TR и нейтр.) + Кнопка измельчителя (90\" З)",
    "Gas Range": "Газовая плита",
    "Range 15A TR (West 33\" N of Step, 3\" AFF low Viking pocket)": "Плита: розетка 15А TR (Запад 33\" С от уступа, 3\" AFF нижняя ниша Viking)",
    "Range Hood": "Вытяжка",
    "15A AFCI (BRN115AF) + BRLW1 Lock": "15A AFCI (BRN115AF) + блокиратор BRLW1",
    "Hood flush 1-gang 2\"x3\" ~1\" proud (33\" +- 2-1/4\" N, 83\"-86\" AFF; NO 4x4 @ 100\")": "Вытяжка: 1-пост 2\"×3\" выступ ~1\" (33\" ± 2-1/4\" С, 83\"–86\" AFF; БЕЗ 4×4 на 100\")",
    "Kitchen Lights": "Свет кухни",
    "Entry 3-Switch (North 35.5\" W of NE, 48\" AFF) -> Ceiling, Sink Pendants, Under-Cab": "Вход 3 выкл. (Север 35.5\" З от СВ, 48\" AFF) -> Потолок, Подвесы мойки, Подсветка шкафов",
    "Living & Dining Outlets": "Розетки гостиной и столовой",
    "20A AFCI* (15A if 14 AWG reused!)": "20A AFCI* (15A если сохранён 14 AWG!)",
    "Dining 1-4 + Living 1-5 via Living/Dining J-Box (NO Panel-wall box; D6/L6 pocket hold)": "Столовая 1–4 + Гостиная 1–5 через Коробку гост./стол. (БЕЗ розетки на стене Щита; пауза D6/L6)",
    "Bedroom & Hall Outlets": "Розетки спальни и коридора",
    "Bed 1-5 (11.5\" AFF dark horiz.) + Hall 1 (18\" AFF) via Bed/Hall J-Box": "Спальня 1–5 (11.5\" AFF тёмные гориз.) + Коридор 1 (18\" AFF) через Коробку спальни/кор.",
    "Room Lights (Common Rooms)": "Свет жилых комнат и коридора",
    "Living, Dining, Bed, Hall 1-2 (2x 3-Way 14/3) & Laundry Light/Switch via Lights J-Box": "Свет/выкл. гостиной, столовой, спальни, коридора 1–2 (2× прох. 14/3) и прачечной через Коробку света",
    "Bathroom (Outlets, Lights & Fan)": "Ванная (розетки, свет и вентилятор)",
    "1 circuit via Bath J-Box (100% 12/2): Vanity, Toilet (sep. drop!), Ceiling + Vanity Lights, Fan": "1 линия через Коробку ванной (100% 12/2): Раковина, Унитаз (отд. спуск!), Свет потолка/раковины, Вентилятор",
    "Laundry WashTower": "Прачечная WashTower",
    "20A AFCI/GFCI at Panel (BRN120DF)": "20A AFCI/GFCI в Щите (BRN120DF)",
    "Washer/Dryer 1x 20A duplex (East wall @ 38\" AFF; both 120V LG cords; Panel GFCI reset)": "Стирка/Сушка: 1 двойная розетка 20А (вост. стена 38\" AFF; оба шнура 120В LG; сброс GFCI в Щите)",
    "Attic Furnace": "Печь чердака",
    "15A Standard (BR115)": "15A стандартный (BR115)",
    "Dedicated to F1 Furnace + local Disconnect Switch at platform (174\", 258\")": "Выделенная линия: Печь чердака F1 + местный выключатель у площадки (174\", 258\")",
    "Attic Light, Outlet & Smoke/CO": "Чердак сервис и датчики дыма/CO",
    "15A AFCI-ONLY (BRN115AF — NO GFCI!)": "15A ТОЛЬКО AFCI (BRN115AF — БЕЗ GFCI!)",
    "Unswitched 14/2+14/3 to Smoke/COs; LINE-only GFCI Attic Outlet (<=25 ft F1) + Hatch Switch": "Прямой 14/2+14/3 на дым/CO; розетка GFCI Чердак сервис ТОЛЬКО LINE (<=25 фт от F1) + выкл. люка",
    "Kitchen 1:1 Floor Plan (Boxes vs. Circuits #1–#9)": "План кухни 1:1 (Коробки и линии #1–#9)",
    "1:1 True-Scale Plan (North UP · SE = 0\" · West Range Wall at X = 31.5\" Step)": "План в масштабе 1:1 (Север ВВЕРХУ · ЮВ = 0\" · Стена плиты по уступу X = 31.5\")",
    "Kitchen Circuits (#1–#9) & Field Rules": "Линии кухни (#1–#9) и правила монтажа",
    "ALC.": "НИША",
    "FRIDGE 28\"": "ХОЛОД. 28\"",
    "DW 24\"": "ПММ 24\"",
    "SINK 30\"": "МОЙКА 30\"",
    "RANGE 30\"": "ПЛИТА 30\"",
    "West 2 (57\" N)": "Запад 2 (57\" С)",
    "Hood (33±2.25\")": "Вытяжка (33±2.25\")",
    "Range (33\" N)": "Плита (33\" С)",
    "West 1 (9\" N)": "Запад 1 (9\" С)",
    "Sink Pendants": "Подвесы мойки",
    "Air Button (90\")": "Кнопка изм. (90\")",
    "#6 · Tube": "#6 · Трубка",
    "Entry 3-Switch (35.5\" W)": "Вход 3 выкл. (35.5\" З)",
    "Ceiling Light": "Свет потолка",
    "Fridge (68\" N)": "Холодильник (68\" С)",
    "East 2 (45\" N)": "Восток 2 (45\" С)",
    "Panel Back (HOLD)": "Тыл Щита (ПАУЗА)",
    "East 1 (10\" N)": "Восток 1 (10\" С)",
    "Under-Sink 2-Gang (76\")": "Двойная под мойкой (76\")",
    "South 2 (62\" W*)": "Юг 2 (62\" З*)",
    "South 1 (24\" W)": "Юг 1 (24\" З)",
    "East Counter:": "Столешница Восток:",
    "East 1": "Восток 1",
    "East 2": "Восток 2",
    "South Counter:": "Столешница Юг:",
    "South 1": "Юг 1",
    "South 2": "Юг 2",
    "hold: verify CL 87\" vs. 90\"": "пауза: проверить ось 87\" или 90\"",
    "West Counter:": "Столешница Запад:",
    "West 1": "Запад 1",
    "West 2": "Запад 2",
    "of South Step": "от южного уступа",
    "Under-Sink 2-Gang": "Двойная под мойкой",
    "2 separate TR receptacles on 2 separate yokes + separate neutrals; NEVER split-wire 1 duplex!": "2 отдельные розетки TR на 2 отдельных механизмах / суппортах (yoke) + отдельные нейтрали; НИКОГДА не делить перемычку 1 двойной!",
    "Range": "Плита",
    "Hood": "Вытяжка",
    "proud + BRLW1 lock": "выступ + блок BRLW1",
    "Entry 3-Switch": "Вход 3 выкл.",
    "of NE, 48\" AFF -> Ceiling, Pendants, Under-Cab": "от СВ, 48\" AFF -> Потолок, Подвесы мойки, Подсветка",
    "ACTIVE HOLDS:": "АКТИВНЫЕ ПАУЗЫ:",
    "1) Verify South window CL (87\" vs. 90\") & tape zero before rough-in. 2) NO screws/cables in Panel back (13\"–27.5\" N, 53\"–77\" AFF). 3) Sealed Pie-Safe (26\"–59\" W, 43\"–80\" AFF) is flush wall — photo-verify closure before cover.": "1) Проверить ось южного окна (87\" или 90\") и нулевую отметку рулетки до черновой разводки. 2) НОЛЬ саморезов и кабелей в тыльной зоне Щита (13\"–27.5\" С, 53\"–77\" AFF). 3) Ниша Pie-Safe зашита заподлицо (26\"–59\" З, 43\"–80\" AFF) — фотофиксация перед закрытием.",
    "EastWall (#1/#4) & South Wall (#2/#5/#6/#9) 1:1 Elevations": "Развёртки 1:1: Восточная (#1/#4) и Южная (#2/#5/#6/#9) стены",
    "East Wall (#1/#4) & South Wall (#2/#5/#6/#9) 1:1 Elevations": "Развёртки 1:1: Восточная (#1/#4) и Южная (#2/#5/#6/#9) стены",
    "EAST WALL (126-1/4\" W × 121-1/2\" H · Looking East)": "ВОСТОЧНАЯ СТЕНА (126-1/4\" Ш × 121-1/2\" В · Вид на Восток)",
    "SOUTH WALL (147\" W × 121-1/2\" H · Looking South · HOLD CL 87\"/90\")": "ЮЖНАЯ СТЕНА (147\" Ш × 121-1/2\" В · Вид на Юг · ПАУЗА ОСИ 87\"/90\")",
    "HALL": "ПРОХОД",
    "FRIDGE": "ХОЛОД.",
    "Panel Back": "Тыл Щита",
    "NO SCREW 53-77\"": "БЕЗ ВИНТОВ 53-77\"",
    "Fridge (15\" AFF)": "Холодильник (15\")",
    "SEALED PIE-SAFE": "НИША ЗАШИТА",
    "WINDOW": "ОКНО",
    "DOOR": "ДВЕРЬ",
    "SW = 147\"": "ЮЗ = 147\"",
    "Pendants (75/99\")": "Подвесы мойки (75/99\")",
    "Under-Sink (76\" · 14\" AFF)": "Двойная под мойкой (76\"·14\")",
    "#5+#6 (2 Yokes)": "#5+#6 (2 супп.)",
    "Air Btn (90\")": "Кнопка изм. (90\")",
    "1:1 Proportional Elevations (Ceiling = 121-1/2\" AFF · Add +t [est. 3/4\"] When Measuring From Bare Subfloor)": "Пропорциональные развёртки 1:1 (Потолок = 121-1/2\" AFF · Прибавлять +t [~3/4\"] при замере от чернового пола)",
    "Dual-Datum Guide: 14\" AFF = 14-3/4\" subfloor (if t=3/4\") · 15\" AFF = 15-3/4\" subfloor · 36\" Counter = 36-3/4\" subfloor · 44\" Counter Outlets = 44-3/4\" subfloor (41\" AFF alt pending K-S6 markup) · 53\"–77\" AFF Panel No-Screw Band = 53-3/4\"–77-3/4\" subfloor.": "Двойной отсчёт высот: 14\" AFF = 14-3/4\" от черн. пола (при t=3/4\") · 15\" AFF = 15-3/4\" черн. · 36\" Столешница = 36-3/4\" черн. · 44\" Розетки столешницы = 44-3/4\" черн. (альт. 41\" AFF до разметки K-S6) · 53\"–77\" AFF Зона без саморезов за Щитом = 53-3/4\"–77-3/4\" черн.",
    "West Wall (#3/#7/#8) & North Wall (#9) 1:1 Elevations": "Развёртки 1:1: Западная (#3/#7/#8) и Северная (#9) стены",
    "WEST RANGE WALL (66-1/4\" × 121-1/2\" · Looking West)": "ЗАПАДНАЯ СТЕНА ПЛИТЫ (66-1/4\" × 121-1/2\" · Вид на Запад)",
    "NORTH ENTRY WALL (115-1/2\" × 121-1/2\" · Looking North)": "СЕВЕРНАЯ ВХОДНАЯ СТЕНА (115-1/2\" × 121-1/2\" · Вид на Север)",
    "Step = 0\"": "Уступ = 0\"",
    "NW = 66.25\"": "СЗ = 66.25\"",
    "Range (33\" · 3\" AFF)": "Плита (33\" · 3\" AFF)",
    "PICTURE RAIL 103\" AFF": "КАРНИЗ КАРТИН 103\" AFF",
    "9-1/2\" BASEBOARD (KEEP)": "ПЛИНТУС 9-1/2\" (СОХРАНИТЬ)",
    "HALL 29.5\"": "ПРОХОД 29.5\"",
    "Entry 3-Switch (48\" AFF)": "Вход 3 выкл. (48\" AFF)",
    "NW = 0\"": "СЗ = 0\"",
    "1:1 Proportional Elevations — Hood 1-Gang Offset 33\" ± 2-1/4\" N (~1\" Proud) Clears 6\" Center Duct": "Развёртки 1:1 — Коробка Вытяжки 1-пост смещена 33\" ± 2-1/4\" С (выступ ~1\") мимо центрального воздуховода 6\"",
    "West Wall Tile & Hood Lock: 1/2\" Drywall meets 1/2\" HardieBacker 500 directly on studs (ZERO 3/16\" shims). Set West 1, West 2, and Hood 1-gang 2\"×3\" boxes ~1\" proud for backer + tile; verify knockout side on Zephyr Savona downstairs (NEVER install retired 4\"×4\" box @ 100\").": "Плитка западной стены и Вытяжка: ГКЛ 1/2\" стыкуется с HardieBacker 500 1/2\" прямо по стойкам (НОЛЬ подкладок 3/16\"). Выставить коробки Запад 1, Запад 2 и Вытяжка (1-пост 2\"×3\") с выступом ~1\" под плиту и плитку; проверить сторону ввода на вытяжке Zephyr Savona внизу (НЕ ставить отменённую коробку 4\"×4\" на 100\").",
    "Kitchen Box-to-Circuit Schedule & Pre-Drywall Checklist": "Таблица коробок кухни и чек-лист перед закрытием стен",
    "Mapping 1 (Physical Box Location) vs. Mapping 2 (Assigned Circuit #1–#9)": "Привязка 1 (Физическая коробка) и Привязка 2 (Назначенная линия #1–#9)",
    "Physical Box / Switch (Mapping 1)": "Физическая коробка / выкл. (Привязка 1)",
    "Wall & Station": "Стена и отметка",
    "Height (AFF +t)": "Высота (AFF +t)",
    "Assigned Circuit (Mapping 2)": "Назначенная линия (Привязка 2)",
    "Installation & Hold Notes": "Примечания по монтажу и паузам",
    "East · 10\" N of SE": "Восток · 10\" С от ЮВ",
    "44\" AFF (+t)": "44\" AFF (+t)",
    "#1 · Kitchen East Counter": "#1 · Столешница Восток (кухня)",
    "12/2": "12/2",
    "20A TR deep 1-gang (41\" AFF alt pending K-S6; below 53\" Panel zone)": "Глубокая 1-пост 20А TR (альт. 41\" AFF по K-S6; ниже зоны 53\" Щита)",
    "East · 45\" N of SE": "Восток · 45\" С от ЮВ",
    "20A TR duplex centered over Nov 22 18\" drawer base (36\"–54\" N)": "Двойная розетка 20А TR по центру тумбы с ящиками 18\" (36\"–54\" С)",
    "East · 68\" N of SE": "Восток · 68\" С от ЮВ",
    "15\" AFF (+t)": "15\" AFF (+t)",
    "#4 · Fridge": "#4 · Холодильник",
    "Single 20A TR behind 28\" Haier (54\"–82\" N; 52.5\" bore band)": "Одинарная розетка 20А TR за Haier 28\" (54\"–82\" С; трасса сверления 52.5\")",
    "South · 24\" W of SE": "Юг · 24\" З от ЮВ",
    "#2 · Kitchen South Counter": "#2 · Столешница Юг (кухня)",
    "20A TR duplex East of flush-sealed Pie-Safe patch (26\"–59\" W)": "Двойная 20А TR восточнее зашитой ниши Pie-Safe (26\"–59\" З)",
    "South · 62\" W* (Hold)": "Юг · 62\" З* (Пауза)",
    "HOLD: 62\" (CL 87\") vs. 65\" (CL 90\") — verify window CL first": "ПАУЗА: 62\" (ось 87\") или 65\" (ось 90\") — сначала проверить ось окна",
    "South · 76\" W* (Hold)": "Юг · 76\" З* (Пауза)",
    "14\" AFF (+t)": "14\" AFF (+t)",
    "#5 DW + #6 Disposal": "#5 ПММ + #6 Измельчитель",
    "12/2 + 14/2": "12/2 + 14/2",
    "Deep >=32 cu.in. 2-gang: 2 SEPARATE TR receptacles/yokes + separate neutrals!": "Глубокая 2-пост >=32 куб.д.: 2 ОТДЕЛЬНЫХ розетки TR / механизма-суппорта (yoke) + отд. нейтрали!",
    "Disposal Air Button": "Кнопка измельчителя",
    "South · 90\" W* (Hold)": "Юг · 90\" З* (Пауза)",
    "36\" Deck": "36\" Борт мойки",
    "#6 · Disposal": "#6 · Измельчитель",
    "Air Hose": "Пневмотрубка",
    "Deck air push-button to plug-in module on #6 (alt wired @ 67\"/70\")": "Пневмокнопка в столешнице к блоку в розетке #6 (альт. выкл. 67\"/70\")",
    "West · 9\" N of Step": "Запад · 9\" С от уступа",
    "#3 · Kitchen West Counter": "#3 · Столешница Запад (кухня)",
    "20A TR duplex + ~1\" tile mud ring (X = 31.5\" Range Wall)": "Двойная 20А TR + рамка ~1\" под плитку (стена плиты X = 31.5\")",
    "West · 57\" N of Step": "Запад · 57\" С от уступа",
    "West · 33\" N of Step": "Запад · 33\" С от уступа",
    "3\" AFF (+t)": "3\" AFF (+t)",
    "#7 · Gas Range": "#7 · Газовая плита",
    "14/2": "14/2",
    "Single 15A TR in low rear Viking pocket beside <=2\" gas shutoff": "Одинарная 15А TR в нижней нише Viking рядом с газовым краном <=2\"",
    "West · 33\"±2.25\" N Step": "Запад · 33\"±2.25\" С уст.",
    "83\"–86\" AFF (+t)": "83\"–86\" AFF (+t)",
    "#8 · Range Hood": "#8 · Вытяжка",
    "Flush 1-gang 2\"×3\" ~1\" proud inside 8-5/8\" shroud + BRLW1 lock": "Встроенная 1-пост 2\"×3\" выступ ~1\" внутри кожуха 8-5/8\" + блок BRLW1",
    "North · 35.5\" W of NE": "Север · 35.5\" З от СВ",
    "48\" AFF (+t)": "48\" AFF (+t)",
    "#9 · Kitchen Lights": "#9 · Свет кухни",
    "6\" W of 29.5\" hall opening: Ceiling · Sink Pendants (75/99\") · Under-Cab": "6\" З от проёма 29.5\": Потолок · Подвесы мойки (75/99\") · Подсветка шкафов",
    "Mandatory Pre-Drywall Sign-Off Checklist (Kitchen)": "Обязательный чек-лист проверки перед зашивкой ГКЛ (Кухня)",
    "Measure finished-floor buildup t & verify common SE tape zero + South window CL (87\" vs. 90\") with tape-in-frame photos.": "Замерить толщину чистового пола t и сверить общий ноль ЮВ + ось южного окна (87\" или 90\") с фото рулетки в кадре.",
    "Verify ZERO screws/boxes/wires in Panel back zone (13\"–27.5\" N, 53\"–77\" AFF) and 1/16\" steel nail plates wherever bore < 1-1/4\" from stud face.": "Проверить НОЛЬ саморезов/коробок/кабелей в тыльной зоне Щита (13\"–27.5\" С, 53\"–77\" AFF) и стальные пластины 1/16\" при сверлении < 1-1/4\" от края стойки.",
    "Verify Under-Sink 2-Gang @ 14\" AFF uses 2 separate receptacles (20A #5 + 15A #6) with separate labeled neutrals, and Hood 1-gang sits at 33\" ± 2-1/4\" N (~1\" proud).": "Проверить, что Двойная под мойкой на 14\" AFF имеет 2 отдельные розетки на 2 суппортах/механизмах (yoke: 20А #5 + 15А #6) с отдельными подписанными нейтралями, а Вытяжка стоит на 33\" ± 2-1/4\" С (выступ ~1\").",
    "Whole-Unit 1:1 Segment Map (508\"×298\")": "План сегментов квартиры 1:1 (508\"×298\")",
    "KITCHEN (MOD 1)": "КУХНЯ (МОД. 1)",
    "DINING (SEG A)": "СТОЛОВАЯ (СЕГ. A)",
    "LIVING (SEG A)": "ГОСТИНАЯ (СЕГ. A)",
    "BATH (B)": "ВАННАЯ (B)",
    "LAU": "СТИР",
    "BEDROOM (SEG C)": "СПАЛЬНЯ (СЕГ. C)",
    "Door 4 Hatch": "Люк двери 4",
    "Kitchen": "Кухня",
    "Panel 30×36\"": "Щит 30×36\"",
    "Bathroom": "Ванная",
    "Laundry Duplex": "Стирка/Сушка",
    "Bed 1–5 + Hall 1": "Спальня 1–5 + Кор. 1",
    "Living 1–5": "Гостиная 1–5",
    "Dining 1–4 + F1": "Столовая 1–4 + F1",
    "1:1 True-Scale Unit 4 Key Map (North UP · All 4 Highlighted Segments E-22 through E-25)": "Обзорная схема квартиры 4 в масштабе 1:1 (Север ВВЕРХУ · Все 4 сегмента E-22 – E-25)",
    "Segment Routing Overview: E-22 Living & Dining (#10 outlets + #12 lights) · E-23 Bathroom (#13 single 20A 12/2 circuit) · E-24 Laundry (#14 East wall @ 38\" AFF) + Bedroom/Hall (#10 shared outlets + #12 3-way lights; #11 Spare) · E-25 Attic Furnace (#15) + Smoke/CO & Service (#16).": "Обзор сегментов: E-22 Гостиная и столовая (#10 розетки + #12 свет) · E-23 Ванная (#13 единая линия 20А 12/2) · E-24 Прачечная (#14 вост. стена 38\" AFF) + Спальня/коридор (#11 розетки + #12 проходной свет) · E-25 Печь чердака (#15) + Чердак сервис и дым/CO (#16).",
    "Segment A: Living & Dining Rooms (#10 Outlets · #12 Lights)": "Сегмент A: Гостиная и столовая (#10 розетки · #12 свет)",
    "Panel (NO D5!)": "Щит (БЕЗ D5!)",
    "30×36\" Clear": "Зона 30×36\"",
    "Liv/Din J-Box": "Кор. гост./стол.",
    "Din Light+Sw": "Свет столовой",
    "Dining 1 & 2 (18\" AFF)": "Столовая 1–2 (18\" AFF)",
    "D6/L6 Pocket HOLD": "ПАУЗА кассет D6/L6",
    "NO BOXES": "БЕЗ КОРОБОК",
    "Living 1 & 2 (L01)": "Гостиная 1–2 (L01)",
    "Living 5 (Bay)": "Гостиная 5 (Эркер)",
    "Liv Light+Sw": "Свет+Выкл. гост.",
    "Dining 3 & 4 (South)": "Столовая 3–4 (Юг)",
    "Living 3 & 4 (Mantel)": "Гостиная 3–4 (Камин)",
    "1:1 Segment A Plan — Dining 1–4 & Living 1–5 (@ 18\" AFF in Lower Frames; 11-1/2\" Alt) + Pocket-Door & Panel Holds": "План 1:1 Сегмент A — Столовая 1–4 и Гостиная 1–5 (18\" AFF в нижних рамках; альт. 11-1/2\") + Паузы кассет и Щита",
    "MANDATORY GAUGE & HOLD RULES (#10):": "ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА ПРОВЕРКИ СЕЧЕНИЯ И ПАУЗ (#10):",
    "1) Gauge-check every reused wire leg before energizing #10 (NEC 240.4(D)(3)): if ANY reused wire is 14 AWG, install a 15A AFCI breaker (BRN115AF) instead of 20A; if ungrounded 2-wire is reused, protect with Dual-Function AFCI/GFCI + 'No Equipment Ground' labels. 2) NO outlet on Panel wall (Dining West). 3) Keep ~33\" double pocket-door cavities completely clear (D6/L6 on hold until pier widths M4/M5 are verified). 4) Add 1-1/2\" extension ring on Living/Dining J-Box (split-ready to Spare #17).": "1) Проверить сечение каждого сохраняемого провода до подачи питания на #10 (NEC 240.4(D)(3)): если ХОТЯ БЫ ОДИН участок — 14 AWG, ставить автомат 15А AFCI (BRN115AF) вместо 20А; при двухпроводке без земли ставить AFCI/GFCI + наклейки 'No Equipment Ground'. 2) БЕЗ розеток на стене Щита (запад столовой). 3) Держать ~33\" кассеты раздвижных дверей полностью пустыми (пауза D6/L6 до замера простенков M4/M5). 4) Поставить удлинительное кольцо 1-1/2\" на Коробку гост./стол. (под разделение на Резерв #17).",
    "Segment B: Bathroom All-in-One (#13 · 12/2 via Bath J-Box)": "Сегмент B: Ванная на одной линии (#13 · 12/2 через Коробку ванной)",
    "TUB / SHOWER (WET/DAMP ZONE)": "ВАННА / ДУШ (ВЛАЖНАЯ ЗОНА)",
    "VANITY": "РАКОВИНА",
    "Bath J-Box": "Коробка ванной",
    "FROM PANEL #13 (12/2)": "ОТ ЩИТА #13 (12/2)",
    "Vanity Light": "Свет раковины",
    "Vanity (40–44\" AFF)": "Раковина (40–44\" AFF)",
    "Pocket Wall HOLD": "ПАУЗА кассеты",
    "NO SWITCHES": "БЕЗ ВЫКЛ.",
    "Bath Light + Humidity Fan": "Свет + Вентилятор",
    "Toilet (12\" AFF · Sep. Drop!)": "Унитаз (12\" · Отд. спуск!)",
    "Bath Switches (Solid Jamb)": "Выкл. ванной (стойка)",
    "1:1 Bathroom Plan (72-1/8\" × 88\") — Coordinate Toilet Box & Separate 12/2 Drop BEFORE Tuesday Wall Tile!": "План ванной 1:1 (72-1/8\" × 88\") — Согласовать коробку Унитаза и отдельный спуск 12/2 ДО укладки плитки во вторник!",
    "CRITICAL 20A BATHROOM & PRE-TILE RULES (#13):": "КРИТИЧЕСКИЕ ПРАВИЛА ЛИНИИ 20А ВАННОЙ И ДО ПЛИТКИ (#13):",
    "1) ALL 5 branches from Bath J-Box (Vanity, Toilet, Ceiling Light, Vanity Light, Humidity Fan & Solid-Jamb Switches) MUST use 12/2 Yellow (NEVER 14/2 on a 20A breaker, NEC 240.4(D)(5); use deep switch box for 12 AWG fill + Title 24 vacancy sensor). 2) ZERO loads outside Bathroom (CEC 210.11(C)(3) Ex.; fastened fan+lights <=10A per 210.23(A)(2)). 3) Pull a SEPARATE home-drop from Bath J-Box to Toilet BEFORE Tuesday wall tile so splitting a heated bidet to Spare #19 later requires zero tile demolition. 4) Damp/wet-rated fixture over tub (CEC 410.10(D)).": "1) ВСЕ 5 ответвлений от Коробки ванной (Раковина, Унитаз, Свет потолка, Свет раковины, Вентилятор влажности и Выключатели в цельной стойке) ОБЯЗАНЫ быть кабелем 12/2 жёлтый (ЗАПРЕЩЁН 14/2 под автоматом 20А, NEC 240.4(D)(5); глубокий подрозетник под 12 AWG + датчик Title 24). 2) НОЛЬ нагрузок вне ванной (CEC 210.11(C)(3) Ex.; свет+вентилятор <=10А по 210.23(A)(2)). 3) Протянуть ОТДЕЛЬНЫЙ спуск 12/2 от Коробки ванной к Унитазу ДО плитки во вторник для будущего выделения крышки-биде на Резерв #19 без демонтажа плитки. 4) Влагозащищённый светильник над ванной (CEC 410.10(D)).",
    "Segment C: Laundry (#14) + Bedroom & Hall (#11/#12)": "Сегмент C: Прачечная (#14) + Спальня и коридор (#11/#12)",
    "Hall 1 (18\" AFF)": "Коридор 1 (18\" AFF)",
    "2× Hall 3-Way+Lts": "2× Прох. кор.",
    "Laundry Lt + Sw": "Свет прачечной",
    "Washer/Dryer (38\")": "Стирка/Сушка (38\")",
    "Bed 1 & 2 (11.5\" AFF)": "Спальня 1–2 (11.5\" AFF)",
    "Bed 5 + J-Box": "Спальня 5 + Кор.",
    "Temp Closet (OPEN)": "Врем. шкаф (ОТКРЫТ)",
    "LV + Hatch": "Низк. + Люк",
    "Bed 3 & 4 + Bed Lt": "Спальня 3–4 + Свет",
    "LAUNDRY EAST WALL 1:1": "ВОСТ. СТЕНА СТИРКИ 1:1",
    "MURPHY 8-1/4\" CLEAR": "ДВЕРЬ MURPHY 8-1/4\"",
    "1 Duplex @ 38\" AFF": "Стирка/Сушка 38\" AFF",
    "1:1 Plan & Laundry East Wall Elevation — 1 Duplex @ 38\" AFF (+t) Clears 8-1/4\" Murphy Door + Reused #11 Gauge Check": "План 1:1 и развёртка вост. стены прачечной — Стирка/Сушка на 38\" AFF (+t) мимо двери Murphy 8-1/4\" + сечение #11",
    "1) Laundry (#14 · 20A 12/2): 1 standard 20A TR duplex on East wall @ 38\" AFF (+t; confirm center vs. top/bottom mark) takes both 120V cords of LG WKG101HVA (10A steam washer + gas dryer ~15–16A combined; keep BRN120DF reset accessible at Panel, NEVER put Laundry Light on #14). 2) Bedroom & Hall (#11): Bed 1–5 use 11-1/2\" AFF dark horizontal plates; step #11 down to 15A AFCI if ANY reused wire leg is 14 AWG. 3) Keep NW Bedroom Temp Closet ceiling open until LV switch wire reaches attic & Door 4 hatch finishes.": "1) Прачечная (#14 · 20А 12/2): 1 двойная розетка 20А TR Стирка/Сушка на вост. стене на 38\" AFF (+t; уточнить центр или край) принимает оба шнура 120В колонны LG WKG101HVA (стирка с паром 10А + газ. сушка ~15–16А суммарно; сброс BRN120DF в Щите, НЕ сажать свет прачечной на #14). 2) Спальня и коридор (#11): Спальня 1–5 — тёмные гориз. рамки на 11-1/2\" AFF; снизить #11 до 15А AFCI, если ХОТЯ БЫ ОДИН старый провод — 14 AWG. 3) Не зашивать потолок врем. шкафа СЗ спальни до вывода слаботочки на чердак и отделки люка двери 4.",
    "Segment D: Attic Furnace (#15) & Service/Smoke/CO (#16)": "Сегмент D: Печь чердака (#15) и Чердак сервис / дым/CO (#16)",
    "72\" HATCH GUARD ZONE": "ЗОНА ЗАЩИТЫ КАБЕЛЯ 72\"",
    "Hatch Sw (Opt A/B)": "Выкл. люка (Вар. A/B)",
    "Panel Top Riser": "Ввод Щита вверх",
    "Max 2/hole": "Макс. 2/отв.",
    "Attic GFCI (LINE)": "Чердак сервис (LINE)",
    "Furnace + Disconn.": "Печь чердака + Выкл.",
    "4 Flagged J-Boxes": "4 коробки чердака",
    "Hall Smoke/CO": "Дым/CO коридор",
    "Bed Smoke": "Дым спальня",
    "Living Smoke/CO": "Дым/CO гостиная",
    "1:1 Attic Overlay — 24\" Walkway (15.8 ft <= 20 ft), 72\" Guard Zone, 4 J-Boxes & Smoke/CO Clearances": "Схема чердака 1:1 — Настил 24\" (15.8 фт <= 20 фт), зона защиты 72\", 4 распредкоробки и отступы дым/CO",
    "CRITICAL LIFE-SAFETY & ATTIC RULES (#15 & #16):": "КРИТИЧЕСКИЕ ПРАВИЛА ПОЖАРНОЙ БЕЗОПАСНОСТИ И ЧЕРДАКА (#15 И #16):",
    "1) #16 Breaker MUST be 15A AFCI-ONLY (Eaton BRN115AF — NEVER a GFCI breaker, CRC R314.6): split unswitched 14/2 ahead of Hatch Switch to Hall Smoke/CO -> 14/3 Red interconnect to Bedroom & Living alarms (10-yr battery backup; keep >=36\" from Bath door & HVAC supply registers and >=10–20 ft from Viking gas range); wire local Attic GFCI Outlet (<=25 ft from F1) LINE-only with LOAD taped off! 2) Protect NM-B within 72\" of Door 4 hatch edge with guard strips (NEC 320.23(A)); NEVER screw into flat roof deck (mount 2 enclosed LEDs on 2×4 rafter blocking >=1-1/2\" below deck); max 2 cables/top-plate hole + fire caulk; flag all 4 J-Boxes (#10–#13) above insulation.": "1) Автомат #16 ОБЯЗАН быть 15А ТОЛЬКО-AFCI (Eaton BRN115AF — НИКОГДА не GFCI, CRC R314.6): ответвить неотключаемый 14/2 до выключателя люка на датчик дыма/CO коридора -> красный шлейф 14/3 в спальню и гостиную (резерв батареи 10 лет; отступ >=36\" от двери ванной и решёток HVAC и >=10–20 фт от газ. плиты Viking); розетку GFCI Чердак сервис (<=25 фт от F1) подключить ТОЛЬКО на клеммы LINE (клеммы LOAD заизолировать!). 2) Защитить кабель NM-B в радиусе 72\" от проёма люка двери 4 брусками (NEC 320.23(A)); НЕ крутить саморезы в настил плоской крыши (крепить 2 закрытых LED на распорки 2×4 >=1-1/2\" ниже настила); макс. 2 кабеля в отверстие верхней обвязки + огнестойкий герметик; поставить флажки на все 4 коробки (#10–#13) выше утеплителя."
,
    "Back wall: 69-5/16\" field note": "Задняя стена: замер 69-5/16\"",
    "28\" OUT-SWING DOOR (FIELD VERIFY)": "ДВЕРЬ 28\" НАРУЖУ (ПРОВЕРИТЬ)",
    "Framed Stud Wall": "Каркасная стена",
    "Switches OK": "Выкл. ОК",
    "Bath Switches (Stud Wall)": "Выкл. ванной (каркас)",
    "1:1 Bathroom Plan (72-1/8\" × 82-1/8\" per SPEC; Nov 24 back-wall note: 69-5/16\") — Outward-Swing Hallway Door (Pocket Door RETIRED) · Separate 12/2 Toilet Drop Before Tile!": "План ванной 1:1 (72-1/8\" × 82-1/8\" по SPEC; замер 24 нояб. задней стены: 69-5/16\") — Дверь наружу в коридор (кассета ОТМЕНЕНА) · Отдельный спуск 12/2 к Унитазу до плитки!",
    "1) ALL 5 branches from Bath J-Box (Vanity, Toilet, Ceiling Light, Vanity Light, Humidity Fan & Switches) MUST use 12/2 Yellow (NEVER 14/2 on a 20A breaker, NEC 240.4(D)(5); use deep switch box for 12 AWG fill + Title 24 vacancy sensor). 2) ZERO loads outside Bathroom (CEC 210.11(C)(3) Ex.; fastened fan+lights <=10A per 210.23(A)(2)). 3) Pocket door permanently RETIRED (Nov 24): South wall is a standard framed stud assembly (active switch installation permitted); 28\"×1-3/8\" slab swings outward into hallway (field-verify hinge swing & clearance). 4) Pull a SEPARATE 12/2 home-drop from Bath J-Box to Toilet BEFORE wall tile (tile on hold until Alex returns) so splitting a heated bidet to Spare #19 later requires zero tile demolition; damp/wet-rated fixture over tub (CEC 410.10(D)).": "1) ВСЕ 5 ответвлений от Коробки ванной (Раковина, Унитаз, Свет потолка, Свет раковины, Вентилятор влажности и Выключатели) ОБЯЗАНЫ быть кабелем 12/2 жёлтый (ЗАПРЕЩЁН 14/2 под автоматом 20А, NEC 240.4(D)(5); глубокий подрозетник под 12 AWG + датчик Title 24). 2) НОЛЬ нагрузок вне ванной (CEC 210.11(C)(3) Ex.; свет+вентилятор <=10А по 210.23(A)(2)). 3) Кассетная дверь окончательно ОТМЕНЕНА (24 нояб.): Южная стена — стандартный стоечный каркас (установка выключателей разрешена); полотно 28\"×1-3/8\" открывается наружу в коридор (проверить петли и проход на месте). 4) Протянуть ОТДЕЛЬНЫЙ спуск 12/2 от Коробки ванной к Унитазу ДО укладки плитки (плитка на паузе до возвращения Алекса) для выделения крышки-биде на Резерв #19 без демонтажа плитки; влагозащищённый светильник над ванной (CEC 410.10(D)).",
}


TR_RU_STATS = {"calls": 0, "missing": []}


def reset_tr_ru_stats():
    TR_RU_STATS["calls"] = 0
    TR_RU_STATS["missing"] = []


def assert_tr_ru_complete():
    if TR_RU_STATS["missing"]:
        uniq = sorted(set(TR_RU_STATS["missing"]))
        raise AssertionError(
            "Missing RU_MAP translations (" + str(len(uniq)) + " unique): " + repr(uniq)
        )
    if TR_RU_STATS["calls"] <= 0:
        raise AssertionError("Zero tr('ru', ...) calls recorded during RU build!")



RU_MAP.update({
    "REV R6 · WHOLE-UNIT LOCKED · 2026-11-25": "REV R6 · ЕДИНЫЙ ПЛАН КВАРТИРЫ · 2026-11-25",
    "REUSE+NEW": "РЕУС+НОВ",
    "SPARE": "РЕЗЕРВ",
    "Open Space": "Свободно",
    "Living, Dining, Bed & Hall Outlets": "Розетки гостиной, столовой, спальни и коридора",
    "Reuse + New: Dining 1-4, Living 1-5, Hall 1 (18\" AFF) & Bed 1-5 (11.5\" dark horiz.) via J-Boxes (NO Panel-wall box; D6/L6 hold; verify reused vs. new on site w/ C-10)": "Повторное использование + новые: Dining 1-4, Living 1-5, Hall 1 (18\") и Bed 1-5 (11.5\" гориз. тёмные); без розетки на стене щитка; пауза D6/L6; проверить с C-10",
    "Spare (Future Bedroom / Room Split)": "Резерв (будущее выделение спальни / комнат)",
    "Open spare — ready to split Bed/Hall J-Box off #10 later with zero drywall demo": "Свободный резерв — готов к отделению Bed/Hall J-Box от #10 без вскрытия ГКЛ",
    "Complete 20-Space Panel Directory (#1–#20 · 15 Active + 5 Spares (#11, #17–#20))": "Полная таблица щитка на 20 мест (#1–#20 · 15 активных + 5 резервов: #11, #17–#20)",
    "Panel Directory — Eaton BRP20L125G (15 Active Circuits (#1–#10, #12–#16) + 5 Open Spares (#11, #17–#20))": "Таблица щитка — Eaton BRP20L125G (15 активных линий #1–#10, #12–#16 + 5 резервов #11, #17–#20)",
    "Eaton BRP20L125G breaker slot + Romex color/gauge: 12/2 Yellow = 20A (#1–#5, #10*, #13, #14; #11 & #17–#20 Spares) · 14/2 White = 15A (#6–#9, #12, #15, #16) · 14/3 Red = 3-way travelers (#12) & Smoke/CO interconnect (#16).": "Место в щитке Eaton BRP20L125G + кабель Romex: 12/2 жёлтый = 20A (#1–#5, #10*, #13, #14; #11 и #17–#20 резерв) · 14/2 белый = 15A (#6–#9, #12, #15, #16) · 14/3 красный = проходные (#12) и датчики дыма/CO (#16).",
    "Reused Wire Gauge Gate (#10 Shared):": "Проверка калибра сохраняемого провода (#10 общая):",
    "Segment Routing Overview: E-22 Living & Dining (#10 outlets + #12 lights) · E-23 Bathroom (#13 single 20A 12/2 circuit) · E-24 Laundry (#14 East wall @ 38\" AFF) + Bedroom/Hall (#10 shared outlets + #12 3-way lights; #11 Spare) · E-25 Attic Furnace (#15) + Smoke/CO & Service (#16).": "Обзор сегментов: E-22 Гостиная и столовая (#10 розетки + #12 свет) · E-23 Ванная (#13 единая 20A 12/2) · E-24 Прачечная (#14 восточная стена 38\") + Спальня/Коридор (#10 общие розетки + #12 свет 3-Way; #11 резерв) · E-25 Печь (#15) + Дым/CO и чердак (#16).",
    "Whole-Unit Non-Kitchen Room-by-Room Box, Switch & Light Schedule (#10–#16)": "Сводная таблица коробок, выключателей и света вне кухни (#10–#16)",
    "Whole-Unit Non-Kitchen Room-by-Room Schedule (#10–#16)": "Сводная таблица по комнатам вне кухни (#10–#16)",
    "Complete Non-Kitchen Box, Switch & Light Schedule (15 Active Circuits + 5 Open Spares: #11, #17–#20)": "Полная таблица коробок, выключателей и света вне кухни (15 активных + 5 резервов: #11, #17–#20)",
    "Physical Box / Group (Mapping 1)": "Физическая коробка / группа (Слой 1)",
    "Room & Wall Location": "Комната и расположение",
    "Field Rules & Verification Notes": "Правила монтажа и проверки",
    "Dining 1–4": "Столовая 1–4",
    "Dining N & S Walls (D01–D03)": "Сев. и юж. стены столовой (D01–D03)",
    "18\" AFF (in frames)": "18\" от пола (в рамках)",
    "#10 · Shared (Reuse+New)": "#10 · Общая (Реус+Нов)",
    "12/2*": "12/2*",
    "NO D5 on Panel wall (D04); NO D6 in ~33\" pocket; verify reused vs. new legs w/ C-10": "Без D5 на стене щитка (D04); без D6 в кармане ~33\"; сверить с C-10",
    "Living 1–5": "Гостиная 1–5",
    "L01 (17.5/106.5\"), Fireplace, Bay": "L01 (17.5/106.5\"), камин, эркер",
    "NO L6 in ~33\" pocket; pre-existing sound wiring reused in part (15A AFCI if 14 AWG!)": "Без L6 в кармане ~33\"; часть существующей проводки сохраняется (15A AFCI если 14 AWG!)",
    "Hall 1": "Коридор 1",
    "Hall N solid pier (Bath/Murphy)": "Сплошной простенок коридора (Ванная/Murphy)",
    "18\" AFF (+t)": "18\" от пола (+t)",
    "Keep clear of Bath 28\" outward-swing door & Murphy bookcase swing": "Вне зоны распашной двери ванной 28\" и двери-стеллажа Murphy",
    "Bed 1–5": "Спальня 1–5",
    "Wall A (17\"/107\"), C (60.5\"), Desk, Bay": "Стена A (17\"/107\"), C (60.5\"), стол, эркер",
    "11-1/2\" AFF horiz.": "11-1/2\" от пола гориз.",
    "#10 · Shared (#11 Spare)": "#10 · Общая (#11 Резерв)",
    "Dark horizontal plates @ 11-1/2\" AFF via Bed/Hall J-Box (split-ready to Spare #11)": "Тёмные гориз. рамки на 11-1/2\" через Bed/Hall J-Box (готово к разделению на #11)",
    "Common Lights & Sw": "Общий свет и выкл.",
    "Living, Dining, Bed, 2x Hall 3-Way, Laun": "Гостиная, столовая, спальня, 2× 3-Way коридор, прачечная",
    "48\" AFF / Ceiling": "48\" от пола / Потолок",
    "#12 · Room Lights": "#12 · Свет комнат",
    "14/2 + 14/3": "14/2 + 14/3",
    "Reuse sound + new via Lights J-Box; 14/3 Red travelers for 2x Hall 3-Way; NEVER put Laun light on #14": "Реус исправной + новые через Lights J-Box; 14/3 красный для 2× 3-Way; свет прачечной НЕ на #14",
    "Bath Vanity, WC, Lts/Fan": "Ванная: раковина, WC, свет/вытяжка",
    "72-1/8\"x82-1/8\" · 28\" Out-Swing Door": "72-1/8\"×82-1/8\" · Распашная дверь 28\" наружу",
    "40–44\" / 12\" / 48\"": "40–44\" / 12\" / 48\"",
    "#13 · Bath All-in-One": "#13 · Ванная (всё на 1 линии)",
    "100% 12/2": "100% 12/2",
    "Pocket door RETIRED -> South stud switches OK; SEPARATE 12/2 Toilet drop before tile (split-ready #19)": "Кассетная дверь отменена -> выкл. на южной стене OK; отдельный спуск 12/2 к WC до плитки (#19)",
    "Laundry WashTower": "Прачечная WashTower",
    "Laundry East/Right Wall (clear Murphy)": "Восточная (правая) стена прачечной (вне Murphy)",
    "38\" AFF (+t)": "38\" от пола (+t)",
    "#14 · Laundry 20A DF": "#14 · Прачечная 20A DF",
    "1x 20A TR duplex for both 120V LG WKG101HVA plugs; GFCI reset accessible at Panel": "1× двойная 20A TR для обеих вилок 120V LG WKG101HVA; сброс GFCI в щитке",
    "Attic Furnace F1": "Чердачная печь F1",
    "Attic Platform (174\", 258\") + Disconn.": "Площадка чердака (174\", 258\") + выкл.",
    "At Platform": "На площадке",
    "#15 · Attic Furnace": "#15 · Печь чердака",
    "Dedicated 15A standard breaker (BR115) + local disconnect switch at furnace": "Выделенный стандартный автомат 15A (BR115) + сервисный выключатель у печи",
    "Attic Service & Smoke/CO": "Чердак и датчики дыма/CO",
    "Door 4 Hatch, <=25 ft F1, Hall/Bed/Liv": "Люк Door 4, <=25 футов от F1, кор./сп./гост.",
    "Ceiling / Rafter Blk": "Потолок / перемычки",
    "#16 · 15A AFCI-ONLY": "#16 · 15A ТОЛЬКО AFCI",
    "BRN115AF (NO GFCI breaker!); LINE-only GFCI outlet; 2x LEDs on 2x4 blocking >=1.5\" below deck; 72\" guards": "BRN115AF (НЕ GFCI-автомат!); розетка GFCI LINE-only; 2 LED на перемычках 2×4 >=1.5\" ниже крыши; планки 72\"",
    "Site Verification Note (Rev R6 · 2026-11-25): Dining Room stays named Dining Room normally. Living, Dining, Bedroom & Hall outlets share #10 (Reuse + New) so #11 stays free as a 5th open spare alongside #17–#20. Confirm which existing Living/Dining/Bedroom legs are sound and verify wire gauge (12 AWG vs 14 AWG) on site with the C-10 electrician before energizing.": "Проверка на месте (Rev R6 · 2026-11-25): Столовая сохраняет обычное название. Розетки гостиной, столовой, спальни и коридора объединены на #10 (повторное использование + новые), оставляя #11 свободным 5-м резервом вместе с #17–#20. Подтвердить сохраняемые участки и калибр провода (12 AWG или 14 AWG) на объекте с электриком C-10 до подачи напряжения.",
})


def tr(lang, en, es, ru=None):
    lang_up = str(lang).upper()
    if lang_up == "RU":
        TR_RU_STATS["calls"] += 1
        if ru is not None:
            return ru
        if en not in RU_MAP:
            TR_RU_STATS["missing"].append(en)
            raise AssertionError("Missing RU_MAP key: " + repr(en))
        return RU_MAP[en]
    return en if lang_up == "EN" else es


def esc(s):
    return html.escape(s, quote=True)


def header_html(lang, mod_title, sheet_code, sheet_title):
    sub = tr(
        lang,
        "1231 11th Ave, Unit 4 · San Francisco · INTERNAL CREW WORKING PLAN (NOT A PERMIT SET) · Panel: Eaton BRP20L125G",
        "1231 11th Ave, Unidad 4 · San Francisco · PLANO INTERNO DE OBRA (SIN PERMISO) · Panel: Eaton BRP20L125G",
    )
    rev = tr(
        lang,
        "REV R6 · WHOLE-UNIT LOCKED · 2026-11-25",
        "REV R6 · PLANO COMPLETO VIGENTE · 2026-11-25",
    )
    return (
        '<div class="hdr"><div class="hdr-left"><h1>' + esc(mod_title + " — " + sheet_title) + '</h1>'
        '<div class="sub">' + esc(sub) + '</div></div>'
        '<div class="hdr-right"><div class="sheet-num">' + esc(sheet_code) + '</div>'
        '<div class="rev-tag">' + esc(rev) + '</div></div></div>'
    )


def legend_bar(lang):
    return (
        '<div class="legend-bar">'
        '<span class="pill pill-box">' + esc(tr(lang, "DARK TAG = Physical Box / Switch (Fixed Location)", "ETIQUETA OSCURA = Caja / Apagador Físico (Ubicación Fija)")) + '</span>'
        '<span class="pill pill-12">' + esc(tr(lang, "#N · 12/2 YELLOW = 20A", "#N · 12/2 AMARILLO = 20A")) + '</span>'
        '<span class="pill pill-14">' + esc(tr(lang, "#N · 14/2 WHITE = 15A", "#N · 14/2 BLANCO = 15A")) + '</span>'
        '<span class="pill pill-143">' + esc(tr(lang, "#N · 14/3 RED = 3-Way / Smoke", "#N · 14/3 ROJO = 3-Vías / Humo")) + '</span>'
        '<span class="pill pill-ex">' + esc(tr(lang, "DASHED = Reuse Sound Existing", "PUNTEADO = Reusar Existente Sano")) + '</span>'
        '<span class="pill pill-hold">' + esc(tr(lang, "RED = Active Hold / Safety Gate", "ROJO = Pausa Activa / Candado")) + '</span>'
        '</div>'
    )


def footer_html(lang, mod_short, sheet_code):
    left = tr(
        lang,
        "Bare Subfloor Down: H_subfloor = H_AFF + t (est. t = 3/4\" — verify on site before fastening boxes) · 1:1 True Scale (scaleX = scaleY)",
        "Subpiso Descubierto: H_subpiso = H_AFF + t (est. t = 3/4\" — verificar en obra antes de fijar cajas) · Escala Real 1:1 (scaleX = scaleY)",
    )
    return '<div class="ftr"><span>' + esc(left) + '</span><span>' + esc(mod_short + " · " + sheet_code + " · Rev R6") + '</span></div>'


def svg_compass(cx, cy, lang):
    w_lbl = tr(lang, "W", "O")
    if str(lang).upper() == "RU":
        n_lbl, s_lbl, e_lbl = ("С", "Ю", "В")
    else:
        n_lbl, s_lbl, e_lbl = ("N", "S", "E")
    return (
        '<g transform="translate({:.1f},{:.1f})">'.format(cx, cy)
        + '<circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#0f2537" stroke-width="1.4"/>'
        + '<polygon points="0,-12 4,0 0,-3 -4,0" fill="#dc2626"/>'
        + '<text x="0" y="-18" text-anchor="middle" font-size="8.5" font-weight="800" fill="#dc2626">{}</text>'.format(esc(n_lbl))
        + '<text x="0" y="13" text-anchor="middle" font-size="7.8" font-weight="700" fill="#334155">{}</text>'.format(esc(s_lbl))
        + '<text x="11" y="3" text-anchor="middle" font-size="7.8" font-weight="700" fill="#334155">{}</text>'.format(esc(e_lbl))
        + '<text x="-11" y="3" text-anchor="middle" font-size="7.8" font-weight="700" fill="#334155">{}</text>'.format(esc(w_lbl))
        + '</g>'
    )


def svg_scale_bar(x, y, px_per_in, inches_seg, lang):
    w = inches_seg * px_per_in
    u_lbl = tr(
        lang,
        '{}" ({:.0f} ft)'.format(inches_seg * 2, inches_seg * 2 / 12.0),
        '{}" ({:.0f} pies)'.format(inches_seg * 2, inches_seg * 2 / 12.0),
    )
    end_anchor = "start" if w < 62.0 else "middle"
    end_x = w * 2 - 8.0 if w < 62.0 else w * 2
    return (
        '<g transform="translate({:.1f},{:.1f})">'.format(x, y)
        + '<rect x="0" y="0" width="{:.1f}" height="5" fill="#0f2537"/>'.format(w)
        + '<rect x="{:.1f}" y="0" width="{:.1f}" height="5" fill="#ffffff" stroke="#0f2537" stroke-width="1"/>'.format(w, w)
        + '<text x="0" y="14" font-size="8.5" font-weight="700" fill="#0f2537">0"</text>'
        + '<text x="{:.1f}" y="14" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0f2537">{}"</text>'.format(w, inches_seg)
        + '<text x="{:.1f}" y="14" text-anchor="{}" font-size="8.5" font-weight="700" fill="#0f2537">{}</text>'.format(end_x, end_anchor, esc(u_lbl))
        + '</g>'
    )


def estimate_svg_pill_width(label, min_w):
    """Estimate rendered 8.4px bold sans-serif text width across Latin, Spanish diacritics, and Cyrillic."""
    px = 0.0
    wide_cyr = set("ШЩЖЮМФЫДшщжюмфыд")
    wide_lat = set("MW@#%&×±")
    narrow_set = set(" .,;:!'|\"()[]/\\-·1Iltijfr")
    for ch in label:
        code = ord(ch)
        if ch in narrow_set:
            px += 3.3
        elif ch in wide_cyr:
            px += 7.0
        elif ch in wide_lat:
            px += 6.7
        elif 0x0410 <= code <= 0x042F or code == 0x0401:
            px += 6.2
        elif 0x0430 <= code <= 0x044F or code == 0x0451:
            px += 5.5
        elif "A" <= ch <= "Z" or code >= 0x00C0:
            px += 5.8
        else:
            px += 5.1
    return max(min_w, px + 11.0)


def svg_box_badge(bx, by, tx, ty, box_lbl, ckt_lbl, wcls, max_x=None):
    """Draw a two-mapping callout badge at (bx, by) top-left with a crisp leader line to target (tx, ty)."""
    fill = "#fef08a" if wcls == "w12" else ("#fee2e2" if wcls == "w143" else "#ffffff")
    stroke = "#ca8a04" if wcls == "w12" else ("#dc2626" if wcls == "w143" else "#475569")
    ink = "#713f12" if wcls == "w12" else ("#991b1b" if wcls == "w143" else "#0f172a")
    w1 = estimate_svg_pill_width(box_lbl, 38.0)
    w2 = estimate_svg_pill_width(ckt_lbl, 44.0)
    tot_w = w1 + 2.0 + w2
    if max_x is not None and bx + tot_w > max_x - 3.0:
        bx = max(3.0, max_x - 3.0 - tot_w)
    h = 14.0
    ax = bx if tx < bx else (bx + tot_w if tx > bx + tot_w else bx + tot_w / 2.0)
    ay = by + h / 2.0
    return (
        '<g class="callout-group" data-bx="{:.1f}" data-by="{:.1f}" data-bw="{:.1f}" data-bh="{:.1f}">'.format(bx, by, tot_w, h)
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#64748b" stroke-width="1" stroke-dasharray="2,2"/>'.format(tx, ty, ax, ay)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" rx="2" fill="#1e293b"/>'.format(bx, by, w1, h)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.4" font-weight="700" fill="#ffffff">{}</text>'.format(bx + w1 / 2.0, by + 10.2, esc(box_lbl))
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" rx="2" fill="{}" stroke="{}" stroke-width="1"/>'.format(bx + w1 + 2.0, by, w2, h, fill, stroke)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.4" font-weight="800" fill="{}">{}</text>'.format(bx + w1 + 2.0 + w2 / 2.0, by + 10.2, ink, esc(ckt_lbl))
        + '</g>'
    )


svg_callout = svg_box_badge


def build_e00(lang, mod_num):
    if mod_num == 1:
        mod_title = tr(lang, "MODULE 1: KITCHEN ELECTRICAL", "MÓDULO 1: ELECTRICIDAD DE COCINA")
        mod_short = tr(lang, "Module 1 (Kitchen)", "Módulo 1 (Cocina)")
        idx = [
            ("E-00A", tr(lang, "Cover, Sheet Index, Two-Mapping Rules & Active Holds", "Portada, Índice de Hojas, Reglas de Dos Mapeos y Pausas Activas")),
            ("E-00B", tr(lang, "Complete 20-Space Panel Directory (#1–#20 · 15 Active + 5 Spares (#11, #17–#20))", "Directorio Completo del Panel de 20 Espacios (#1–#20 · 15 Activos + 5 Reservas (#11, #17–#20))")),
            ("E-11", tr(lang, "Kitchen 1:1 Floor Plan — True West Step Wall, Boxes & Circuits (#1–#9)", "Plano 1:1 de Cocina — Muro Oeste en Escalón, Cajas y Circuitos (#1–#9)")),
            ("E-12", tr(lang, "Kitchen East (126-1/4\") & South (147\") 1:1 Elevations + Dual Datums", "Elevaciones 1:1: Muro Este (126-1/4\") y Sur (147\") + Doble Referencia")),
            ("E-13", tr(lang, "Kitchen West (66-1/4\") & North (115-1/2\") 1:1 Elevations + Hood Offset", "Elevaciones 1:1: Muro Oeste (66-1/4\") y Norte (115-1/2\") + Desfase Campana")),
            ("E-14", tr(lang, "Kitchen Box-to-Circuit Schedule & Pre-Drywall Verification Checklist", "Tabla Caja-a-Circuito de Cocina y Lista de Verificación Pre-Tablaroca")),
        ]
    else:
        mod_title = tr(lang, "MODULE 2: WHOLE-UNIT SEGMENTS", "MÓDULO 2: SEGMENTOS DE TODA LA UNIDAD")
        mod_short = tr(lang, "Module 2 (Whole Unit)", "Módulo 2 (Toda la Unidad)")
        idx = [
            ("E-00A", tr(lang, "Cover, Sheet Index, Two-Mapping Rules & Active Holds", "Portada, Índice de Hojas, Reglas de Dos Mapeos y Pausas Activas")),
            ("E-00B", tr(lang, "Complete 20-Space Panel Directory (#1–#20 · 15 Active + 5 Spares (#11, #17–#20))", "Directorio Completo del Panel de 20 Espacios (#1–#20 · 15 Activos + 5 Reservas (#11, #17–#20))")),
            ("E-21", tr(lang, "Whole-Unit 1:1 Key Map (508\"×298\"), Segments & Panel Clear Space", "Mapa Clave 1:1 de la Unidad (508\"×298\"), Segmentos y Espacio Libre")),
            ("E-22", tr(lang, "Segment A: Living & Dining — Individual Outlets, Holds & Attic J-Boxes", "Segmento A: Sala y Comedor — Contactos Individuales, Pausas y Cajas Ático")),
            ("E-23", tr(lang, "Segment B: Bathroom All-in-One (#13 · 12/2) + Pre-Tile Toilet Drop", "Segmento B: Baño Todo-en-Uno (#13 · 12/2) + Bajada Pre-Azulejo Inodoro")),
            ("E-24", tr(lang, "Segment C: Laundry East Wall @ 38\" AFF (#14) + Bedroom & Hall (#11/#12)", "Segmento C: Lavandería Muro Este a 38\" AFF (#14) + Recámara y Pasillo (#11/#12)")),
            ("E-25", tr(lang, "Segment D: Attic Hatch, Furnace (#15), Service & Smoke/CO Clearances (#16)", "Segmento D: Escotilla Ático, Calefactor (#15), Servicio y Despejes Humo/CO (#16)")),
            ("E-26", tr(lang, "Whole-Unit Non-Kitchen Room-by-Room Box, Switch & Light Schedule (#10–#16)", "Tabla Completa Cuarto por Cuarto Fuera de Cocina (#10–#16)")),
        ]

    idx_tbl = "<table><tr><th style='width:56px'>" + esc(tr(lang, "Sheet", "Hoja")) + "</th><th>" + esc(tr(lang, "Contents", "Contenido")) + "</th></tr>"
    for sc, desc in idx:
        idx_tbl += "<tr><td><strong>" + esc(sc) + "</strong></td><td>" + esc(desc) + "</td></tr>"
    idx_tbl += "</table>"

    map_box = (
        '<div class="box" style="margin-top:7px;"><h3>' + esc(tr(lang, "How the Two Independent Mappings Work", "Cómo Funcionan los Dos Mapeos Independientes")) + '</h3><ul>'
        + '<li><strong>' + esc(tr(lang, "Mapping 1 — Physical Box / Switch / Fixture Name (Dark Tag):", "Mapeo 1 — Nombre Físico de Caja / Apagador / Lámpara (Etiqueta Oscura):")) + '</strong> '
        + esc(tr(lang, "Fixed physical location on the wall or ceiling (East 1, Under-Sink 2-Gang, Entry 3-Switch, Dining 1–4, Vanity, Toilet, Washer/Dryer, Bath J-Box). Never changes if circuits are split later; one multi-gang box can hold multiple circuits.",
                 "Ubicación física fija en muro o techo (Este 1, Doble Bajo Fregadero, 3-Apagadores Entrada, Comedor 1–4, Tocador, Inodoro, Lavadora/Secadora, Caja Baño). Nunca cambia si los circuitos se dividen después; una caja múltiple puede alojar varios circuitos.")) + '</li>'
        + '<li><strong>' + esc(tr(lang, "Mapping 2 — Assigned Circuit & Cable (#1–#20 Pill):", "Mapeo 2 — Circuito y Cable Asignado (Pastilla #1–#20):")) + '</strong> '
        + esc(tr(lang, "Eaton BRP20L125G breaker slot + Romex color/gauge: 12/2 Yellow = 20A (#1–#5, #10*, #13, #14; #11 & #17–#20 Spares) · 14/2 White = 15A (#6–#9, #12, #15, #16) · 14/3 Red = 3-way travelers (#12) & Smoke/CO interconnect (#16).",
                 "Espacio en Panel Eaton BRP20L125G + calibre Romex: 12/2 Amarillo = 20A (#1–#5, #10*, #13, #14; #11 y #17–#20 Reservas) · 14/2 Blanco = 15A (#6–#9, #12, #15, #16) · 14/3 Rojo = viajeras 3-vías (#12) e interconexión Humo/CO (#16).")) + '</li>'
        + '</ul></div>'
    )

    holds_html = (
        '<div class="box"><h3>' + esc(tr(lang, "Active Holds & Code Guardrails (Read First)", "Pausas Activas y Reglas de Seguridad (Leer Primero)")) + '</h3><ul>'
        + '<li><strong>' + esc(tr(lang, "Panel & Feeder Hold (Mon Nov 23):", "Pausa Panel y Alimentador (Lun 23 Nov):")) + '</strong> '
        + esc(tr(lang, "Reconcile NEXT 80A/#4 vs. 100A/#3 feeder & hold side-entry notches on Panel (X=147\", Y=213.75\"/214\", faces Dining; 30\"W×36\"D×78\"H clear per SFEC 110.26(A)(3); ZERO back-entries or screws 53\"–77\" AFF on Kitchen East wall).",
                 "Conciliar alimentador NEXT 80A/#4 vs. 100A/#3 y pausar muescas laterales en Panel (X=147\", Y=213.75\"/214\", abre al Comedor; 30\"An×36\"Prof×78\"Al libre según SFEC 110.26(A)(3); CERO entradas/tornillos traseros 53\"–77\" AFF en Cocina).")) + '</li>'
        + '<li><strong>' + esc(tr(lang, "Reused Wire Gauge Gate (#10 Shared):", "Candado Calibre Cable Reusado (#10 Compartido):")) + '</strong> '
        + esc(tr(lang, "Verify gauge of EVERY reused wire leg (NEC 240.4(D)(3)): if ANY reused segment is 14 AWG, install a 15A AFCI (BRN115AF) breaker (never 20A!).",
                 "Verificar calibre de CADA cable reusado (NEC 240.4(D)(3)): si ALGÚN tramo reusado es 14 AWG, instalar interruptor 15A AFCI (BRN115AF, ¡nunca 20A!).")) + '</li>'
        + '<li><strong>' + esc(tr(lang, "SFEC 362.10 vs. Non-Kitchen Hold:", "SFEC 362.10 vs. Pausa Fuera de Cocina:")) + '</strong> '
        + esc(tr(lang, "SFEC 362.10 restricts ENT in wood walls whereas SFEC 334.10(2) permits concealed NM-B; preserve task 6hvRcQ7Gmh3fG5m7 NO-WIRE-PULL hold until owner/inspector release.",
                 "SFEC 362.10 restringe ENT en muros de madera mientras SFEC 334.10(2) permite NM-B oculto; mantener pausa 6hvRcQ7Gmh3fG5m7 SIN JALAR CABLE hasta liberación.")) + '</li>'
        + '<li><strong>' + esc(tr(lang, "South Window CL & Pocket-Door Holds:", "Pausas Ventana Sur y Puertas Corredizas:")) + '</strong> '
        + esc(tr(lang, "Verify Kitchen South window CL (87\" vs. 90\" W of SE) before fastening South 2 / Under-Sink 2-Gang; ZERO boxes inside ~33\" pocket-door cavities (Dining D6 / Living L6).",
                 "Verificar eje ventana Sur de Cocina (87\" vs. 90\" O de SE) antes de fijar Sur 2 / Caja Fregadero; CERO cajas en cavidades ~33\" de puertas corredizas (D6 / L6).")) + '</li>'
        + '</ul></div>'
    )

    e00a = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-00A", tr(lang, "Cover, Sheet Index, Two-Mapping Rules & Active Holds", "Portada, Índice, Reglas de Dos Mapeos y Pausas Activas"))
        + legend_bar(lang)
        + '<div class="grid-2">'
        + '<div><div class="box"><h3>' + esc(tr(lang, "Sheet Index", "Índice de Hojas")) + '</h3>' + idx_tbl + '</div>' + map_box + '</div>'
        + holds_html
        + '</div>'
        + footer_html(lang, mod_short, "E-00A")
        + '</div>'
    )

    ptbl = (
        "<table class='ptbl-compact'><tr>"
        "<th style='width:44px;white-space:nowrap'>" + esc(tr(lang, "Brkr", "Int.")) + "</th>"
        "<th style='width:62px;white-space:nowrap'>" + esc(tr(lang, "Status", "Estado")) + "</th>"
        "<th style='width:170px'>" + esc(tr(lang, "Circuit Name (Panel Sticker)", "Nombre del Circuito (Etiqueta)")) + "</th>"
        "<th style='width:162px'>" + esc(tr(lang, "Protection / Breaker", "Protección / Interruptor")) + "</th>"
        "<th style='width:64px'>" + esc(tr(lang, "Cable", "Cable")) + "</th>"
        "<th>" + esc(tr(lang, "Physical Boxes Currently Fed (Mapping 1)", "Cajas Físicas Alimentadas Hoy (Mapeo 1)")) + "</th>"
        "</tr>"
    )
    for num, st, nen, nes, ben, bes, cab, wcls, len_s, les_s in CIRCUITS[:16]:
        if st == "NEW":
            b = '<span class="b-new">' + esc(tr(lang, "NEW", "NUEVO")) + '</span>'
        elif st == "SPARE":
            b = '<span class="b-sp">' + esc(tr(lang, "SPARE", "RESERVA")) + '</span>'
        else:
            b = '<span class="b-ex">' + esc(tr(lang, "REUSE+NEW", "REUSO+NVO")) + '</span>'
        ptbl += (
            "<tr><td><strong>" + esc(num) + "</strong></td><td>" + b + "</td>"
            "<td><strong>" + esc(tr(lang, nen, nes)) + "</strong></td>"
            "<td>" + esc(tr(lang, ben, bes)) + "</td>"
            "<td><span class='" + wcls + "'>" + esc(cab) + "</span></td>"
            "<td>" + esc(tr(lang, len_s, les_s)) + "</td></tr>"
        )
    ptbl += (
        "<tr><td><strong>#17–#20</strong></td>"
        "<td><span class='b-sp'>" + esc(tr(lang, "4 SPARES", "4 RESERVAS")) + "</span></td>"
        "<td><strong>" + esc(tr(lang, "Open Panel Spaces (#17, #18, #19, #20)", "Espacios Libres (#17, #18, #19, #20)")) + "</strong></td>"
        "<td>" + esc(tr(lang, "4 Open Full-Size Spaces", "4 Espacios Completos")) + "</td>"
        "<td><span class='wsp'>—</span></td>"
        "<td>" + esc(tr(lang, "#17 Living/Dining split · #18 Bedroom split · #19 Toilet bidet split · #20 Open", "#17 División Sala/Comedor · #18 División Recámara · #19 Bidé Inodoro · #20 Libre")) + "</td></tr>"
        "</table>"
    )

    e00b = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-00B", tr(lang, "Complete 20-Space Panel Directory (#1–#20)", "Directorio Completo del Panel de 20 Espacios (#1–#20)"))
        + '<div class="box"><h3>' + esc(tr(lang, "Panel Directory — Eaton BRP20L125G (15 Active Circuits (#1–#10, #12–#16) + 5 Open Spares (#11, #17–#20))", "Directorio del Panel — Eaton BRP20L125G (15 Circuitos Activos (#1–#10, #12–#16) + 5 Reservas (#11, #17–#20))")) + '</h3>' + ptbl + '</div>'
        + footer_html(lang, mod_short, "E-00B")
        + '</div>'
    )
    return e00a + e00b


def build_module1(lang):
    mod_title = tr(lang, "MODULE 1: KITCHEN ELECTRICAL", "MÓDULO 1: ELECTRICIDAD DE COCINA")
    mod_short = tr(lang, "Module 1 (Kitchen)", "Módulo 1 (Cocina)")

    # --- Sheet E-11: True 1:1 Kitchen Plan (scaleX = scaleY = 2.60 px/in) ---
    # Kitchen X = 0..147", Y = 108..234.25" (width 147" = 382.2 px, height 126.25" = 328.25 px)
    # Place room at ox = 205, oy = 52 inside viewBox="0 0 800 445" so left (0..200) & right (590..795) have huge clean callout lanes!
    S11 = 2.60
    def kx(x): return 205.0 + x * S11
    def ky(y): return 52.0 + (y - 108.0) * S11

    k_pts = " ".join(["{:.1f},{:.1f}".format(kx(x), ky(y)) for x, y in [
        (31.5, 108.0), (147.0, 108.0), (147.0, 234.25), (0.0, 234.25), (0.0, 174.25), (31.5, 174.25)
    ]])

    s11 = (
        '<svg viewBox="0 0 800 445" width="100%" data-equal-scale="2.60">'
        + svg_compass(758, 36, lang)
        + svg_scale_bar(28, 418, S11, 36, lang)
        # Room polygon
        + '<polygon points="' + k_pts + '" fill="#f8fafc" stroke="#0f2537" stroke-width="2.6"/>'
        # North Hall Opening: 29.5" wide from NE (X = 117.5..147.0, Y = 108.0)
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#ffffff" stroke-width="5"/>'.format(kx(117.5), ky(108), kx(147.0), ky(108))
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#0f2537" stroke-width="1.2" stroke-dasharray="4,3"/>'.format(kx(117.5), ky(108), kx(147.0), ky(108))
        # Rear Door on South Alcove Wall: 116.375"..142.25" W of SE -> X = 4.75..30.625, Y = 234.25
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#ffffff" stroke-width="5"/>'.format(kx(4.75), ky(234.25), kx(30.625), ky(234.25))
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#b45309" stroke-width="1.5" stroke-dasharray="4,2"/>'.format(kx(4.75), ky(234.25), kx(30.625), ky(234.25))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#64748b">{}</text>'.format(kx(16), ky(205), esc(tr(lang, "ALC.", "ALC.")))
        # East Wall Appliances (Nov 22: 36" corner 0-36, 18" drawer 36-54, 28" Haier Fridge 54-82 N -> Y = 152.25..180.25)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e2e8f0" stroke="#475569"/>'.format(kx(119), ky(152.25), 28 * S11, 28 * S11)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.8" font-weight="800" fill="#1e293b">{}</text>'.format(kx(133), ky(168), esc(tr(lang, "FRIDGE 28\"", "REFRI 28\"")))
        # Panel Back No-Screw Zone on East Wall: 13"-27.5" N of SE -> Y = 206.75..221.25
        + '<rect x="{:.1f}" y="{:.1f}" width="10" height="{:.1f}" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>'.format(kx(145), ky(206.75), 14.5 * S11)
        # SE 36"x36" Diagonal Corner Base Cabinet (Nov 25 lock)
        + '<polygon points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="#f1f5f9" stroke="#64748b" stroke-width="1.2"/>'.format(
            kx(147), ky(234.25), kx(111), ky(234.25), kx(111), ky(210.25), kx(123), ky(198.25), kx(147), ky(198.25))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#475569">36" DIAG</text>'.format(kx(132), ky(220))
        # South Wall Appliances (SE=147 -> W): 36" diag corner, 12" trash (36-48), 24" finished-front DW (48-72 -> X=75..99), 30" Sink (72-102 -> X=45..75, CL 87 -> X=60)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e0f2fe" stroke="#0284c7"/>'.format(kx(75), ky(210.25), 24 * S11, 24 * S11)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.8" font-weight="800" fill="#0369a1">{}</text>'.format(kx(87), ky(224), esc(tr(lang, "DW 24\"", "LAV. 24\"")))
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#dbeafe" stroke="#1d4ed8"/>'.format(kx(45), ky(210.25), 30 * S11, 24 * S11)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.8" font-weight="800" fill="#1e40af">{}</text>'.format(kx(60), ky(224), esc(tr(lang, "SINK 30\"", "TARJA 30\"")))
        # Sealed Pie-Safe Wall Patch ONLY (flush on wall 26"-59" W -> X=88..121, NOT a floor box!)
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#d97706" stroke-width="4" stroke-dasharray="5,3"/>'.format(kx(88), ky(234.25), kx(121), ky(234.25))
        # TRUE West 66-1/4" Range Wall at X = 31.5", Y = 108.0..174.25!
        # 30" Viking Range: 18"-48" N of South Step (174.25) -> Y = 126.25..156.25, X = 31.5..57.5
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#ffedd5" stroke="#c2410c"/>'.format(kx(31.5), ky(126.25), 26 * S11, 30 * S11)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.8" font-weight="800" fill="#9a3412">{}</text>'.format(kx(46.5), ky(146), esc(tr(lang, "RANGE 30\"", "ESTUFA 30\"")))

        # Wire Runs (#1..#9)
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.5"/>'.format(kx(147), ky(214), kx(142), ky(224.25), kx(142), ky(189.25))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#eab308" stroke-width="2.4" stroke-dasharray="8,2"/>'.format(kx(147), ky(217), kx(138), ky(229), kx(123), ky(229), kx(85), ky(229))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.4"/>'.format(kx(147), ky(209), kx(65), ky(165.25), kx(31.5), ky(165.25), kx(31.5), ky(117.25))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0" stroke-dasharray="4,2"/>'.format(kx(147), ky(211), kx(145), ky(166.25))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0"/>'.format(kx(147), ky(219), kx(71), ky(219), kx(71), ky(232))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#334155" stroke-width="1.9"/>'.format(kx(147), ky(221), kx(73), ky(221), kx(73), ky(232))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#334155" stroke-width="1.9"/>'.format(kx(147), ky(207), kx(65), ky(141.25), kx(31.5), ky(141.25))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#334155" stroke-width="1.9"/>'.format(kx(147), ky(204), kx(111.5), ky(159), kx(111.5), ky(108), kx(89), ky(159))

        # Exact 1:1 Physical Box Dots on Walls & Ceiling
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#713f12" stroke-width="1.5"/>'.format(kx(147), ky(224.25))  # East 1 (10" N)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#713f12" stroke-width="1.5"/>'.format(kx(147), ky(189.25))  # East 2 (45" N)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#713f12" stroke-width="1.5"/>'.format(kx(147), ky(166.25))  # Fridge (68" N)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#713f12" stroke-width="1.5"/>'.format(kx(123), ky(234.25))  # South 1 (24" W)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#713f12" stroke-width="1.5"/>'.format(kx(85), ky(234.25))   # South 2 (62" W)
        + '<rect x="{:.1f}" y="{:.1f}" width="10" height="6" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.5"/>'.format(kx(71) - 5, ky(234.25) - 6)  # Under-Sink (76" W)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="3.8" fill="#ffffff" stroke="#0f172a" stroke-width="1.4"/>'.format(kx(57), ky(234.25))   # Air Button (90" W)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#713f12" stroke-width="1.5"/>'.format(kx(31.5), ky(165.25)) # West 1 (9" N of Step)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>'.format(kx(31.5), ky(141.25)) # Range (33" N of Step)
        + '<rect x="{:.1f}" y="{:.1f}" width="7" height="7" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>'.format(kx(31.5), ky(139.0) - 3.5)   # Hood (35.25" N)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#713f12" stroke-width="1.5"/>'.format(kx(31.5), ky(117.25)) # West 2 (57" N of Step)
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>'.format(kx(111.5) - 6, ky(108))     # Entry 3-Switch (35.5" W of NE)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="6" fill="#ffffff" stroke="#dc2626" stroke-width="1.6"/>'.format(kx(89), ky(159))        # Main Ceiling Light
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>'.format(kx(72), ky(219.25))   # Pendant 1 (75" W, 15" N)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>'.format(kx(48), ky(219.25))   # Pendant 2 (99" W, 15" N)

        # Non-overlapping Stacked Callout Badges (Left Lane x=12, Top Lane, Right Lane x=600, Bottom Lane y=400..422)
        + svg_callout(12, 82, kx(31.5), ky(117.25), tr(lang, "West 2 (57\" N)", "Oeste 2 (57\" N)"), "#3 · 12/2", "w12", max_x=800)
        + svg_callout(12, 114, kx(31.5), ky(139.0), tr(lang, "Hood (33±2.25\")", "Campana (33±2.25\")"), "#8 · 14/2", "w14", max_x=800)
        + svg_callout(12, 146, kx(31.5), ky(141.25), tr(lang, "Range (33\" N)", "Estufa (33\" N)"), "#7 · 14/2", "w14", max_x=800)
        + svg_callout(12, 178, kx(31.5), ky(165.25), tr(lang, "West 1 (9\" N)", "Oeste 1 (9\" N)"), "#3 · 12/2", "w12", max_x=800)
        + svg_callout(12, 238, kx(48), ky(219.25), tr(lang, "Sink Pendants", "Colgantes Tarja"), "#9 · 14/2", "w14", max_x=800)
        + svg_callout(12, 270, kx(57), ky(234.25), tr(lang, "Air Button (90\")", "Botón Aire (90\")"), tr(lang, "#6 · Tube", "#6 · Tubo"), "w14", max_x=800)

        + svg_callout(365, 16, kx(111.5), ky(108), tr(lang, "Entry 3-Switch (35.5\" W)", "3-Apag. Entrada (35.5\" O)"), "#9 · 14/2", "w14", max_x=800)
        + svg_callout(175, 16, kx(89), ky(159), tr(lang, "Ceiling Light", "Luz Techo"), "#9 · 14/2", "w14", max_x=800)

        + svg_callout(600, 146, kx(147), ky(166.25), tr(lang, "Fridge (68\" N)", "Refri (68\" N)"), "#4 · 12/2", "w12", max_x=800)
        + svg_callout(600, 186, kx(147), ky(189.25), tr(lang, "East 2 (45\" N)", "Este 2 (45\" N)"), "#1 · 12/2", "w12", max_x=800)
        + svg_callout(600, 226, kx(147), ky(214.0), tr(lang, "Panel Back (HOLD)", "Respaldo Panel"), "53-77\" AFF", "w143", max_x=800)
        + svg_callout(600, 266, kx(147), ky(224.25), tr(lang, "East 1 (10\" N)", "Este 1 (10\" N)"), "#1 · 12/2", "w12", max_x=800)

        + svg_callout(185, 392, kx(71), ky(234.25), tr(lang, "Under-Sink 2-Gang (76\")", "Doble Fregadero (76\")"), "#5(12/2)+#6(14/2)", "w12", max_x=800)
        + svg_callout(425, 416, kx(85), ky(234.25), tr(lang, "South 2 (62\" W*)", "Sur 2 (62\" O*)"), "#2 · 12/2", "w12", max_x=800)
        + svg_callout(595, 392, kx(123), ky(234.25), tr(lang, "South 1 (24\" W)", "Sur 1 (24\" O)"), "#2 · 12/2", "w12", max_x=800)
        + '</svg>'
    )

    e11 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-11", tr(lang, "Kitchen 1:1 Floor Plan (Boxes vs. Circuits #1–#9)", "Plano 1:1 de Cocina (Cajas vs. Circuitos #1–#9)"))
        + legend_bar(lang)
        + '<div class="grid-65">'
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 True-Scale Plan (North UP · SE = 0\" · West Range Wall at X = 31.5\" Step)", "Plano Escala Real 1:1 (Norte ARRIBA · SE = 0\" · Muro Estufa en Escalón X = 31.5\")")) + '</div>' + s11 + '</div>'
        + '<div class="box"><h3>' + esc(tr(lang, "Kitchen Circuits (#1–#9) & Field Rules", "Circuitos de Cocina (#1–#9) y Reglas en Obra")) + '</h3><ul>'
        + '<li><span class="w12">#1 · 12/2</span> <strong>' + esc(tr(lang, "East Counter:", "Encimera Este:")) + '</strong> <span class="bx">' + esc(tr(lang, "East 1", "Este 1")) + '</span> (10\" ' + ('С' if str(lang).upper() == 'RU' else 'N') + '), <span class="bx">' + esc(tr(lang, "East 2", "Este 2")) + '</span> (45\" ' + ('С' if str(lang).upper() == 'RU' else 'N') + ').</li>'
        + '<li><span class="w12">#2 · 12/2</span> <strong>' + esc(tr(lang, "South Counter:", "Encimera Sur:")) + '</strong> <span class="bx">' + esc(tr(lang, "South 1", "Sur 1")) + '</span> (24\" ' + ('З' if str(lang).upper() == 'RU' else ('O' if str(lang).upper() == 'ES' else 'W')) + '), <span class="bx">' + esc(tr(lang, "South 2", "Sur 2")) + '</span> (62\" ' + ('З' if str(lang).upper() == 'RU' else ('O' if str(lang).upper() == 'ES' else 'W')) + ' — ' + esc(tr(lang, "hold: verify CL 87\" vs. 90\"", "pausa: verificar eje 87\" vs. 90\"")) + ').</li>'
        + '<li><span class="w12">#3 · 12/2</span> <strong>' + esc(tr(lang, "West Counter:", "Encimera Oeste:")) + '</strong> <span class="bx">' + esc(tr(lang, "West 1", "Oeste 1")) + '</span> (9\" ' + ('С' if str(lang).upper() == 'RU' else 'N') + '), <span class="bx">' + esc(tr(lang, "West 2", "Oeste 2")) + '</span> (57\" ' + ('С' if str(lang).upper() == 'RU' else 'N') + ' ' + esc(tr(lang, "of South Step", "del escalón Sur")) + ').</li>'
        + '<li><span class="w12">#4 · 12/2</span> <span class="bx">' + esc(tr(lang, "Fridge", "Refri")) + '</span> (68\" ' + ('С' if str(lang).upper() == 'RU' else 'N') + ', 15\" AFF).</li>'
        + '<li><span class="w12">#5 · 12/2</span> + <span class="w14">#6 · 14/2</span> <span class="bx">' + esc(tr(lang, "Under-Sink 2-Gang", "Doble Fregadero")) + '</span> (76\" ' + ('З' if str(lang).upper() == 'RU' else ('O' if str(lang).upper() == 'ES' else 'W')) + ', <strong>14\" AFF</strong>: ' + esc(tr(lang, "2 separate TR receptacles on 2 separate yokes + separate neutrals; NEVER split-wire 1 duplex!", "2 receptáculos TR en 2 yugos separados + neutros separados; ¡NUNCA puentear 1 toma doble!")) + ').</li>'
        + '<li><span class="w14">#7 · 14/2</span> <span class="bx">' + esc(tr(lang, "Range", "Estufa")) + '</span> (33\" ' + ('С' if str(lang).upper() == 'RU' else 'N') + ', 3\" AFF) · <span class="w14">#8 · 14/2</span> <span class="bx">' + esc(tr(lang, "Hood", "Campana")) + '</span> (<strong>33\" ± 2-1/4\" ' + ('С' if str(lang).upper() == 'RU' else 'N') + '</strong>, 83\"–86\" AFF, ~1\" ' + esc(tr(lang, "proud + BRLW1 lock", "salida + bloqueo BRLW1")) + ').</li>'
        + '<li><span class="w14">#9 · 14/2</span> <span class="bx">' + esc(tr(lang, "Entry 3-Switch", "3-Apag. Entrada")) + '</span> (35.5\" ' + ('З' if str(lang).upper() == 'RU' else ('O' if str(lang).upper() == 'ES' else 'W')) + ' ' + esc(tr(lang, "of NE, 48\" AFF -> Ceiling, Pendants, Under-Cab", "de NE, 48\" AFF -> Techo, Colgantes, Bajo Gab.")) + ').</li>'
        + '</ul><div class="note-red"><strong>' + esc(tr(lang, "ACTIVE HOLDS:", "PAUSAS ACTIVAS:")) + '</strong> '
        + esc(tr(lang, "1) Verify South window CL (87\" vs. 90\") & tape zero before rough-in. 2) NO screws/cables in Panel back (13\"–27.5\" N, 53\"–77\" AFF). 3) Sealed Pie-Safe (26\"–59\" W, 43\"–80\" AFF) is flush wall — photo-verify closure before cover.",
                 "1) Verificar eje ventana Sur (87\" vs. 90\") antes de obra gruesa. 2) CERO tornillos/cables tras Panel (13\"–27.5\" N, 53\"–77\" AFF). 3) Pie-Safe sellado al ras (26\"–59\" O, 43\"–80\" AFF) — foto antes de cerrar."))
        + '</div></div></div>' + footer_html(lang, mod_short, "E-11") + '</div>'
    )

    # --- Sheet E-12: True 1:1 Side-by-Side Elevations: East Wall (126.25"x121.5") & South Wall (147"x121.5") ---
    # Uniform scale SE12 = 1.95 px/in on BOTH X and Y!
    # East wall: 126.25*1.95 = 246.2 px W x 236.9 px H at (ox=45, oy=75 -> floor y=311.9)
    # South wall: 147.0*1.95 = 286.6 px W x 236.9 px H at (ox=480, oy=75 -> floor y=311.9)
    SE12 = 1.95
    fl12 = 75.0 + 121.5 * SE12  # 311.925
    def ey12(aff): return fl12 - aff * SE12
    # Looking East: Left = NE (126.25"), Right = SE (0") -> ex(n_from_se) = 45 + (126.25 - n)*SE12 = 291.19 - n*SE12
    def ex_e(n): return 45.0 + (126.25 - n) * SE12
    # Looking South: Left = SE (0"), Right = SW (147") -> sx(w_from_se) = 480 + w*SE12
    def sx_s(w): return 480.0 + w * SE12

    s12 = (
        '<svg viewBox="0 0 860 395" width="100%" data-equal-scale="1.95">'
        + svg_scale_bar(45, 368, SE12, 36, lang)
        # Titles inside SVG
        + '<text x="168" y="20" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0f2537">{}</text>'.format(esc(tr(lang, "EAST WALL (126-1/4\" W × 121-1/2\" H · Looking East)", "MURO ESTE (126-1/4\" An × 121-1/2\" Al · Viendo al Este)")))
        + '<text x="623" y="20" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0f2537">{}</text>'.format(esc(tr(lang, "SOUTH WALL (147\" W × 121-1/2\" H · Looking South · HOLD CL 87\"/90\")", "MURO SUR (147\" An × 121-1/2\" Al · Viendo al Sur · PAUSA EJE 87\"/90\")")))

        # EAST WALL 1:1 Box
        + '<rect x="45.0" y="75.0" width="{:.1f}" height="{:.1f}" fill="#f8fafc" stroke="#0f2537" stroke-width="2"/>'.format(126.25 * SE12, 121.5 * SE12)
        # Hall opening on East North end (96.5"..126.0" N, 0..84" AFF)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#ffffff" stroke="#64748b" stroke-dasharray="3,2"/>'.format(ex_e(126.0), ey12(84.0), 29.5 * SE12, 84.0 * SE12)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.2" font-weight="700" fill="#475569">{}</text>'.format(ex_e(111.25), ey12(42.0), esc(tr(lang, "HALL", "PASO")))
        # Haier 28" Fridge (54"..82" N, 0..70" AFF)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e2e8f0" stroke="#475569"/>'.format(ex_e(82.0), ey12(70.0), 28.0 * SE12, 70.0 * SE12)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.5" font-weight="800" fill="#1e293b">{}</text>'.format(ex_e(68.0), ey12(42.0), esc(tr(lang, "FRIDGE", "REFRI")))
        # Countertop 0..54" N @ 36" AFF
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#0f2537" stroke-width="1.6"/>'.format(ex_e(54.0), ey12(36.0), ex_e(0.0), ey12(36.0))
        # TRUE 1:1 Panel Back No-Screw Zone: 13"..27.5" N, 53"..77" AFF!
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="4,2"/>'.format(ex_e(27.5), ey12(77.0), 14.5 * SE12, 24.0 * SE12)
        # Physical boxes on East wall
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fef08a" stroke="#713f12" stroke-width="1.4"/>'.format(ex_e(68.0) - 3, ey12(15.0) - 4)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fef08a" stroke="#713f12" stroke-width="1.4"/>'.format(ex_e(45.0) - 3, ey12(44.0) - 4)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fef08a" stroke="#713f12" stroke-width="1.4"/>'.format(ex_e(10.0) - 3, ey12(44.0) - 4)
        + '<text x="45" y="328" font-size="8.5" font-weight="700" fill="#0f2537">{}</text>'.format("СВ 126.25\"" if str(lang).upper() == "RU" else "NE 126.25\"")
        + '<text x="{:.1f}" y="328" text-anchor="end" font-size="8.5" font-weight="800" fill="#dc2626">{}</text>'.format(ex_e(0), "ЮВ = 0\"" if str(lang).upper() == "RU" else "SE = 0\"")
        # East Callouts in dedicated middle lane (x=302..465) — zero overlap!
        + svg_callout(302, 92, ex_e(20.25), ey12(65.0), tr(lang, "Panel Back", "Respaldo Panel"), tr(lang, "NO SCREW 53-77\"", "SIN TORN. 53-77\""), "w143", max_x=860)
        + svg_callout(302, 142, ex_e(10.0), ey12(44.0), tr(lang, "East 1 (10\" N)", "Este 1 (10\" N)"), "#1 · 12/2", "w12", max_x=860)
        + svg_callout(302, 182, ex_e(45.0), ey12(44.0), tr(lang, "East 2 (45\" N)", "Este 2 (45\" N)"), "#1 · 12/2", "w12", max_x=860)
        + svg_callout(302, 268, ex_e(68.0), ey12(15.0), tr(lang, "Fridge (15\" AFF)", "Refri (15\" AFF)"), "#4 · 12/2", "w12", max_x=860)

        # SOUTH WALL 1:1 Box
        + '<rect x="480.0" y="75.0" width="{:.1f}" height="{:.1f}" fill="#f8fafc" stroke="#0f2537" stroke-width="2"/>'.format(147.0 * SE12, 121.5 * SE12)
        # Sealed Pie-Safe Flush Remediation Zone: 26"..59" W, 43"..80" AFF (NOT floor-to-ceiling!)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fef3c7" stroke="#b45309" stroke-dasharray="4,2"/>'.format(sx_s(26.0), ey12(80.0), 33.0 * SE12, 37.0 * SE12)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#92400e">{}</text>'.format(sx_s(42.5), ey12(61.5), esc(tr(lang, "SEALED PIE-SAFE", "PIE-SAFE SELLADO")))
        # South Window: 72.875"..106.6875" W, 45.9"..104.1" AFF
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.4"/>'.format(sx_s(72.875), ey12(104.1), 33.81 * SE12, 58.2 * SE12)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.2" font-weight="700" fill="#0369a1">{}</text>'.format(sx_s(89.8), ey12(75.0), esc(tr(lang, "WINDOW", "VENTANA")))
        # Rear Door: 116.375"..142.25" W, 0..78.625" AFF
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>'.format(sx_s(116.375), ey12(78.625), 25.875 * SE12, 78.625 * SE12)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.0" font-weight="700" fill="#334155">{}</text>'.format(sx_s(129.3), ey12(40.0), esc(tr(lang, "DOOR", "PUERTA")))
        # Base Cabinets: DW 48-72, Sink 72-102 @ 0..36" AFF
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e0f2fe" stroke="#0284c7"/>'.format(sx_s(48.0), ey12(36.0), 24.0 * SE12, 36.0 * SE12)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.2" font-weight="800" fill="#0369a1">{}</text>'.format(sx_s(60.0), ey12(18.0), esc(tr(lang, "DW 24\"", "LAV. 24\"")))
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#dbeafe" stroke="#1d4ed8"/>'.format(sx_s(72.0), ey12(36.0), 30.0 * SE12, 36.0 * SE12)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.2" font-weight="800" fill="#1e40af">{}</text>'.format(sx_s(84.5), ey12(25.0), esc(tr(lang, "SINK 30\"", "TARJA 30\"")))
        + '<line x1="480.0" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#0f2537" stroke-width="1.6"/>'.format(ey12(36.0), sx_s(108.0), ey12(36.0))
        # Physical devices on South wall
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fef08a" stroke="#713f12" stroke-width="1.4"/>'.format(sx_s(24.0) - 3, ey12(44.0) - 4)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fef08a" stroke="#713f12" stroke-width="1.4"/>'.format(sx_s(62.0) - 3, ey12(44.0) - 4)
        + '<rect x="{:.1f}" y="{:.1f}" width="10" height="8" fill="#fef08a" stroke="#0369a1" stroke-width="1.6"/>'.format(sx_s(76.0) - 5, ey12(14.0) - 4)  # 14" AFF!
        + '<circle cx="{:.1f}" cy="{:.1f}" r="3.8" fill="#ffffff" stroke="#0f172a" stroke-width="1.4"/>'.format(sx_s(90.0), ey12(36.0))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fee2e2" stroke="#dc2626" stroke-width="1.4"/>'.format(sx_s(75.0), ey12(92.0))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fee2e2" stroke="#dc2626" stroke-width="1.4"/>'.format(sx_s(99.0), ey12(92.0))
        + '<text x="480" y="328" font-size="8.5" font-weight="800" fill="#dc2626">{}</text>'.format("ЮВ = 0\"" if str(lang).upper() == "RU" else "SE = 0\"")
        + '<text x="{:.1f}" y="328" text-anchor="end" font-size="8.5" font-weight="700" fill="#0f2537">{}</text>'.format(sx_s(147.0), esc(tr(lang, "SW = 147\"", "SO = 147\"")))
        # Non-overlapping South Callouts (Top row y=32/52 & Bottom row y=340/362)
        + svg_callout(475, 32, sx_s(24.0), ey12(44.0), tr(lang, "South 1 (24\" W)", "Sur 1 (24\" O)"), "#2 · 12/2", "w12", max_x=860)
        + svg_callout(650, 32, sx_s(75.0), ey12(92.0), tr(lang, "Pendants (75/99\")", "Colgantes (75/99\")"), "#9 · 14/2", "w14", max_x=860)
        + svg_callout(555, 52, sx_s(62.0), ey12(44.0), tr(lang, "South 2 (62\" W*)", "Sur 2 (62\" O*)"), "#2 · 12/2", "w12", max_x=860)
        + svg_callout(450, 338, sx_s(76.0), ey12(14.0), tr(lang, "Under-Sink (76\" · 14\" AFF)", "Bajo Freg. (76\" · 14\" AFF)"), tr(lang, "#5+#6 (2 Yokes)", "#5+#6 (2 Yugos)"), "w12", max_x=860)
        + svg_callout(708, 362, sx_s(90.0), ey12(36.0), tr(lang, "Air Btn (90\")", "Botón (90\")"), "#6", "w14", max_x=860)
        + '</svg>'
    )

    e12 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-12", tr(lang, "East Wall (#1/#4) & South Wall (#2/#5/#6/#9) 1:1 Elevations", "Elevaciones 1:1 Muro Este (#1/#4) y Muro Sur (#2/#5/#6/#9)"))
        + legend_bar(lang)
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 Proportional Elevations (Ceiling = 121-1/2\" AFF · Add +t [est. 3/4\"] When Measuring From Bare Subfloor)", "Elevaciones Proporcionales 1:1 (Techo = 121-1/2\" AFF · Sumar +t [est. 3/4\"] Desde Subpiso Descubierto)")) + '</div>' + s12 + '</div>'
        + '<div class="note-blue">' + esc(tr(lang, "Dual-Datum Guide: 14\" AFF = 14-3/4\" subfloor (if t=3/4\") · 15\" AFF = 15-3/4\" subfloor · 36\" Counter = 36-3/4\" subfloor · 44\" Counter Outlets = 44-3/4\" subfloor (41\" AFF alt pending K-S6 markup) · 53\"–77\" AFF Panel No-Screw Band = 53-3/4\"–77-3/4\" subfloor.",
                                             "Guía Doble Altura: 14\" AFF = 14-3/4\" subpiso (si t=3/4\") · 15\" AFF = 15-3/4\" subpiso · 36\" Cubierta = 36-3/4\" subpiso · 44\" Contactos = 44-3/4\" subpiso (alt. 41\" AFF pendiente K-S6) · 53\"–77\" AFF Zona Sin Tornillos = 53-3/4\"–77-3/4\" subpiso.")) + '</div>'
        + footer_html(lang, mod_short, "E-12") + '</div>'
    )

    # --- Sheet E-13: True 1:1 Side-by-Side Elevations: West Range Wall (66.25"x121.5") & North Entry Wall (115.5"x121.5") ---
    SE13 = 2.05
    fl13 = 68.0 + 121.5 * SE13  # 317.075
    def ey13(aff): return fl13 - aff * SE13
    # Looking West: Left = South Step (0"), Right = NW corner (66.25") -> wx(n) = 195 + n*SE13
    def wx_w(n): return 195.0 + n * SE13
    # Looking North: Left = NW (0"), Right = NE (115.5") -> nx(e_from_nw) = 545 + e*SE13
    def nx_n(e): return 545.0 + e * SE13

    s13 = (
        '<svg viewBox="0 0 860 390" width="100%" data-equal-scale="2.05">'
        + svg_scale_bar(30, 362, SE13, 24, lang)
        + '<text x="263" y="20" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0f2537">{}</text>'.format(esc(tr(lang, "WEST RANGE WALL (66-1/4\" × 121-1/2\" · Looking West)", "MURO OESTE ESTUFA (66-1/4\" × 121-1/2\" · Viendo al Oeste)")))
        + '<text x="663" y="20" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0f2537">{}</text>'.format(esc(tr(lang, "NORTH ENTRY WALL (115-1/2\" × 121-1/2\" · Looking North)", "MURO NORTE ENTRADA (115-1/2\" × 121-1/2\" · Viendo al Norte)")))

        # WEST WALL 1:1 Box
        + '<rect x="195.0" y="68.0" width="{:.1f}" height="{:.1f}" fill="#f8fafc" stroke="#0f2537" stroke-width="2"/>'.format(66.25 * SE13, 121.5 * SE13)
        # Dual Wood Blocking Bands: 68"-86" AFF & 104"-121.5" AFF, leaving clear 8"-10" center 6" duct chase
        + '<rect x="195.0" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fef3c7" stroke="#d97706" stroke-dasharray="3,2"/>'.format(ey13(86.0), 66.25 * SE13, 18.0 * SE13)
        + '<rect x="195.0" y="68.0" width="{:.1f}" height="{:.1f}" fill="#fef3c7" stroke="#d97706" stroke-dasharray="3,2"/>'.format(66.25 * SE13, 17.5 * SE13)
        # 8-5/8" Chimney Shroud + 6" Center Duct at CL 33"
        + '<rect x="{:.1f}" y="68.0" width="{:.1f}" height="{:.1f}" fill="#e2e8f0" stroke="#475569"/>'.format(wx_w(28.69), 8.625 * SE13, 53.5 * SE13)
        + '<line x1="{:.1f}" y1="68.0" x2="{:.1f}" y2="{:.1f}" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4,2"/>'.format(wx_w(33.0), wx_w(33.0), ey13(68.0))
        # Hood Canopy (30" wide: 18"..48" N, 68"..82" AFF)
        + '<polygon points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>'.format(
            wx_w(18), ey13(68), wx_w(48), ey13(68), wx_w(37.3), ey13(82), wx_w(28.7), ey13(82))
        # 30" Viking Gas Range (18"..48" N, 0..36" AFF) + 18" side bases
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#ffedd5" stroke="#c2410c"/>'.format(wx_w(18.0), ey13(36.0), 30.0 * SE13, 36.0 * SE13)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.5" font-weight="800" fill="#9a3412">{}</text>'.format(wx_w(33.0), ey13(18.0), esc(tr(lang, "RANGE 30\"", "ESTUFA 30\"")))
        + '<line x1="195.0" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#0f2537" stroke-width="1.5"/>'.format(ey13(36.0), wx_w(66.25), ey13(36.0))
        # Physical Boxes on West Wall (Hood offset 35.25" N = 33 + 2.25" so it misses 6" center duct!)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fef08a" stroke="#713f12" stroke-width="1.4"/>'.format(wx_w(9.0) - 3, ey13(44.0) - 4)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fef08a" stroke="#713f12" stroke-width="1.4"/>'.format(wx_w(57.0) - 3, ey13(44.0) - 4)
        + '<rect x="{:.1f}" y="{:.1f}" width="8" height="6" fill="#ffffff" stroke="#0f172a" stroke-width="1.4"/>'.format(wx_w(33.0) - 4, ey13(3.0) - 3)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="8" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>'.format(wx_w(35.25) - 3, ey13(84.5) - 4)
        + '<text x="195" y="333" font-size="8.5" font-weight="800" fill="#dc2626">{}</text>'.format(esc(tr(lang, "Step = 0\"", "Escalón = 0\"")))
        + '<text x="{:.1f}" y="333" text-anchor="end" font-size="8.5" font-weight="700" fill="#0f2537">{}</text>'.format(wx_w(66.25), esc(tr(lang, "NW = 66.25\"", "NO = 66.25\"")))
        # West Callouts in Left Lane (x=10..185) & Middle Lane (x=342..530) — zero overlap!
        + svg_callout(10, 86, wx_w(35.25), ey13(84.5), tr(lang, "Hood (33±2.25\")", "Campana (33±2.25\")"), "#8 · 14/2", "w14", max_x=860)
        + svg_callout(10, 210, wx_w(9.0), ey13(44.0), tr(lang, "West 1 (9\" N)", "Oeste 1 (9\" N)"), "#3 · 12/2", "w12", max_x=860)
        + svg_callout(10, 292, wx_w(33.0), ey13(3.0), tr(lang, "Range (33\" · 3\" AFF)", "Estufa (33\" · 3\" AFF)"), "#7 · 14/2", "w14", max_x=860)
        + svg_callout(342, 210, wx_w(57.0), ey13(44.0), tr(lang, "West 2 (57\" N)", "Oeste 2 (57\" N)"), "#3 · 12/2", "w12", max_x=860)

        # NORTH WALL 1:1 Box
        + '<rect x="545.0" y="68.0" width="{:.1f}" height="{:.1f}" fill="#f8fafc" stroke="#0f2537" stroke-width="2"/>'.format(115.5 * SE13, 121.5 * SE13)
        # Picture Rail @ 103" AFF & Intact 9.5" Baseboard (0..86" E of NW)
        + '<line x1="545.0" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#92400e" stroke-width="2"/>'.format(ey13(103.0), nx_n(115.5), ey13(103.0))
        + '<text x="550" y="{:.1f}" font-size="8.2" font-weight="700" fill="#92400e">{}</text>'.format(ey13(106.0), esc(tr(lang, "PICTURE RAIL 103\" AFF", "RIEL CUADROS 103\" AFF")))
        + '<rect x="545.0" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fef3c7" stroke="#b45309"/>'.format(ey13(9.5), 86.0 * SE13, 9.5 * SE13)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.0" font-weight="700" fill="#92400e">{}</text>'.format(nx_n(43.0), ey13(2.5), esc(tr(lang, "9-1/2\" BASEBOARD (KEEP)", "ZOCLO 9-1/2\" (CONSERVAR)")))
        # Hall Opening on East end: 86.0"..115.5" E of NW (= 0..29.5" W of NE), 79"/84" tall
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#ffffff" stroke="#0f2537" stroke-width="1.8"/>'.format(nx_n(86.0), ey13(79.0), 29.5 * SE13, 79.0 * SE13)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.4" font-weight="800" fill="#0f2537">{}</text>'.format(nx_n(100.75), ey13(42.0), esc(tr(lang, "HALL 29.5\"", "PASO 29.5\"")))
        # Entry 3-Switch at 6" W of Hall Opening = 35.5" W of NE = 80.0" E of NW, @ 48" AFF!
        + '<rect x="{:.1f}" y="{:.1f}" width="14" height="9" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>'.format(nx_n(80.0) - 7, ey13(48.0) - 4.5)
        + svg_callout(555, 165, nx_n(80.0), ey13(48.0), tr(lang, "Entry 3-Switch (48\" AFF)", "3-Apag. Entrada (48\" AFF)"), "#9 · 14/2", "w14", max_x=860)
        + '<text x="545" y="333" font-size="8.5" font-weight="700" fill="#0f2537">{}</text>'.format(esc(tr(lang, "NW = 0\"", "NO = 0\"")))
        + '<text x="{:.1f}" y="333" text-anchor="end" font-size="8.5" font-weight="700" fill="#0f2537">{}</text>'.format(nx_n(115.5), "СВ = 115.5\"" if str(lang).upper() == "RU" else "NE = 115.5\"")
        + '</svg>'
    )

    e13 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-13", tr(lang, "West Wall (#3/#7/#8) & North Wall (#9) 1:1 Elevations", "Elevaciones 1:1 Muro Oeste (#3/#7/#8) y Muro Norte (#9)"))
        + legend_bar(lang)
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 Proportional Elevations — Hood 1-Gang Offset 33\" ± 2-1/4\" N (~1\" Proud) Clears 6\" Center Duct", "Elevaciones 1:1 — Caja Campana Desfasada 33\" ± 2-1/4\" N (~1\" Salida) Libra Ducto Central de 6\"")) + '</div>' + s13 + '</div>'
        + '<div class="note-red">' + esc(tr(lang, "West Wall Tile & Hood Lock: 1/2\" Drywall meets 1/2\" HardieBacker 500 directly on studs (ZERO 3/16\" shims). Set West 1, West 2, and Hood 1-gang 2\"×3\" boxes ~1\" proud for backer + tile; verify knockout side on Zephyr Savona downstairs (NEVER install retired 4\"×4\" box @ 100\").",
                                           "Candado Azulejo y Campana Muro Oeste: Tablaroca 1/2\" une con HardieBacker 1/2\" directo al montante (CERO calzas 3/16\"). Dejar cajas Oeste 1, Oeste 2 y Campana 2\"×3\" ~1\" salidas; confirmar lado del knockout en campana Zephyr (NUNCA instalar caja 4\"×4\" retirada a 100\").")) + '</div>'
        + footer_html(lang, mod_short, "E-13") + '</div>'
    )

    # --- Sheet E-14: Fully Bilingual Schedule + Pre-Drywall Checklist (Fixes BD-8 & IG-5) ---
    krows = [
        ("East 1", "Este 1", "East · 10\" N of SE", "Este · 10\" N de SE", "44\" AFF (+t)", "44\" AFF (+t)",
         "#1 · Kitchen East Counter", "#1 · Encimera Este Cocina", "12/2", "12/2", "w12",
         "20A TR deep 1-gang (41\" AFF alt pending K-S6; below 53\" Panel zone)", "Caja 1-gang prof. 20A TR (alt. 41\" AFF; bajo zona 53\" del Panel)"),
        ("East 2", "Este 2", "East · 45\" N of SE", "Este · 45\" N de SE", "44\" AFF (+t)", "44\" AFF (+t)",
         "#1 · Kitchen East Counter", "#1 · Encimera Este Cocina", "12/2", "12/2", "w12",
         "20A TR duplex centered over Nov 22 18\" drawer base (36\"–54\" N)", "Toma doble 20A TR sobre cajonera 18\" (36\"–54\" N)"),
        ("Fridge", "Refrigerador", "East · 68\" N of SE", "Este · 68\" N de SE", "15\" AFF (+t)", "15\" AFF (+t)",
         "#4 · Fridge", "#4 · Refrigerador", "12/2", "12/2", "w12",
         "Single 20A TR behind 28\" Haier (54\"–82\" N; 52.5\" bore band)", "Contacto sencillo 20A TR tras Haier 28\" (54\"–82\" N; franja 52.5\")"),
        ("South 1", "Sur 1", "South · 24\" W of SE", "Sur · 24\" O de SE", "44\" AFF (+t)", "44\" AFF (+t)",
         "#2 · Kitchen South Counter", "#2 · Encimera Sur Cocina", "12/2", "12/2", "w12",
         "20A TR duplex East of flush-sealed Pie-Safe patch (26\"–59\" W)", "Toma 20A TR al Este del parche Pie-Safe sellado (26\"–59\" O)"),
        ("South 2", "Sur 2", "South · 62\" W* (Hold)", "Sur · 62\" O* (Pausa)", "44\" AFF (+t)", "44\" AFF (+t)",
         "#2 · Kitchen South Counter", "#2 · Encimera Sur Cocina", "12/2", "12/2", "w12",
         "HOLD: 62\" (CL 87\") vs. 65\" (CL 90\") — verify window CL first", "PAUSA: 62\" (eje 87\") vs. 65\" (eje 90\") — verificar ventana"),
        ("Under-Sink 2-Gang", "Doble Bajo Fregadero", "South · 76\" W* (Hold)", "Sur · 76\" O* (Pausa)", "14\" AFF (+t)", "14\" AFF (+t)",
         "#5 DW + #6 Disposal", "#5 Lavavaj. + #6 Triturador", "12/2 + 14/2", "12/2 + 14/2", "w12",
         "Deep >=32 cu.in. 2-gang: 2 SEPARATE TR receptacles/yokes + separate neutrals!", "Caja doble >=32 pulg3: 2 receptáculos/yugos SEPARADOS + neutros separados"),
        ("Disposal Air Button", "Botón Aire Triturador", "South · 90\" W* (Hold)", "Sur · 90\" O* (Pausa)", "36\" Deck", "36\" Cubierta",
         "#6 · Disposal", "#6 · Triturador", "Air Hose", "Manguera Aire", "w14",
         "Deck air push-button to plug-in module on #6 (alt wired @ 67\"/70\")", "Botón de aire en cubierta hacia módulo en #6 (alt. cableado 67\"/70\")"),
        ("West 1", "Oeste 1", "West · 9\" N of Step", "Oeste · 9\" N Escalón", "44\" AFF (+t)", "44\" AFF (+t)",
         "#3 · Kitchen West Counter", "#3 · Encimera Oeste Cocina", "12/2", "12/2", "w12",
         "20A TR duplex + ~1\" tile mud ring (X = 31.5\" Range Wall)", "Toma doble 20A TR + aro ~1\" azulejo (Muro Estufa X = 31.5\")"),
        ("West 2", "Oeste 2", "West · 57\" N of Step", "Oeste · 57\" N Escalón", "44\" AFF (+t)", "44\" AFF (+t)",
         "#3 · Kitchen West Counter", "#3 · Encimera Oeste Cocina", "12/2", "12/2", "w12",
         "20A TR duplex + ~1\" tile mud ring (X = 31.5\" Range Wall)", "Toma doble 20A TR + aro ~1\" azulejo (Muro Estufa X = 31.5\")"),
        ("Range", "Estufa", "West · 33\" N of Step", "Oeste · 33\" N Escalón", "3\" AFF (+t)", "3\" AFF (+t)",
         "#7 · Gas Range", "#7 · Estufa de Gas", "14/2", "14/2", "w14",
         "Single 15A TR in low rear Viking pocket beside <=2\" gas shutoff", "Toma sencilla 15A TR en hueco bajo Viking junto a llave gas <=2\""),
        ("Hood", "Campana", "West · 33\"±2.25\" N Step", "Oeste · 33\"±2.25\" N Esc.", "83\"–86\" AFF (+t)", "83\"–86\" AFF (+t)",
         "#8 · Range Hood", "#8 · Campana Extractora", "14/2", "14/2", "w14",
         "Flush 1-gang 2\"×3\" ~1\" proud inside 8-5/8\" shroud + BRLW1 lock", "Caja 1-gang 2\"×3\" ~1\" salida en chimenea 8-5/8\" + bloqueo BRLW1"),
        ("Entry 3-Switch", "3-Apagadores Entrada", "North · 35.5\" W of NE", "Norte · 35.5\" O de NE", "48\" AFF (+t)", "48\" AFF (+t)",
         "#9 · Kitchen Lights", "#9 · Luces de Cocina", "14/2", "14/2", "w14",
         "6\" W of 29.5\" hall opening: Ceiling · Sink Pendants (75/99\") · Under-Cab", "6\" O del vano 29.5\": Luz Techo · Colgantes (75/99\") · Bajo Gabinete"),
    ]

    kt = (
        "<table class='ptbl-compact'><tr><th>" + esc(tr(lang, "Physical Box / Switch (Mapping 1)", "Caja / Apagador Físico (Mapeo 1)")) + "</th>"
        "<th>" + esc(tr(lang, "Wall & Station", "Muro y Estación")) + "</th><th>" + esc(tr(lang, "Height (AFF +t)", "Altura (AFF +t)")) + "</th>"
        "<th>" + esc(tr(lang, "Assigned Circuit (Mapping 2)", "Circuito Asignado (Mapeo 2)")) + "</th>"
        "<th>" + esc(tr(lang, "Cable", "Cable")) + "</th><th>" + esc(tr(lang, "Installation & Hold Notes", "Notas de Instalación y Pausa")) + "</th></tr>"
    )
    for ben, bes, sen, ses, hen, hes, cen, ces, cab_en, cab_es, wc, nen, nes in krows:
        kt += (
            "<tr><td><span class='bx'>" + esc(tr(lang, ben, bes)) + "</span></td>"
            "<td>" + esc(tr(lang, sen, ses)) + "</td><td><strong>" + esc(tr(lang, hen, hes)) + "</strong></td>"
            "<td><strong>" + esc(tr(lang, cen, ces)) + "</strong></td>"
            "<td><span class='" + wc + "'>" + esc(tr(lang, cab_en, cab_es)) + "</span></td>"
            "<td>" + esc(tr(lang, nen, nes)) + "</td></tr>"
        )
    kt += "</table>"

    chk_html = (
        '<div class="box" style="margin-top:4px;padding:4px 7px;"><h3>' + esc(tr(lang, "Mandatory Pre-Drywall Sign-Off Checklist (Kitchen)", "Lista Obligatoria Pre-Tablaroca (Cocina)")) + '</h3><ul style="font-size:8.6px;line-height:1.22;margin:2px 0 0 0;">'
        + '<li>[ ] ' + esc(tr(lang, "Measure finished-floor buildup t & verify common SE tape zero + South window CL (87\" vs. 90\") with tape-in-frame photos.",
                              "Medir espesor de piso terminado t y verificar cero SE común + eje ventana Sur (87\" vs. 90\") con fotos con cinta.")) + '</li>'
        + '<li>[ ] ' + esc(tr(lang, "Verify ZERO screws/boxes/wires in Panel back zone (13\"–27.5\" N, 53\"–77\" AFF) and 1/16\" steel nail plates wherever bore < 1-1/4\" from stud face.",
                              "Verificar CERO tornillos/cajas/cables tras el Panel (13\"–27.5\" N, 53\"–77\" AFF) y placas metálicas 1/16\" donde perforación < 1-1/4\".")) + '</li>'
        + '<li>[ ] ' + esc(tr(lang, "Verify Under-Sink 2-Gang @ 14\" AFF uses 2 separate receptacles (20A #5 + 15A #6) with separate labeled neutrals, and Hood 1-gang sits at 33\" ± 2-1/4\" N (~1\" proud).",
                              "Verificar Caja Doble Fregadero a 14\" AFF con 2 receptáculos separados (#5 20A + #6 15A) y neutros etiquetados, y Campana a 33\" ± 2-1/4\" N (~1\" salida).")) + '</li>'
        + '</ul></div>'
    )

    e14 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-14", tr(lang, "Kitchen Box-to-Circuit Schedule & Pre-Drywall Checklist", "Tabla Caja-a-Circuito y Verificación Pre-Tablaroca"))
        + legend_bar(lang)
        + '<div class="box"><h3>' + esc(tr(lang, "Mapping 1 (Physical Box Location) vs. Mapping 2 (Assigned Circuit #1–#9)", "Mapeo 1 (Ubicación Física) vs. Mapeo 2 (Circuito Asignado #1–#9)")) + '</h3>' + kt + '</div>'
        + chk_html
        + footer_html(lang, mod_short, "E-14") + '</div>'
    )
    return build_e00(lang, 1) + e11 + e12 + e13 + e14


def build_module2(lang):
    mod_title = tr(lang, "MODULE 2: WHOLE-UNIT SEGMENTS", "MÓDULO 2: SEGMENTOS DE TODA LA UNIDAD")
    mod_short = tr(lang, "Module 2 (Whole Unit)", "Módulo 2 (Toda la Unidad)")

    # --- Sheet E-21: Whole-Unit 1:1 Key Map (scaleX = scaleY = 1.15 px/in) ---
    S21 = 1.15
    def ux(x): return 95.0 + x * S21
    def uy(y): return 28.0 + y * S21
    def poly(pts): return " ".join(["{:.1f},{:.1f}".format(ux(x), uy(y)) for x, y in pts])

    p_d4 = poly([(66,34),(147,34),(147,108),(66,108)])
    p_ki = poly([(31.5,108),(147,108),(147,234.25),(0,234.25),(0,174.25),(31.5,174.25)])
    p_di = poly([(147,142),(293.7,142),(293.7,297.75),(147,297.75)])
    p_li = poly([(293.7,142),(473.5,142),(508,178),(508,258),(473.5,297.75),(293.7,297.75)])
    p_ha = poly([(147,58),(207,58),(207,88),(352,88),(352,142),(147,142)])
    p_ba = poly([(207,0),(279.1,0),(279.1,88),(207,88)])
    p_la = poly([(279.1,5.4),(315.4,5.4),(315.4,88),(279.1,88)])
    p_be = poly([(315.4,0),(437.5,0),(474,34),(474,96),(437.5,136),(352,136),(352,88),(315.4,88)])

    s21 = (
        '<svg viewBox="0 0 820 405" width="100%" data-equal-scale="1.15">'
        + svg_compass(775, 36, lang)
        + svg_scale_bar(16, 378, S21, 60, lang)
        + '<polygon points="' + p_d4 + '" fill="#f1f5f9" stroke="#0f2537" stroke-width="1.6"/>'
        + '<polygon points="' + p_ki + '" fill="#e2e8f0" stroke="#0f2537" stroke-width="2"/>'
        + '<polygon points="' + p_di + '" fill="#fef9c3" stroke="#ca8a04" stroke-width="2.2"/>'
        + '<polygon points="' + p_li + '" fill="#fef9c3" stroke="#ca8a04" stroke-width="2.2"/>'
        + '<polygon points="' + p_ha + '" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/>'
        + '<polygon points="' + p_ba + '" fill="#dcfce7" stroke="#16a34a" stroke-width="2.2"/>'
        + '<polygon points="' + p_la + '" fill="#ffedd5" stroke="#ea580c" stroke-width="2.2"/>'
        + '<polygon points="' + p_be + '" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.2"/>'
        # Panel 30"W x 36"D Clear Working Space on Dining side
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fee2e2" stroke="#dc2626" stroke-dasharray="3,2"/>'.format(ux(147), uy(198.75), 36 * S21, 30 * S21)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.5" font-weight="800" fill="#334155">{}</text>'.format(ux(92), uy(165), esc(tr(lang, "KITCHEN (MOD 1)", "COCINA (MÓD 1)")))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="9.2" font-weight="800" fill="#854d0e">{}</text>'.format(ux(220), uy(220), esc(tr(lang, "DINING (SEG A)", "COMEDOR (SEG A)")))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="9.2" font-weight="800" fill="#854d0e">{}</text>'.format(ux(395), uy(220), esc(tr(lang, "LIVING (SEG A)", "SALA (SEG A)")))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.5" font-weight="800" fill="#14532d">{}</text>'.format(ux(243), uy(46), esc(tr(lang, "BATH (B)", "BAÑO (B)")))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.8" font-weight="800" fill="#9a3412">{}</text>'.format(ux(297), uy(46), esc(tr(lang, "LAU", "LAV")))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="9.2" font-weight="800" fill="#075985">{}</text>'.format(ux(400), uy(68), esc(tr(lang, "BEDROOM (SEG C)", "RECÁMARA (SEG C)")))
        # Clean non-overlapping perimeter callouts
        + svg_callout(10, 88, ux(112), uy(74), tr(lang, "Door 4 Hatch", "Escotilla P4"), "#16 · 14/2", "w14", max_x=820)
        + svg_callout(10, 200, ux(92), uy(180), tr(lang, "Kitchen", "Cocina"), "#1–#9", "w12", max_x=820)
        + svg_callout(10, 268, ux(165), uy(214), tr(lang, "Panel 30×36\"", "Panel 30×36\""), ("Eaton 20 мод." if str(lang).upper() == "RU" else "Eaton 20-Sp"), "w143", max_x=820)
        + svg_callout(225, 6, ux(243), uy(20), tr(lang, "Bathroom", "Baño"), "#13 · 12/2", "w12", max_x=820)
        + svg_callout(415, 6, ux(297), uy(25), tr(lang, "Laundry Duplex", "Lavandería"), "#14 · 12/2", "w12", max_x=820)
        + svg_callout(605, 68, ux(420), uy(50), tr(lang, "Bed 1–5 + Hall 1", "Rec 1–5 + Pas 1"), "#10 · 12/2*", "w12", max_x=820)
        + svg_callout(605, 195, ux(430), uy(195), tr(lang, "Living 1–5", "Sala 1–5"), "#10 · 12/2*", "w12", max_x=820)
        + svg_callout(285, 382, ux(220), uy(265), tr(lang, "Dining 1–4 + F1", "Comedor 1–4 + F1"), "#10 / #15", "w12", max_x=820)
        + '</svg>'
    )

    e21 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-21", tr(lang, "Whole-Unit 1:1 Segment Map (508\"×298\")", "Mapa 1:1 de Segmentos de la Unidad (508\"×298\")"))
        + legend_bar(lang)
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 True-Scale Unit 4 Key Map (North UP · All 4 Highlighted Segments E-22 through E-25)", "Mapa Clave 1:1 Unidad 4 (Norte ARRIBA · Los 4 Segmentos E-22 a E-25)")) + '</div>' + s21 + '</div>'
        + '<div class="note-blue">' + esc(tr(lang, "Segment Routing Overview: E-22 Living & Dining (#10 outlets + #12 lights) · E-23 Bathroom (#13 single 20A 12/2 circuit) · E-24 Laundry (#14 East wall @ 38\" AFF) + Bedroom/Hall (#10 shared outlets + #12 3-way lights; #11 Spare) · E-25 Attic Furnace (#15) + Smoke/CO & Service (#16).",
                                             "Resumen de Segmentos: E-22 Sala y Comedor (#10 tomas + #12 luces) · E-23 Baño (#13 circuito único 20A 12/2) · E-24 Lavandería (#14 muro Este a 38\" AFF) + Recámara/Pasillo (#10 tomas compartidas + #12 luces 3-vías; #11 Reserva) · E-25 Calefactor (#15) + Humo/CO y Servicio (#16).")) + '</div>'
        + footer_html(lang, mod_short, "E-21") + '</div>'
    )

    # --- Sheet E-22: Segment A — Living & Dining Rooms (True 1:1 Scale S22 = 1.45 px/in) ---
    # X = 147..508" (width 361" = 523.45 px), Y = 142..297.75" (height 155.75" = 225.8 px)
    S22 = 1.45
    def ax(x): return 155.0 + (x - 147.0) * S22
    def ay(y): return 72.0 + (y - 142.0) * S22
    p_din22 = " ".join(["{:.1f},{:.1f}".format(ax(x), ay(y)) for x, y in [(147,142),(293.7,142),(293.7,297.75),(147,297.75)]])
    p_liv22 = " ".join(["{:.1f},{:.1f}".format(ax(x), ay(y)) for x, y in [(293.7,142),(473.5,142),(508,178),(508,258),(473.5,297.75),(293.7,297.75)]])

    s22 = (
        '<svg viewBox="0 0 880 365" width="100%" data-equal-scale="1.45">'
        + svg_compass(838, 36, lang)
        + svg_scale_bar(16, 338, S22, 48, lang)
        + '<polygon points="' + p_din22 + '" fill="#fefce8" stroke="#0f2537" stroke-width="2.4"/>'
        + '<polygon points="' + p_liv22 + '" fill="#fefce8" stroke="#0f2537" stroke-width="2.4"/>'
        # Double Pocket Door Cased Opening (~66.5" centered on shared wall X=293.7, Y=186..252.5) + ~33" Hollow Pocket Zones!
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="{:.1f}" fill="#fee2e2" stroke="#dc2626" stroke-dasharray="3,2"/>'.format(ax(293.7) - 6, ay(153), 33 * S22)
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="{:.1f}" fill="#fee2e2" stroke="#dc2626" stroke-dasharray="3,2"/>'.format(ax(293.7) - 6, ay(252.5), 33 * S22)
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#ffffff" stroke-width="5"/>'.format(ax(293.7), ay(186), ax(293.7), ay(252.5))
        # Panel + 30"W x 36"D Clear Working Space on Dining West Wall (NO D5 OUTLET!)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="4,2"/>'.format(ax(147), ay(198.75), 36 * S22, 30 * S22)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="{:.1f}" fill="#dc2626"/>'.format(ax(147) - 3, ay(203.25), 21 * S22)
        # Attic J-Boxes: Living/Dining J-Box (#10, +1.5" ext) at (260, 200) & Lights J-Box (#12) at (252, 150)
        + '<rect x="{:.1f}" y="{:.1f}" width="18" height="14" rx="2" fill="#fef08a" stroke="#713f12" stroke-width="2"/>'.format(ax(255) - 9, ay(202) - 7)
        + '<rect x="{:.1f}" y="{:.1f}" width="18" height="14" rx="2" fill="#ffffff" stroke="#334155" stroke-width="1.8"/>'.format(ax(245) - 9, ay(155) - 7)
        # Dashed Wire Paths from Panel -> Living/Dining J-Box -> Individual Outlets
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.3" stroke-dasharray="6,3"/>'.format(ax(147), ay(214), ax(255), ay(202), ax(190), ay(142))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0" stroke-dasharray="6,3"/>'.format(ax(255), ay(202), ax(268), ay(142), ax(340), ay(142))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0" stroke-dasharray="6,3"/>'.format(ax(255), ay(202), ax(185), ay(297.75), ax(258), ay(297.75))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0" stroke-dasharray="6,3"/>'.format(ax(255), ay(202), ax(400), ay(202), ax(508), ay(218), ax(432), ay(297.75))
        # Individual Outlet Dots (Dining 1-4, Living 1-5 @ 18" AFF in lower frames)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(190), ay(142))  # Dining 1
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(268), ay(142))  # Dining 2
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(185), ay(297.75)) # Dining 3
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(258), ay(297.75)) # Dining 4
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(340), ay(142))  # Living 1 (x=17.5" on L01)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(432), ay(142))  # Living 2 (x=106.5" on L01)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(340), ay(297.75)) # Living 3 (fireplace L)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(432), ay(297.75)) # Living 4 (fireplace R)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(ax(508), ay(218))  # Living 5 (East Bay)
        # Ceiling Lights & Wall Switches (#12)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="6.5" fill="#ffffff" stroke="#334155" stroke-width="1.6" stroke-dasharray="3,2"/>'.format(ax(218), ay(220))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="6.5" fill="#ffffff" stroke="#334155" stroke-width="1.6" stroke-dasharray="3,2"/>'.format(ax(400), ay(220))
        + '<rect x="{:.1f}" y="{:.1f}" width="9" height="6" fill="#fee2e2" stroke="#dc2626"/>'.format(ax(165), ay(142))
        + '<rect x="{:.1f}" y="{:.1f}" width="9" height="6" fill="#fee2e2" stroke="#dc2626"/>'.format(ax(312), ay(142))
        # Non-overlapping Callout Badges around perimeter
        + svg_callout(8, 108, ax(147), ay(214), tr(lang, "Panel (NO D5!)", "Panel (¡SIN D5!)"), tr(lang, "30×36\" Clear", "30×36\" Libre"), "w143", max_x=880)
        + svg_callout(4, 160, ax(255), ay(202), tr(lang, "Liv/Din J-Box", "Caja Sala/Com"), "#10 · 12/2*", "w12", max_x=880)
        + svg_callout(4, 212, ax(218), ay(220), tr(lang, "Din Light+Sw", "Luz+Ap Com"), "#12 · 14/2", "w14", max_x=880)
        + svg_callout(145, 16, ax(190), ay(142), tr(lang, "Dining 1 & 2 (18\" AFF)", "Comedor 1 y 2 (18\" AFF)"), "#10 · 12/2*", "w12", max_x=880)
        + svg_callout(375, 16, ax(293.7), ay(168), tr(lang, "D6/L6 Pocket HOLD", "PAUSA Bolsillo D6/L6"), tr(lang, "NO BOXES", "SIN CAJAS"), "w143", max_x=880)
        + svg_callout(585, 16, ax(340), ay(142), tr(lang, "Living 1 & 2 (L01)", "Sala 1 y 2 (L01)"), "#10 · 12/2*", "w12", max_x=880)
        + svg_callout(688, 148, ax(508), ay(218), tr(lang, "Living 5 (Bay)", "Sala 5 (Bahía)"), "#10 · 12/2*", "w12", max_x=880)
        + svg_callout(688, 200, ax(400), ay(220), tr(lang, "Liv Light+Sw", "Luz+Ap Sala"), "#12 · 14/2", "w14", max_x=880)
        + svg_callout(195, 326, ax(220), ay(297.75), tr(lang, "Dining 3 & 4 (South)", "Comedor 3 y 4 (Sur)"), "#10 · 12/2*", "w12", max_x=880)
        + svg_callout(465, 326, ax(386), ay(297.75), tr(lang, "Living 3 & 4 (Mantel)", "Sala 3 y 4 (Chimenea)"), "#10 · 12/2*", "w12", max_x=880)
        + '</svg>'
    )

    e22 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-22", tr(lang, "Segment A: Living & Dining Rooms (#10 Outlets · #12 Lights)", "Segmento A: Sala y Comedor (#10 Tomas · #12 Luces)"))
        + legend_bar(lang)
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 Segment A Plan — Dining 1–4 & Living 1–5 (@ 18\" AFF in Lower Frames; 11-1/2\" Alt) + Pocket-Door & Panel Holds", "Plano 1:1 Segmento A — Comedor 1–4 y Sala 1–5 (a 18\" AFF en Marcos Inferiores; Alt. 11-1/2\") + Pausas")) + '</div>' + s22 + '</div>'
        + '<div class="note-red"><strong>' + esc(tr(lang, "MANDATORY GAUGE & HOLD RULES (#10):", "REGLAS OBLIGATORIAS DE CALIBRE Y PAUSA (#10):")) + '</strong> '
        + esc(tr(lang, "1) Gauge-check every reused wire leg before energizing #10 (NEC 240.4(D)(3)): if ANY reused wire is 14 AWG, install a 15A AFCI breaker (BRN115AF) instead of 20A; if ungrounded 2-wire is reused, protect with Dual-Function AFCI/GFCI + 'No Equipment Ground' labels. 2) NO outlet on Panel wall (Dining West). 3) Keep ~33\" double pocket-door cavities completely clear (D6/L6 on hold until pier widths M4/M5 are verified). 4) Add 1-1/2\" extension ring on Living/Dining J-Box (split-ready to Spare #17).",
                 "1) Verificar calibre de cada cable reusado antes de energizar #10 (NEC 240.4(D)(3)): si ALGÚN tramo reusado es 14 AWG, instalar interruptor 15A AFCI (BRN115AF) en vez de 20A; si no tiene tierra física, usar Doble Función AFCI/GFCI + etiquetas 'Sin Tierra'. 2) PROHIBIDO contacto en muro del Panel (Comedor Oeste). 3) Mantener libres las cavidades ~33\" de puertas corredizas (D6/L6 en pausa hasta medir jambas M4/M5). 4) Usar aro de extensión 1-1/2\" en Caja Sala/Comedor (divisible luego a Reserva #17)."))
        + '</div>' + footer_html(lang, mod_short, "E-22") + '</div>'
    )

    # --- Sheet E-23: Segment B — Bathroom 1:1 Plan (72.125" x 82.125", S23 = 2.65 px/in) ---
    # Nov 24 Owner Lock: Pocket door permanently RETIRED -> standard hinged 28" outward-swing hallway door;
    # South wall is standard framed stud assembly (active switch installation permitted).
    # Governing room dimensions: 72-1/8" x 82-1/8" per bathroom/SPEC.md (Nov 24 back-wall field note: 69-5/16").
    S23 = 2.65
    def bx_b(x): return 235.0 + x * S23
    def by_b(y): return 48.0 + y * S23

    s23 = (
        '<svg viewBox="0 0 840 340" width="100%" data-equal-scale="2.65">'
        + svg_compass(798, 36, lang)
        + svg_scale_bar(24, 312, S23, 24, lang)
        # Bathroom 72.125" x 82.125" (governing bathroom/SPEC.md)
        + '<rect x="235.0" y="48.0" width="{:.1f}" height="{:.1f}" fill="#f0fdf4" stroke="#0f2537" stroke-width="2.5"/>'.format(72.125 * S23, 82.125 * S23)
        # Tub/Shower along North end (0..30" Y) — Damp/Wet zone CEC 410.10(D)
        + '<rect x="235.0" y="48.0" width="{:.1f}" height="{:.1f}" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/>'.format(72.125 * S23, 30.0 * S23)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="9.0" font-weight="800" fill="#1e40af">{}</text>'.format(bx_b(36), by_b(14), esc(tr(lang, "TUB / SHOWER (WET/DAMP ZONE)", "TINA / REGADERA (ZONA HÚMEDA)")))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1e3a8a">{}</text>'.format(bx_b(36), by_b(25), esc(tr(lang, "Back wall: 69-5/16\" field note", "Muro fondo: nota 69-5/16\"")))
        # Pedestal Vanity on West wall (Y=40..64") + Vanity Sconce
        + '<rect x="235.0" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e2e8f0" stroke="#475569"/>'.format(by_b(40), 20 * S23, 24 * S23)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1e293b">{}</text>'.format(bx_b(10), by_b(56), esc(tr(lang, "VANITY", "LAVABO")))
        # Toilet on East side (X=54", Y=52")
        + '<ellipse cx="{:.1f}" cy="{:.1f}" rx="20" ry="14" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>'.format(bx_b(54), by_b(52))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.0" font-weight="700" fill="#334155">WC</text>'.format(bx_b(54), by_b(55))
        # Standard framed stud South wall (Pocket Door RETIRED Nov 24) + 28" Outward-Swing Hallway Door (X=30..58")
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#ffffff" stroke-width="5"/>'.format(bx_b(30), by_b(82.125), bx_b(58), by_b(82.125))
        + '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="#0f2537" stroke-width="2.0"/>'.format(bx_b(30), by_b(82.125), bx_b(30), by_b(82.125 + 24.0))
        + '<path d="M {:.1f},{:.1f} A {:.1f},{:.1f} 0 0,0 {:.1f},{:.1f}" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="4,2"/>'.format(bx_b(30), by_b(82.125 + 24.0), 24.0 * S23, 24.0 * S23, bx_b(54), by_b(82.125))
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.2" font-weight="800" fill="#14532d">{}</text>'.format(bx_b(41), by_b(76), esc(tr(lang, "28\" OUT-SWING DOOR (FIELD VERIFY)", "PUERTA 28\" ABATIBLE AFUERA")))

        # Attic Bath J-Box (#13) drawn to the East with 5 explicit 12/2 Yellow home-drops!
        + '<rect x="520" y="128" width="96" height="40" rx="4" fill="#fef08a" stroke="#713f12" stroke-width="2.2"/>'
        + '<text x="568" y="145" text-anchor="middle" font-size="9.2" font-weight="800" fill="#713f12">{}</text>'.format(esc(tr(lang, "Bath J-Box", "Caja Baño")))
        + '<text x="568" y="159" text-anchor="middle" font-size="8.5" font-weight="700" fill="#713f12">#13 · 100% 12/2</text>'
        + '<line x1="616" y1="148" x2="785" y2="148" stroke="#ca8a04" stroke-width="3.2"/>'
        + '<text x="700" y="140" text-anchor="middle" font-size="8.8" font-weight="800" fill="#713f12">{}</text>'.format(esc(tr(lang, "FROM PANEL #13 (12/2)", "DESDE PANEL #13 (12/2)")))

        # 5 Separate 12/2 Yellow Branches from Bath J-Box
        + '<polyline points="520,134 460,134 {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.2"/>'.format(bx_b(36), by_b(42))
        + '<polyline points="520,142 465,142 {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.2"/>'.format(bx_b(72.125), by_b(60))
        + '<polyline points="520,150 470,150 {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0"/>'.format(bx_b(0), by_b(58))
        + '<polyline points="520,158 475,158 {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0"/>'.format(bx_b(0), by_b(38))
        + '<polyline points="520,164 480,164 {:.1f},{:.1f}" fill="none" stroke="#ca8a04" stroke-width="2.0"/>'.format(bx_b(65), by_b(82.125))

        # Physical Device Markers
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#713f12" stroke-width="1.6"/>'.format(bx_b(0), by_b(38))      # Vanity Light
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#713f12" stroke-width="1.6"/>'.format(bx_b(0), by_b(58))      # Vanity GFCI
        + '<circle cx="{:.1f}" cy="{:.1f}" r="6.5" fill="#ffffff" stroke="#16a34a" stroke-width="1.8"/>'.format(bx_b(36), by_b(42))     # Bath Light + Fan
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.8" fill="#fef08a" stroke="#713f12" stroke-width="1.6"/>'.format(bx_b(72.125), by_b(60)) # Toilet GFCI (12" AFF)
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="7" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>'.format(bx_b(65) - 6, by_b(82.125) - 7) # Framed stud wall switches

        # Non-overlapping Callouts
        + svg_callout(14, 118, bx_b(0), by_b(38), tr(lang, "Vanity Light", "Luz Espejo"), "#13 · 12/2", "w12", max_x=840)
        + svg_callout(14, 186, bx_b(0), by_b(58), tr(lang, "Vanity (40–44\" AFF)", "Lavabo (40–44\" AFF)"), "#13 · 12/2", "w12", max_x=840)
        + svg_callout(14, 250, bx_b(15), by_b(82.125), tr(lang, "Framed Stud Wall", "Muro de Postes"), tr(lang, "Switches OK", "Apagadores OK"), "w12", max_x=840)
        + svg_callout(260, 14, bx_b(36), by_b(42), tr(lang, "Bath Light + Humidity Fan", "Luz Techo + Extractor"), "#13 · 12/2", "w12", max_x=840)
        + svg_callout(520, 210, bx_b(72.125), by_b(60), tr(lang, "Toilet (12\" AFF · Sep. Drop!)", "Inodoro (12\" AFF · Bajada Sep.)"), "#13 · 12/2", "w12", max_x=840)
        + svg_callout(465, 290, bx_b(65), by_b(82.125), tr(lang, "Bath Switches (Stud Wall)", "Apagadores (Muro Postes)"), "#13 · 12/2", "w12", max_x=840)
        + '</svg>'
    )

    e23 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-23", tr(lang, "Segment B: Bathroom All-in-One (#13 · 12/2 via Bath J-Box)", "Segmento B: Baño Todo-en-Uno (#13 · 12/2 vía Caja Baño)"))
        + legend_bar(lang)
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 Bathroom Plan (72-1/8\" × 82-1/8\" per SPEC; Nov 24 back-wall note: 69-5/16\") — Outward-Swing Hallway Door (Pocket Door RETIRED) · Separate 12/2 Toilet Drop Before Tile!", "Plano 1:1 de Baño (72-1/8\" × 82-1/8\" según SPEC; nota 24 nov muro fondo: 69-5/16\") — Puerta Abatible Hacia Pasillo (Corrediza RETIRADA) · ¡Bajada 12/2 Separada al Inodoro Antes del Azulejo!")) + '</div>' + s23 + '</div>'
        + '<div class="note-red"><strong>' + esc(tr(lang, "CRITICAL 20A BATHROOM & PRE-TILE RULES (#13):", "REGLAS CRÍTICAS 20A Y PRE-AZULEJO EN BAÑO (#13):")) + '</strong> '
        + esc(tr(lang, "1) ALL 5 branches from Bath J-Box (Vanity, Toilet, Ceiling Light, Vanity Light, Humidity Fan & Switches) MUST use 12/2 Yellow (NEVER 14/2 on a 20A breaker, NEC 240.4(D)(5); use deep switch box for 12 AWG fill + Title 24 vacancy sensor). 2) ZERO loads outside Bathroom (CEC 210.11(C)(3) Ex.; fastened fan+lights <=10A per 210.23(A)(2)). 3) Pocket door permanently RETIRED (Nov 24): South wall is a standard framed stud assembly (active switch installation permitted); 28\"×1-3/8\" slab swings outward into hallway (field-verify hinge swing & clearance). 4) Pull a SEPARATE 12/2 home-drop from Bath J-Box to Toilet BEFORE wall tile (tile on hold until Alex returns) so splitting a heated bidet to Spare #19 later requires zero tile demolition; damp/wet-rated fixture over tub (CEC 410.10(D)).",
                 "1) TODOS los 5 ramales desde Caja Baño (Lavabo, Inodoro, Luz Techo, Luz Espejo, Extractor y Apagadores) DEBEN ser 12/2 Amarillo (PROHIBIDO 14/2 en interruptor 20A; usar caja profunda + sensor Title 24). 2) CERO cargas fuera del Baño (CEC 210.11(C)(3) Ex.). 3) Puerta corrediza RETIRADA definitivamente (24 nov): el muro Sur es bastidor estándar de postes (se permite instalar apagadores); hoja 28\"×1-3/8\" abate hacia afuera al pasillo (verificar sentido y claro en obra). 4) Tirar bajada 12/2 SEPARADA desde Caja Baño al Inodoro ANTES del azulejo de muro (en pausa hasta regreso de Alex) para poder dividir luego a Reserva #19 sin romper azulejo; luminaria apta zona húmeda sobre tina (CEC 410.10(D))."))
        + '</div>' + footer_html(lang, mod_short, "E-23") + '</div>'
    )

    # --- Sheet E-24: Segment C — Laundry (#14) + Bedroom & Hall (#11/#12) (True 1:1 Plan + 1:1 Laundry Elev) ---
    # Plan covers X = 147..474" (width 327"), Y = 0..142" (height 142") at S24 = 1.32 px/in (431.6 x 187.4 px)
    # Laundry East Elev (82.625" D x 121.5" H) at SE24 = 1.65 px/in (136.3 x 200.5 px) on right!
    S24 = 1.32
    def cx_c(x): return 125.0 + (x - 147.0) * S24
    def cy_c(y): return 62.0 + y * S24
    p_ha24 = " ".join(["{:.1f},{:.1f}".format(cx_c(x), cy_c(y)) for x, y in [(147,58),(207,58),(207,88),(352,88),(352,142),(147,142)]])
    p_la24 = " ".join(["{:.1f},{:.1f}".format(cx_c(x), cy_c(y)) for x, y in [(279.1,5.4),(315.4,5.4),(315.4,88),(279.1,88)]])
    p_be24 = " ".join(["{:.1f},{:.1f}".format(cx_c(x), cy_c(y)) for x, y in [(315.4,0),(437.5,0),(474,34),(474,96),(437.5,136),(352,136),(352,88),(315.4,88)]])

    SE24 = 1.65
    fl24 = 58.0 + 121.5 * SE24  # 258.5
    def ly24(aff): return fl24 - aff * SE24
    def lx24(d_from_n): return 660.0 + d_from_n * SE24  # 0=North back wall (660), 82.6=South Murphy door (796.3)

    s24 = (
        '<svg viewBox="0 0 840 350" width="100%" data-equal-scale="1.32">'
        + svg_compass(618, 34, lang)
        + svg_scale_bar(16, 322, S24, 48, lang)
        + '<polygon points="' + p_ha24 + '" fill="#f8fafc" stroke="#0f2537" stroke-width="1.8"/>'
        + '<polygon points="' + p_la24 + '" fill="#fff7ed" stroke="#ea580c" stroke-width="2.2"/>'
        + '<polygon points="' + p_be24 + '" fill="#f0f9ff" stroke="#0284c7" stroke-width="2.2"/>'
        # LG WashTower (27"x30.4") + 8-1/4" Murphy Bookcase Door Projection
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e2e8f0" stroke="#475569"/>'.format(cx_c(283.5), cy_c(10), 27 * S24, 30.4 * S24)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fef3c7" stroke="#b45309" stroke-dasharray="3,2"/>'.format(cx_c(279.1), cy_c(79.75), 36.3 * S24, 8.25 * S24)
        # NW Bedroom Temp Closet Niche (X=315.4..352, Y=54..88) — Keep Ceiling Open!
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fef2f2" stroke="#dc2626" stroke-dasharray="3,2"/>'.format(cx_c(315.4), cy_c(54), 36.6 * S24, 34 * S24)
        # Attic Bed/Hall J-Box (#11) at (395, 64)
        + '<rect x="{:.1f}" y="{:.1f}" width="16" height="12" rx="2" fill="#fef08a" stroke="#713f12" stroke-width="1.8"/>'.format(cx_c(395) - 8, cy_c(64) - 6)
        # Individual Outlets: Washer/Dryer (315.4, 52), Bed 1 (338, 0), Bed 2 (410, 0), Bed 3 (415, 136), Bed 4 (322, 36), Bed 5 (474, 64), Hall 1 (192, 88)
        + '<rect x="{:.1f}" y="{:.1f}" width="6" height="9" fill="#fef08a" stroke="#713f12" stroke-width="1.6"/>'.format(cx_c(315.4) - 6, cy_c(52) - 4.5)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(cx_c(338), cy_c(0))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(cx_c(410), cy_c(0))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(cx_c(415), cy_c(136))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(cx_c(322), cy_c(32))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(cx_c(474), cy_c(64))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="#fef08a" stroke="#0284c7" stroke-width="1.6"/>'.format(cx_c(265), cy_c(88))  # Hall 1 between Bath & Murphy
        # Laundry Light + Switch (#12!), Hall Lights 1 & 2 + 2x Hall 3-Way Switches (#12 · 14/3 Red!), Bed Light + Switch (#12)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="5.0" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>'.format(cx_c(297), cy_c(60))
        + '<rect x="{:.1f}" y="{:.1f}" width="7" height="5" fill="#fee2e2" stroke="#dc2626"/>'.format(cx_c(281), cy_c(72))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="5.5" fill="#ffffff" stroke="#dc2626" stroke-width="1.5"/>'.format(cx_c(185), cy_c(115))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="5.5" fill="#ffffff" stroke="#dc2626" stroke-width="1.5"/>'.format(cx_c(310), cy_c(115))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,2"/>'.format(
            cx_c(152), cy_c(108), cx_c(185), cy_c(115), cx_c(310), cy_c(115), cx_c(348), cy_c(96))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="6.0" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>'.format(cx_c(395), cy_c(88))

        # Non-overlapping Plan Callouts
        + svg_callout(6, 82, cx_c(265), cy_c(88), tr(lang, "Hall 1 (18\" AFF)", "Pasillo 1 (18\" AFF)"), "#10 · 12/2*", "w12", max_x=840)
        + svg_callout(6, 114, cx_c(185), cy_c(115), tr(lang, "2× Hall 3-Way+Lts", "2× 3-Vías Pasillo"), "#12 · 14/3", "w143", max_x=840)
        + svg_callout(6, 253, cx_c(297), cy_c(60), tr(lang, "Laundry Lt + Sw", "Luz+Apag. Lav."), "#12 · 14/2", "w14", max_x=840)
        + svg_callout(155, 14, cx_c(315.4), cy_c(52), tr(lang, "Washer/Dryer (38\")", "Lav/Sec (38\" AFF)"), "#14 · 12/2", "w12", max_x=840)
        + svg_callout(355, 14, cx_c(374), cy_c(0), tr(lang, "Bed 1 & 2 (11.5\" AFF)", "Rec 1 y 2 (11.5\" AFF)"), "#10 · 12/2*", "w12", max_x=840)
        + svg_callout(504, 56, cx_c(474), cy_c(64), tr(lang, "Bed 5 + J-Box", "Rec 5 + Caja"), "#10 · 12/2*", "w12", max_x=840)
        + svg_callout(180, 268, cx_c(333), cy_c(72), tr(lang, "Temp Closet (OPEN)", "Clóset Temp (ABIERTO)"), tr(lang, "LV + Hatch", "BV + Escot."), "w143", max_x=840)
        + svg_callout(415, 268, cx_c(415), cy_c(136), tr(lang, "Bed 3 & 4 + Bed Lt", "Rec 3 y 4 + Luz"), "#10 / #12", "w12", max_x=840)

        # RIGHT INSET: 1:1 Laundry East Wall Elevation (82.625" D x 121.5" H)
        + '<text x="728" y="20" text-anchor="middle" font-size="9.5" font-weight="800" fill="#9a3412">{}</text>'.format(esc(tr(lang, "LAUNDRY EAST WALL 1:1", "MURO ESTE LAVANDERÍA 1:1")))
        + '<rect x="660.0" y="58.0" width="{:.1f}" height="{:.1f}" fill="#fff7ed" stroke="#0f2537" stroke-width="2"/>'.format(82.625 * SE24, 121.5 * SE24)
        # LG WKG101HVA: 4" rear clearance + 30.375" D (4..34.4" from North), 74.375" H
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e2e8f0" stroke="#475569"/>'.format(lx24(4.0), ly24(74.375), 30.375 * SE24, 74.375 * SE24)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.0" font-weight="800" fill="#1e293b">LG 74.4"</text>'.format(lx24(19.2), ly24(38.0))
        # 8-1/4" Murphy Bookcase Door Projection on South front (74.375"..82.625")
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#fef3c7" stroke="#b45309" stroke-dasharray="3,2"/>'.format(lx24(74.375), ly24(84.0), 8.25 * SE24, 84.0 * SE24)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.8" font-weight="700" fill="#92400e" transform="rotate(-90 {:.1f} {:.1f})">{}</text>'.format(
            lx24(70.0), ly24(42.0), lx24(70.0), ly24(42.0), esc(tr(lang, "MURPHY 8-1/4\" CLEAR", "PUERTA MURPHY 8-1/4\"")))
        # 1x 20A Duplex Outlet @ 38" AFF in clear front zone (d = 46" from North)
        + '<rect x="{:.1f}" y="{:.1f}" width="8" height="10" fill="#fef08a" stroke="#713f12" stroke-width="1.8"/>'.format(lx24(46.0) - 4, ly24(38.0) - 5)
        + svg_callout(600, 295, lx24(46.0), ly24(38.0), tr(lang, "1 Duplex @ 38\" AFF", "1 Toma Doble 38\" AFF"), "#14 · 12/2", "w12", max_x=840)
        + '</svg>'
    )

    e24 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-24", tr(lang, "Segment C: Laundry (#14) + Bedroom & Hall (#11/#12)", "Segmento C: Lavandería (#14) + Recámara y Pasillo (#11/#12)"))
        + legend_bar(lang)
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 Plan & Laundry East Wall Elevation — 1 Duplex @ 38\" AFF (+t) Clears 8-1/4\" Murphy Door + Reused #11 Gauge Check", "Plano 1:1 y Elevación Muro Este Lavandería — 1 Toma Doble a 38\" AFF (+t) Libra Puerta Murphy 8-1/4\" + Calibre #11")) + '</div>' + s24 + '</div>'
        + '<div class="note-blue">' + esc(tr(lang, "1) Laundry (#14 · 20A 12/2): 1 standard 20A TR duplex on East wall @ 38\" AFF (+t; confirm center vs. top/bottom mark) takes both 120V cords of LG WKG101HVA (10A steam washer + gas dryer ~15–16A combined; keep BRN120DF reset accessible at Panel, NEVER put Laundry Light on #14). 2) Bedroom & Hall (#11): Bed 1–5 use 11-1/2\" AFF dark horizontal plates; step #11 down to 15A AFCI if ANY reused wire leg is 14 AWG. 3) Keep NW Bedroom Temp Closet ceiling open until LV switch wire reaches attic & Door 4 hatch finishes.",
                                             "1) Lavandería (#14 · 20A 12/2): 1 toma doble 20A TR en muro Este a 38\" AFF (+t; confirmar centro vs. borde) recibe ambos cables 120V del LG WKG101HVA (reset GFCI accesible en Panel; NUNCA conectar Luz Lavandería en #14). 2) Recámara y Pasillo (#11): Rec 1–5 usan placas horizontales oscuras a 11-1/2\" AFF; bajar #11 a 15A AFCI si ALGÚN tramo reusado es 14 AWG. 3) Dejar abierto el techo del Clóset Temporal hasta pasar cable BV y terminar escotilla Puerta 4.")) + '</div>'
        + footer_html(lang, mod_short, "E-24") + '</div>'
    )

    # --- Sheet E-25: Segment D — Attic Overlay over Full 1:1 Unit Walls (S25 = 1.12 px/in) ---
    S25 = 1.12
    def dx(x): return 105.0 + x * S25
    def dy(y): return 28.0 + y * S25
    def dpoly(pts): return " ".join(["{:.1f},{:.1f}".format(dx(x), dy(y)) for x, y in pts])

    s25 = (
        '<svg viewBox="0 0 840 390" width="100%" data-equal-scale="1.12">'
        + svg_compass(795, 36, lang)
        + svg_scale_bar(16, 364, S25, 60, lang)
        # Underlying Full Unit Room Walls for Smoke/CO Clearance Reference!
        + '<polygon points="' + dpoly([(66,34),(147,34),(147,108),(66,108)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'
        + '<polygon points="' + dpoly([(31.5,108),(147,108),(147,234.25),(0,234.25),(0,174.25),(31.5,174.25)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'
        + '<polygon points="' + dpoly([(147,142),(293.7,142),(293.7,297.75),(147,297.75)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'
        + '<polygon points="' + dpoly([(293.7,142),(473.5,142),(508,178),(508,258),(473.5,297.75),(293.7,297.75)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'
        + '<polygon points="' + dpoly([(147,58),(207,58),(207,88),(352,88),(352,142),(147,142)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'
        + '<polygon points="' + dpoly([(207,0),(279.1,0),(279.1,88),(207,88)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'
        + '<polygon points="' + dpoly([(279.1,5.4),(315.4,5.4),(315.4,88),(279.1,88)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'
        + '<polygon points="' + dpoly([(315.4,0),(437.5,0),(474,34),(474,96),(437.5,136),(352,136),(352,88),(315.4,88)]) + '" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.4"/>'

        # Door 4 Hatch (24"x36" @ 112,74) + True 72" Edge-Offset Guard-Strip Zone (X=28..196, Y=0..164)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>'.format(dx(28), dy(2), 168 * S25, 162 * S25)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.0" font-weight="800" fill="#991b1b">{}</text>'.format(dx(112), dy(18), esc(tr(lang, "72\" HATCH GUARD ZONE", "ZONA LISTONES 72\"")))
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#e0f2fe" stroke="#0369a1" stroke-width="2"/>'.format(dx(100), dy(56), 24 * S25, 36 * S25)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="7.8" font-weight="800" fill="#0c4a6e">24×36</text>'.format(dx(112), dy(77))

        # 24" OSB Walkway (15.8 ft <= 20 ft) + 30"x30" Platform + F1 Furnace (174, 258)
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#a855f7" stroke-width="{:.1f}" opacity="0.28"/>'.format(dx(124), dy(74), dx(174), dy(74), dx(174), dy(213.5), 24 * S25)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>'.format(dx(159), dy(213.5), 30 * S25, 30 * S25)
        + '<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="{:.1f}" fill="#1e293b" stroke="#0f172a"/>'.format(dx(159), dy(243.5), 30 * S25, 29 * S25)
        + '<text x="{:.1f}" y="{:.1f}" text-anchor="middle" font-size="8.2" font-weight="800" fill="#ffffff">F1</text>'.format(dx(174), dy(261))

        # All 4 Flagged Attic J-Boxes (#10, #11, #12, #13) + Panel Riser
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="12" fill="#dc2626"/>'.format(dx(147) - 6, dy(213.75) - 6)
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="12" fill="#fef08a" stroke="#713f12" stroke-width="1.8"/>'.format(dx(255) - 6, dy(202) - 6)  # JB #10
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="12" fill="#fef08a" stroke="#713f12" stroke-width="1.8"/>'.format(dx(395) - 6, dy(64) - 6)   # JB #11
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="12" fill="#ffffff" stroke="#334155" stroke-width="1.8"/>'.format(dx(252) - 6, dy(115) - 6)  # JB #12
        + '<rect x="{:.1f}" y="{:.1f}" width="12" height="12" fill="#fef08a" stroke="#16a34a" stroke-width="1.8"/>'.format(dx(243) - 6, dy(68) - 6)   # JB #13

        # #15 Furnace (14/2) & #16 Unswitched Smoke/CO (14/2 in -> 14/3 Red loop) + LINE-only GFCI Attic Outlet
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#0f172a" stroke-width="2.4"/>'.format(dx(147), dy(213.75), dx(159), dy(258))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#334155" stroke-width="2.0"/>'.format(dx(147), dy(213.75), dx(147), dy(92), dx(112), dy(92))
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#334155" stroke-width="2.0"/>'.format(dx(147), dy(213.75), dx(295), dy(115))  # 14/2 unswitched feed to Hall Smoke/CO
        + '<polyline points="{:.1f},{:.1f} {:.1f},{:.1f} {:.1f},{:.1f}" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-dasharray="5,2"/>'.format(dx(295), dy(115), dx(395), dy(82), dx(395), dy(215))  # 14/3 Red interconnect!
        # Smoke/CO Nodes (>=36" from Bath door at X=239..265, Y=88 & >=20 ft from Range at X=31.5, Y=141!)
        + '<circle cx="{:.1f}" cy="{:.1f}" r="7" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>'.format(dx(295), dy(115))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="7" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>'.format(dx(395), dy(82))
        + '<circle cx="{:.1f}" cy="{:.1f}" r="7" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>'.format(dx(395), dy(215))

        # Non-overlapping Perimeter Callouts
        + svg_callout(8, 86, dx(112), dy(92), tr(lang, "Hatch Sw (Opt A/B)", "Apag. Escotilla"), "#16 · 14/2", "w14", max_x=840)
        + svg_callout(8, 195, dx(147), dy(214), tr(lang, "Panel Top Riser", "Subida Panel"), tr(lang, "Max 2/hole", "Máx 2/hoyo"), "w143", max_x=840)
        + svg_callout(8, 265, dx(159), dy(228), tr(lang, "Attic GFCI (LINE)", "GFCI Ático (LINE)"), "#16 · 14/2", "w14", max_x=840)
        + svg_callout(8, 315, dx(159), dy(258), tr(lang, "Furnace + Disconn.", "Calefactor + Desc."), "#15 · 14/2", "w14", max_x=840)
        + svg_callout(290, 8, dx(243), dy(68), tr(lang, "4 Flagged J-Boxes", "4 Cajas Ático"), "#10–#13", "w12", max_x=840)
        + svg_callout(520, 8, dx(295), dy(115), tr(lang, "Hall Smoke/CO", "Humo/CO Pasillo"), "#16 · 14/2->14/3", "w143", max_x=840)
        + svg_callout(662, 105, dx(395), dy(82), tr(lang, "Bed Smoke", "Humo Rec."), "#16 · 14/3", "w143", max_x=840)
        + svg_callout(662, 225, dx(395), dy(215), tr(lang, "Living Smoke/CO", "Humo/CO Sala"), "#16 · 14/3", "w143", max_x=840)
        + '</svg>'
    )

    e25 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-25", tr(lang, "Segment D: Attic Furnace (#15) & Service/Smoke/CO (#16)", "Segmento D: Calefactor (#15) y Servicio/Humo/CO (#16)"))
        + legend_bar(lang)
        + '<div class="svg-wrap"><div class="svg-cap">' + esc(tr(lang, "1:1 Attic Overlay — 24\" Walkway (15.8 ft <= 20 ft), 72\" Guard Zone, 4 J-Boxes & Smoke/CO Clearances", "Superposición 1:1 de Ático — Pasillo 24\" (15.8 pies <= 20 pies), Zona 72\", 4 Cajas y Despejes Humo/CO")) + '</div>' + s25 + '</div>'
        + '<div class="note-red"><strong>' + esc(tr(lang, "CRITICAL LIFE-SAFETY & ATTIC RULES (#15 & #16):", "REGLAS CRÍTICAS DE SEGURIDAD Y ÁTICO (#15 Y #16):")) + '</strong> '
        + esc(tr(lang, "1) #16 Breaker MUST be 15A AFCI-ONLY (Eaton BRN115AF — NEVER a GFCI breaker, CRC R314.6): split unswitched 14/2 ahead of Hatch Switch to Hall Smoke/CO -> 14/3 Red interconnect to Bedroom & Living alarms (10-yr battery backup; keep >=36\" from Bath door & HVAC supply registers and >=10–20 ft from Viking gas range); wire local Attic GFCI Outlet (<=25 ft from F1) LINE-only with LOAD taped off! 2) Protect NM-B within 72\" of Door 4 hatch edge with guard strips (NEC 320.23(A)); NEVER screw into flat roof deck (mount 2 enclosed LEDs on 2×4 rafter blocking >=1-1/2\" below deck); max 2 cables/top-plate hole + fire caulk; flag all 4 J-Boxes (#10–#13) above insulation.",
                 "1) El interruptor #16 DEBE ser 15A SOLO-AFCI (Eaton BRN115AF — ¡NUNCA interruptor GFCI!, CRC R314.6): derivar 14/2 directo sin apagador hacia Humo/CO Pasillo -> 14/3 Rojo a Recámara y Sala (respaldo 10 años; >=36\" de puerta de Baño y rejillas HVAC, y >=10–20 pies de estufa Viking); conectar Toma GFCI en Ático (<=25 pies de F1) SOLO en LINE (tapar LOAD). 2) Proteger NM-B con listones dentro de 72\" del borde de escotilla Puerta 4; CERO tornillos al techo plano (montar 2 LEDs en bloqueo 2×4 >=1-1/2\" bajo cubierta); máx. 2 cables/hoyo + sellador cortafuego; abanderar las 4 Cajas (#10–#13)."))
        + '</div>' + footer_html(lang, mod_short, "E-25") + '</div>'
    )
    # --- Sheet E-26: Complete Non-Kitchen Room-by-Room Box, Switch & Light Schedule (Rev R6) ---
    urows = [
        ("Dining 1–4", "Comedor 1–4", "Dining N & S Walls (D01–D03)", "Comedor Muros N y S (D01–D03)", "18\" AFF (in frames)", "18\" AFF (en marcos)",
         "#10 · Shared (Reuse+New)", "#10 · Compartido (Reuso+Nvo)", "12/2*", "12/2*", "w12",
         "NO D5 on Panel wall (D04); NO D6 in ~33\" pocket; verify reused vs. new legs w/ C-10",
         "SIN D5 en muro Panel (D04); SIN D6 en bolsillo ~33\"; verificar reuso vs. nuevo con C-10"),
        ("Living 1–5", "Sala 1–5", "L01 (17.5/106.5\"), Fireplace, Bay", "L01 (17.5/106.5\"), Chimenea, Bahía", "18\" AFF (in frames)", "18\" AFF (en marcos)",
         "#10 · Shared (Reuse+New)", "#10 · Compartido (Reuso+Nvo)", "12/2*", "12/2*", "w12",
         "NO L6 in ~33\" pocket; pre-existing sound wiring reused in part (15A AFCI if 14 AWG!)",
         "SIN L6 en bolsillo ~33\"; cableado existente sano reusado en parte (15A AFCI si 14 AWG)"),
        ("Hall 1", "Pasillo 1", "Hall N solid pier (Bath/Murphy)", "Pasillo N pilar sólido (Baño/Murphy)", "18\" AFF (+t)", "18\" AFF (+t)",
         "#10 · Shared (Reuse+New)", "#10 · Compartido (Reuso+Nvo)", "12/2*", "12/2*", "w12",
         "Keep clear of Bath 28\" outward-swing door & Murphy bookcase swing",
         "Librar puerta abatible 28\" del Baño y abatimiento de puerta Murphy"),
        ("Bed 1–5", "Recámara 1–5", "Wall A (17\"/107\"), C (60.5\"), Desk, Bay", "Muro A (17\"/107\"), C (60.5\"), Esc., Bahía", "11-1/2\" AFF horiz.", "11-1/2\" AFF horiz.",
         "#10 · Shared (#11 Spare)", "#10 · Compartido (#11 Res.)", "12/2*", "12/2*", "w12",
         "Dark horizontal plates @ 11-1/2\" AFF via Bed/Hall J-Box (split-ready to Spare #11)",
         "Placas horizontales oscuras a 11-1/2\" AFF vía Caja Rec/Pas (lista para Reserva #11)"),
        ("Common Lights & Sw", "Luces y Apag. Comunes", "Living, Dining, Bed, 2x Hall 3-Way, Laun", "Sala, Com., Rec., 2x Pasillo 3-Vías, Lav.", "48\" AFF / Ceiling", "48\" AFF / Techo",
         "#12 · Room Lights", "#12 · Luces Cuartos", "14/2 + 14/3", "14/2 + 14/3", "w143",
         "Reuse sound + new via Lights J-Box; 14/3 Red travelers for 2x Hall 3-Way; NEVER put Laun light on #14",
         "Reuso sano + nuevo vía Caja Luces; 14/3 Rojo viajeras 3-vías; NUNCA Luz Lavandería en #14"),
        ("Bath Vanity, WC, Lts/Fan", "Baño Lavabo, WC, Luz/Ext.", "72-1/8\"x82-1/8\" · 28\" Out-Swing Door", "72-1/8\"x82-1/8\" · Puerta 28\" Afuera", "40–44\" / 12\" / 48\"", "40–44\" / 12\" / 48\"",
         "#13 · Bath All-in-One", "#13 · Baño Todo-en-Uno", "100% 12/2", "100% 12/2", "w12",
         "Pocket door RETIRED -> South stud switches OK; SEPARATE 12/2 Toilet drop before tile (split-ready #19)",
         "Corrediza RETIRADA -> apagadores en muro Sur OK; bajada 12/2 SEPARADA a WC antes de azulejo (#19)"),
        ("Laundry WashTower", "Lavandería WashTower", "Laundry East/Right Wall (clear Murphy)", "Lavandería Muro Este (libra Murphy)", "38\" AFF (+t)", "38\" AFF (+t)",
         "#14 · Laundry 20A DF", "#14 · Lavandería 20A DF", "12/2", "12/2", "w12",
         "1x 20A TR duplex for both 120V LG WKG101HVA plugs; GFCI reset accessible at Panel",
         "1 toma doble 20A TR para ambos enchufes 120V LG WKG101HVA; reset GFCI accesible en Panel"),
        ("Attic Furnace F1", "Calefactor Ático F1", "Attic Platform (174\", 258\") + Disconn.", "Plataforma Ático (174\", 258\") + Desc.", "At Platform", "En Plataforma",
         "#15 · Attic Furnace", "#15 · Calefactor Ático", "14/2", "14/2", "w14",
         "Dedicated 15A standard breaker (BR115) + local disconnect switch at furnace",
         "Interruptor dedicado 15A estándar (BR115) + desconectador local junto al calefactor"),
        ("Attic Service & Smoke/CO", "Servicio Ático y Humo/CO", "Door 4 Hatch, <=25 ft F1, Hall/Bed/Liv", "Escotilla P4, <=25 ft F1, Pas/Rec/Sala", "Ceiling / Rafter Blk", "Techo / Bloqueo",
         "#16 · 15A AFCI-ONLY", "#16 · 15A SOLO-AFCI", "14/2 + 14/3", "14/2 + 14/3", "w143",
         "BRN115AF (NO GFCI breaker!); LINE-only GFCI outlet; 2x LEDs on 2x4 blocking >=1.5\" below deck; 72\" guards",
         "BRN115AF (¡SIN GFCI!); Toma GFCI solo LINE; 2 LEDs en bloqueo 2x4 >=1.5\" bajo techo; listones 72\""),
    ]
    ut = (
        "<table class='ptbl-compact'><tr><th>" + esc(tr(lang, "Physical Box / Group (Mapping 1)", "Caja / Grupo Físico (Mapeo 1)")) + "</th>"
        "<th>" + esc(tr(lang, "Room & Wall Location", "Cuarto y Ubicación")) + "</th><th>" + esc(tr(lang, "Height (AFF +t)", "Altura (AFF +t)")) + "</th>"
        "<th>" + esc(tr(lang, "Assigned Circuit (Mapping 2)", "Circuito Asignado (Mapeo 2)")) + "</th>"
        "<th>" + esc(tr(lang, "Cable", "Cable")) + "</th><th>" + esc(tr(lang, "Field Rules & Verification Notes", "Reglas en Obra y Verificación")) + "</th></tr>"
    )
    for ben, bes, sen, ses, hen, hes, cen, ces, cab_en, cab_es, wc, nen, nes in urows:
        ut += (
            "<tr><td><span class='bx'>" + esc(tr(lang, ben, bes)) + "</span></td>"
            "<td>" + esc(tr(lang, sen, ses)) + "</td><td><strong>" + esc(tr(lang, hen, hes)) + "</strong></td>"
            "<td><strong>" + esc(tr(lang, cen, ces)) + "</strong></td>"
            "<td><span class='" + wc + "'>" + esc(tr(lang, cab_en, cab_es)) + "</span></td>"
            "<td>" + esc(tr(lang, nen, nes)) + "</td></tr>"
        )
    ut += "</table>"

    e26 = (
        '<div class="sheet slide">'
        + header_html(lang, mod_title, "E-26", tr(lang, "Whole-Unit Non-Kitchen Room-by-Room Schedule (#10–#16)", "Tabla Completa Cuarto por Cuarto Fuera de Cocina (#10–#16)"))
        + legend_bar(lang)
        + '<div class="box"><h3>' + esc(tr(lang, "Complete Non-Kitchen Box, Switch & Light Schedule (15 Active Circuits + 5 Open Spares: #11, #17–#20)", "Tabla Completa de Cajas, Apagadores y Luces Fuera de Cocina (15 Activos + 5 Reservas: #11, #17–#20)")) + '</h3>' + ut + '</div>'
        + '<div class="note-blue">' + esc(tr(lang, "Site Verification Note (Rev R6 · 2026-11-25): Dining Room stays named Dining Room normally. Living, Dining, Bedroom & Hall outlets share #10 (Reuse + New) so #11 stays free as a 5th open spare alongside #17–#20. Confirm which existing Living/Dining/Bedroom legs are sound and verify wire gauge (12 AWG vs 14 AWG) on site with the C-10 electrician before energizing.",
                                             "Nota de Verificación en Obra (Rev R6 · 2026-11-25): El Comedor conserva su nombre normal. Contactos de Sala, Comedor, Recámara y Pasillo comparten #10 (Reuso + Nuevo) dejando #11 libre como 5ª reserva junto a #17–#20. Confirmar en obra con el electricista C-10 qué tramos existentes se reusan y verificar calibre (12 AWG vs 14 AWG) antes de energizar.")) + '</div>'
        + footer_html(lang, mod_short, "E-26") + '</div>'
    )
    return build_e00(lang, 2) + e21 + e22 + e23 + e24 + e25 + e26


TOPBAR_UI = {
    "en": {
        "back": "← Unit 4 Wiki (Electrical)",
        "m1_to_m2": "Switch to Module 2: Whole Unit →",
        "m2_to_m1": "← Switch to Module 1: Kitchen",
        "pdf": "Download Landscape PDF",
        "lang_aria": "Language",
        "theme_aria": "Toggle theme",
        "pdf_suffix": "EN",
    },
    "es": {
        "back": "← Wiki Unidad 4 (Electricidad)",
        "m1_to_m2": "Cambiar a Módulo 2: Toda la Unidad →",
        "m2_to_m1": "← Cambiar a Módulo 1: Cocina",
        "pdf": "Descargar PDF Horizontal",
        "lang_aria": "Idioma",
        "theme_aria": "Cambiar tema",
        "pdf_suffix": "ES",
    },
    "ru": {
        "back": "← Вики Кв. 4 (Электрика)",
        "m1_to_m2": "Модуль 2: Вся квартира →",
        "m2_to_m1": "← Модуль 1: Кухня",
        "pdf": "Скачать PDF (альбомный RU)",
        "lang_aria": "Язык",
        "theme_aria": "Переключить тему",
        "pdf_suffix": "RU",
    },
}


def build_topbar_html(lang_code, mod_num):
    lc = lang_code.lower()
    ui = TOPBAR_UI[lc]
    LC_UP = lc.upper()
    if mod_num == 1:
        cur_stem = "2026-11-23_U4_Module1_Kitchen-Electrical_R5_"
        other_stem = "2026-11-23_U4_Module2_Whole-Unit-Segments_R5_"
        other_lbl = ui["m1_to_m2"]
    else:
        cur_stem = "2026-11-23_U4_Module2_Whole-Unit-Segments_R5_"
        other_stem = "2026-11-23_U4_Module1_Kitchen-Electrical_R5_"
        other_lbl = ui["m2_to_m1"]

    lang_links = ""
    for opt in ("en", "es", "ru"):
        opt_up = opt.upper()
        cls = "u4-seg-opt is-active" if opt == lc else "u4-seg-opt"
        cur_attr = ' aria-current="page"' if opt == lc else ""
        lang_links += (
            '<a class="' + cls + '" data-lang-link="' + opt + '" href="'
            + cur_stem + opt_up + '.html"' + cur_attr + '>' + opt_up + '</a>'
        )

    sun_svg = (
        '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" '
        'stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="3"/>'
        '<path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"/></svg>'
    )
    moon_svg = (
        '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" '
        'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        '<path d="M13.2 9.9A5.4 5.4 0 0 1 6.1 2.8a5.5 5.5 0 1 0 7.1 7.1Z"/></svg>'
    )
    script = (
        '<script>(function(){try{var d=document.documentElement,b=document.getElementById("u4ThemeBtn");'
        'try{localStorage.setItem("u4_lang","' + lc + '");}catch(e){}'
        'var sp=new URLSearchParams(window.location.search);var qt=sp.get("theme");'
        'var cur=(qt==="dark"||qt==="light")?qt:(localStorage.getItem("u4_theme")||(window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"));'
        'function syncLinks(th){var bk=document.getElementById("u4BackWikiLink"),om=document.getElementById("u4OtherModLink");'
        'if(bk)bk.href="../index.html?lang=' + lc + '&theme="+th+"#electrical";'
        'if(om)om.href="' + other_stem + LC_UP + '.html?theme="+th;'
        'document.querySelectorAll("[data-lang-link]").forEach(function(a){var l=a.getAttribute("data-lang-link").toUpperCase();a.href="' + cur_stem + '"+l+".html?theme="+th;});}'
        'function ap(v){var t=v==="dark"?"dark":"light";d.setAttribute("data-theme",t);d.classList.toggle("dark",t==="dark");'
        'if(b)b.setAttribute("aria-checked",t==="dark"?"true":"false");try{localStorage.setItem("u4_theme",t);}catch(e){}syncLinks(t);}ap(cur);'
        'if(b)b.addEventListener("click",function(){ap(d.getAttribute("data-theme")==="dark"?"light":"dark");});'
        'window.addEventListener("storage",function(ev){if(ev&&ev.key==="u4_theme"&&(ev.newValue==="dark"||ev.newValue==="light"))ap(ev.newValue);});}catch(e){}})();</script>'
    )
    return (
        '<div class="u4-doc-topbar"><div class="u4-doc-topbar-left">'
        + '<a class="u4-doc-navbtn" id="u4BackWikiLink" href="../index.html?lang=' + lc + '#electrical">' + esc(ui["back"]) + '</a>'
        + '<a class="u4-doc-navbtn" id="u4OtherModLink" href="' + other_stem + LC_UP + '.html">' + esc(other_lbl) + '</a>'
        + '<a class="u4-doc-navbtn is-primary" id="u4PdfDownloadLink" href="../wiki-pdfs/' + cur_stem + ui["pdf_suffix"] + '.pdf" target="_blank" rel="noopener">' + esc(ui["pdf"]) + '</a>'
        + '</div><div class="u4-doc-topbar-right">'
        + '<div class="u4-lang-seg" id="u4LangSwitch" role="navigation" aria-label="' + esc(ui["lang_aria"]) + '" data-lang="' + lc + '">'
        + '<span class="u4-seg-thumb" aria-hidden="true"></span>' + lang_links + '</div>'
        + '<button type="button" class="u4-seg-switch" id="u4ThemeBtn" role="switch" aria-checked="false" aria-label="' + esc(ui["theme_aria"]) + '">'
        + '<span class="u4-seg-thumb" aria-hidden="true"></span>'
        + '<span class="u4-seg-opt is-a">' + sun_svg + '</span>'
        + '<span class="u4-seg-opt is-b">' + moon_svg + '</span></button>'
        + '</div></div>' + script
    )


TOPBAR_UI = {
    "en": {
        "back": "← Unit 4 Wiki (Electrical)",
        "m1_to_m2": "Switch to Module 2: Whole Unit →",
        "m2_to_m1": "← Switch to Module 1: Kitchen",
        "pdf": "Download Landscape PDF",
        "lang_aria": "Language",
        "theme_aria": "Toggle theme",
        "pdf_suffix": "EN",
    },
    "es": {
        "back": "← Wiki Unidad 4 (Electricidad)",
        "m1_to_m2": "Cambiar a Módulo 2: Toda la Unidad →",
        "m2_to_m1": "← Cambiar a Módulo 1: Cocina",
        "pdf": "Descargar PDF Horizontal",
        "lang_aria": "Idioma",
        "theme_aria": "Cambiar tema",
        "pdf_suffix": "ES",
    },
    "ru": {
        "back": "← Вики Кв. 4 (Электрика)",
        "m1_to_m2": "Модуль 2: Вся квартира →",
        "m2_to_m1": "← Модуль 1: Кухня",
        "pdf": "Скачать PDF (альбомный RU)",
        "lang_aria": "Язык",
        "theme_aria": "Переключить тему",
        "pdf_suffix": "RU",
    },
}


def build_topbar_html(lang_code, mod_num):
    lc = lang_code.lower()
    ui = TOPBAR_UI[lc]
    LC_UP = lc.upper()
    if mod_num == 1:
        cur_stem = "2026-11-23_U4_Module1_Kitchen-Electrical_R5_"
        other_stem = "2026-11-23_U4_Module2_Whole-Unit-Segments_R5_"
        other_lbl = ui["m1_to_m2"]
    else:
        cur_stem = "2026-11-23_U4_Module2_Whole-Unit-Segments_R5_"
        other_stem = "2026-11-23_U4_Module1_Kitchen-Electrical_R5_"
        other_lbl = ui["m2_to_m1"]

    lang_links = ""
    for opt in ("en", "es", "ru"):
        opt_up = opt.upper()
        cls = "u4-seg-opt is-active" if opt == lc else "u4-seg-opt"
        cur_attr = ' aria-current="page"' if opt == lc else ""
        lang_links += (
            '<a class="' + cls + '" data-lang-link="' + opt + '" href="'
            + cur_stem + opt_up + '.html"' + cur_attr + '>' + opt_up + '</a>'
        )

    sun_svg = (
        '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" '
        'stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="3"/>'
        '<path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"/></svg>'
    )
    moon_svg = (
        '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" '
        'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        '<path d="M13.2 9.9A5.4 5.4 0 0 1 6.1 2.8a5.5 5.5 0 1 0 7.1 7.1Z"/></svg>'
    )
    script = (
        '<script>(function(){try{var d=document.documentElement,b=document.getElementById("u4ThemeBtn");'
        'try{localStorage.setItem("u4_lang","' + lc + '");}catch(e){}'
        'var sp=new URLSearchParams(window.location.search);var qt=sp.get("theme");'
        'var cur=(qt==="dark"||qt==="light")?qt:(localStorage.getItem("u4_theme")||(window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"));'
        'function syncLinks(th){var bk=document.getElementById("u4BackWikiLink"),om=document.getElementById("u4OtherModLink");'
        'if(bk)bk.href="../index.html?lang=' + lc + '&theme="+th+"#electrical";'
        'if(om)om.href="' + other_stem + LC_UP + '.html?theme="+th;'
        'document.querySelectorAll("[data-lang-link]").forEach(function(a){var l=a.getAttribute("data-lang-link").toUpperCase();a.href="' + cur_stem + '"+l+".html?theme="+th;});}'
        'function ap(v){var t=v==="dark"?"dark":"light";d.setAttribute("data-theme",t);d.classList.toggle("dark",t==="dark");'
        'if(b)b.setAttribute("aria-checked",t==="dark"?"true":"false");try{localStorage.setItem("u4_theme",t);}catch(e){}syncLinks(t);}ap(cur);'
        'if(b)b.addEventListener("click",function(){ap(d.getAttribute("data-theme")==="dark"?"light":"dark");});'
        'window.addEventListener("storage",function(ev){if(ev&&ev.key==="u4_theme"&&(ev.newValue==="dark"||ev.newValue==="light"))ap(ev.newValue);});}catch(e){}})();</script>'
    )
    return (
        '<div class="u4-doc-topbar"><div class="u4-doc-topbar-left">'
        + '<a class="u4-doc-navbtn" id="u4BackWikiLink" href="../index.html?lang=' + lc + '#electrical">' + esc(ui["back"]) + '</a>'
        + '<a class="u4-doc-navbtn" id="u4OtherModLink" href="' + other_stem + LC_UP + '.html">' + esc(other_lbl) + '</a>'
        + '<a class="u4-doc-navbtn is-primary" id="u4PdfDownloadLink" href="../wiki-pdfs/' + cur_stem + ui["pdf_suffix"] + '.pdf" target="_blank" rel="noopener">' + esc(ui["pdf"]) + '</a>'
        + '</div><div class="u4-doc-topbar-right">'
        + '<div class="u4-lang-seg" id="u4LangSwitch" role="navigation" aria-label="' + esc(ui["lang_aria"]) + '" data-lang="' + lc + '">'
        + '<span class="u4-seg-thumb" aria-hidden="true"></span>' + lang_links + '</div>'
        + '<button type="button" class="u4-seg-switch" id="u4ThemeBtn" role="switch" aria-checked="false" aria-label="' + esc(ui["theme_aria"]) + '">'
        + '<span class="u4-seg-thumb" aria-hidden="true"></span>'
        + '<span class="u4-seg-opt is-a">' + sun_svg + '</span>'
        + '<span class="u4-seg-opt is-b">' + moon_svg + '</span></button>'
        + '</div></div>' + script
    )


def find_chrome():
    for c in CHROME_PATHS:
        if os.path.exists(c):
            return c
    return None


def write_and_render(out_dir, base_name, title, body_html, lang_code, mod_num=1, html_only=False):
    out_dir = os.path.abspath(out_dir)
    os.makedirs(out_dir, exist_ok=True)
    html_path = os.path.join(out_dir, base_name + ".html")
    pdf_path = os.path.join(out_dir, base_name + ".pdf")
    topbar_html = build_topbar_html(lang_code, mod_num)
    full_body = topbar_html + body_html
    for bad in ["$", "1SPCSXyofn6o8HRDL" + "4doY4w71ja4UGhhC", "Tailnet Live", "measure_boundary"]:
        if bad in full_body:
            raise RuntimeError("Forbidden token in blueprint: " + bad)
    doc = (
        "<!DOCTYPE html><html lang='" + lang_code + "'><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'><title>"
        + esc(title) + "</title>"
        "<link rel='icon' type='image/png' href='../wiki-images/favicon-32.png'>"
        "<style>" + CSS + "</style></head><body data-page-fill='natural'>" + full_body + "</body></html>"
    )
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(doc)
    print("Wrote " + html_path + " (" + str(len(doc)) + " bytes)")
    if not html_only:
        chrome = find_chrome()
        if chrome:
            subprocess.run([
                chrome, "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
                "--no-pdf-header-footer", "--print-to-pdf=" + pdf_path, "file://" + html_path
            ], check=True, timeout=30)
            print("Rendered PDF: " + pdf_path + " (" + str(os.path.getsize(pdf_path)) + " bytes)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", default=DEFAULT_OUT_DIR)
    ap.add_argument("--html-only", action="store_true")
    args = ap.parse_args()
    write_and_render(args.out_dir, "2026-11-23_U4_Module1_Kitchen-Electrical_R5_EN", "Unit 4 Electrical R6 — Module 1: Kitchen (EN)", build_module1("EN"), "en", 1, args.html_only)
    write_and_render(args.out_dir, "2026-11-23_U4_Module1_Kitchen-Electrical_R5_ES", "Unidad 4 Electricidad R6 — Módulo 1: Cocina (ES)", build_module1("ES"), "es", 1, args.html_only)
    write_and_render(args.out_dir, "2026-11-23_U4_Module2_Whole-Unit-Segments_R5_EN", "Unit 4 Electrical R6 — Module 2: Whole-Unit Segments (EN)", build_module2("EN"), "en", 2, args.html_only)
    write_and_render(args.out_dir, "2026-11-23_U4_Module2_Whole-Unit-Segments_R5_ES", "Unidad 4 Electricidad R6 — Módulo 2: Segmentos Unidad (ES)", build_module2("ES"), "es", 2, args.html_only)
    reset_tr_ru_stats()
    m1_ru = build_module1("RU")
    m2_ru = build_module2("RU")
    assert_tr_ru_complete()
    print("Verified RU_MAP 100% runtime coverage (" + str(TR_RU_STATS["calls"]) + " tr calls, 0 missing)")
    write_and_render(args.out_dir, "2026-11-23_U4_Module1_Kitchen-Electrical_R5_RU", "Квартира 4 Электрика R6 — Модуль 1: Кухня (RU)", m1_ru, "ru", 1, args.html_only)
    write_and_render(args.out_dir, "2026-11-23_U4_Module2_Whole-Unit-Segments_R5_RU", "Квартира 4 Электрика R6 — Модуль 2: Вся квартира (RU)", m2_ru, "ru", 2, args.html_only)


if __name__ == "__main__":
    main()
