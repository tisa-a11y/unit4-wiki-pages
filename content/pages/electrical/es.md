# Electricidad

## Concepto
Nuevo **Panel** Eaton de 20 espacios (`BRP20L125G`) en el muro compartido Cocina / Comedor, abriendo hacia el Este (Comedor). Todas las hojas separan los nombres físicos fijos de las cajas y los números de circuito (`#1`–`#20`) para poder dividir circuitos en el futuro sin renombrar ninguna caja ni apagador.

## Planos Oficiales de Trabajo (Rev R8) y Plano Interactivo
- **Referencia Interactiva de Toda la Unidad:** Abrir el [Plano Interactivo Eléctrico Completo](./plans/kitchen-electrical/index.html?lang=es) o la [Hoja de Corriente de Campana y Fotos](#doc:2026-11-20_U4_kitchen_zephyr-savona-mock-hookup_04-hood-electrical_R2_ES).
- **Módulo 1 — Hojas Eléctricas de Cocina (`E-00A` a `E-14`, 6 Hojas Horizontales):** [Ver PDF en la Wiki](#doc:1ZTNM8SjfP-j6CP1y7fG6bN1aN3ua0Tpx) · [Abrir Hojas Web (Rev R8)](./wiki-docs/2026-11-23_U4_Module1_Kitchen-Electrical_R5_ES.html) — Directorio de 20 espacios (`14 Circuitos Nuevos + 6 Reservas`), planta `1:1` de Cocina (muro Oeste en escalón `66-1/4"` + esquina diagonal SE `36"×36"` + lavavajillas `24"` frente terminado), las cuatro elevaciones `1:1` con doble referencia de subpiso (`+t`) y lista pre-tablaroca.
- **Módulo 2 — Segmentos Eléctricos de Toda la Unidad (`E-00A` a `E-26`, 8 Hojas Horizontales):** [Ver PDF en la Wiki](#doc:1FO9ANRX9COVSgNkN15_ibeJdoGa35pqK) · [Abrir Hojas Web (Rev R8)](./wiki-docs/2026-11-23_U4_Module2_Whole-Unit-Segments_R5_ES.html) — Mapa clave `1:1`, Sala y Comedor (`E-22`), Baño Todo-en-Uno (`E-23`), Lavandería + Recámara y Pasillo (`E-24`), Calefactor y Humo/CO en Ático (`E-25`) y tabla completa cuarto por cuarto (`E-26`).

## Resumen del Panel (`#1`–`#20`) y Circuitos por Cuarto — 14 Circuitos Nuevos + 6 Reservas
- **Panel y Espacio Libre:** Eaton `BRP20L125G` (`125A`, 20 espacios; llamado `D04` en hojas anteriores) en `X = 147"`, `Y = 213.75"`, abriendo al Este hacia el Comedor. Mantener `30" ancho × 36" fondo × 78" alto` libres frente al `Panel`, **cero contactos en el muro del Panel** en Comedor, y **cero tornillos o entradas traseras** en la franja `13"–27-1/2"` N, `53"–77"` AFF del lado de Cocina.
- **Cocina (`#1`–`#9`, Romex Nuevo):**
  - `#1` **Encimera Este Cocina** (`20A · 12/2` → `Este 1 @ 10"`, `Este 2 @ 45"`), `#2` **Encimera Sur Cocina** (`20A · 12/2` → `Sur 1 @ 24"`, `Sur 2 @ 62"*`), `#3` **Encimera Oeste Cocina** (`20A · 12/2` → `Oeste 1 @ 9"`, `Oeste 2 @ 57"` N del escalón, aros `~1"` para azulejo; tablaroca `1/2"` + HardieBacker `1/2"`, sin calzas).
  - `#4` **Refrigerador** (`20A · 12/2` → `Refrigerador @ 68"` N, `15"` AFF), `#5` **Lavavajillas** (`20A · 12/2` → yugo izquierdo de `Doble Bajo Fregadero @ 76"*`, `14"` AFF) y `#6` **Triturador** (`15A · 14/2` → yugo derecho en receptáculo y neutro separados + `Botón Aire @ 90"*`).
  - `#7` **Estufa de Gas** (`15A · 14/2` → `Estufa @ 33"` N, `3"` AFF), `#8` **Campana Extractora** (`15A AFCI + bloqueo BRLW1` → caja sencilla `2" × 3"` saliendo `~1"` en `33" ± 2-1/4"` N, `83"–86"` AFF), `#9` **Luces de Cocina** (`15A · 14/2` → `3-Apagadores Entrada @ 35.5"` O de NE hacia `Luz Techo`, `Colgantes @ 75"/99"` y `Bajo Gabinete`).
- **Cuartos Comunes (`#10`, `#12`, Reusar Existente Sano + Nuevo vía Cajas en Ático; `#11` Reserva):**
  - `#10` **Contactos Sala, Comedor, Recámara y Pasillo (`Reuso + Nuevo`):** `Comedor 1–4` (`18"` AFF; cero `D5` en muro Panel; pausa `D6`), `Sala 1–5` (`18"` AFF; pausa `L6`), `Pasillo 1` (`18"` AFF) y `Recámara 1–5` (`11-1/2"` AFF placas horizontales oscuras) comparten `#10` vía las cajas abanderadas en el ático. Parte de los contactos y cables existentes en Sala, Comedor y Recámara se reusan — verificar en obra con el electricista C-10 qué tramos son reusados y cuáles nuevos.
  - `#11` **Reserva Libre (`División Futura Recámara / Cuartos`):** Queda libre como 5ª reserva para poder separar la `Caja Recámara/Pasillo` hacia `#11` después sin romper tablaroca.
  - `#12` **Luces y Apagadores Originales (`Reusar Circuito Existente`):** `15A AFCI` (`BRN115AF`) reusando intactos todos los apagadores originales, 3-vías y cableado de luces en Sala, Comedor, Recámara y Pasillo (C-10 conecta en el Panel + luz de Lavandería).
  - **Candado Obligatorio de Calibre:** Verificar el calibre de cada tramo reusado en `#10`; si **algún** cable reusado es `14 AWG`, instalar interruptor `15A AFCI` (`BRN115AF`) — nunca `20A`.
- **Baño, Lavandería y Ático (`#13`–`#16`, Nuevos) + Reservas (`#11`, `#17`–`#20`):**
  - `#13` **Baño Todo-en-Uno** (`20A AFCI/GFCI · 12/2` vía `Caja Baño`): **100% cable `12/2` Amarillo** en todas las ramas (`Tocador`, `Luz Tocador`, `Luz Ducha`, `Extractor`, `Apagadores` en muro sólido de postes, más **bajada `12/2` independiente para `Inodoro` antes del azulejo de muro** para futura división a Reserva `#19`).
  - `#14` **Lavandería WashTower** (`20A AFCI/GFCI en Panel · 12/2`): **un contacto doble estándar de `20A`** en el muro Este/Derecho a `38"` AFF librando la puerta librero Murphy de `8-1/4"` para ambos enchufes de `120V` de la `LG WKG101HVA`.
  - `#15` **Calefactor en Ático** (`15A · 14/2` dedicado a `F1` + desconectador en `174", 258"`).
  - `#16` **Toma de Servicio y Luces en Ático** (`15A AFCI/GFCI BRN115DF · 14/2`): `Toma Ático` en la plataforma `30"×30"` (`<=25 pies` de F1), `Apagador Escotilla` afuera de Puerta 4 (Opción A o B), y 2 LEDs cerrados sobre bloqueo `2×4` a `>=1-1/2"` bajo el techo plano. Los **detectores de Humo/CO** son de batería sellada de 10 años (cero tendidos `14/3` cableados).
  - `#11`, `#17`–`#20` **5 Espacios de Reserva:** Libres para divisiones futuras (`#11` Recámara/Pasillo, `#17` Sala/Comedor, `#18` Futura, `#19` Bidet Inodoro, `#20` Libre).

## Pausas Activas Antes de Fijar Cajas o Jalar Cable
- **Pausa de Panel y Alimentador:** Confirmar alimentador NEXT `80A/#4` vs. `100A/#3` y pausar muescas laterales en el muro del `Panel` antes de cerrar.
- **Pausa de cableado fuera de cocina:** No jalar cable hasta liberación del propietario/inspector. `SFEC 362.10` restringe `ENT` en muros de madera; `SFEC 334.10(2)` permite `NM-B` oculto.
- **Baño y clóset:** La corrediza se retiró el 24 nov por puerta abatible de 28" hacia el pasillo; el muro Sur permite apagadores. Mantener abierto el techo del clóset NO de recámara hasta terminar cable y marco de escotilla.
- **Ventana Sur y Subpiso Descubierto:** Verificar en obra el eje de la ventana Sur (`87"` vs. `90"` O de SE) y el espesor de piso terminado `+t` (`H_subpiso = H_AFF + t`, est. `3/4"`) antes de fijar cajas.

## Trabajo de muro del baño
Mantener azulejo de muro en pausa hasta el regreso de Alex; la bajada separada al inodoro va antes del azulejo. La corrediza retirada se sustituye por puerta abatible de 28" hacia el pasillo; el muro Sur permite apagadores.
