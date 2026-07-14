# Figma Guide - Laboratorio Nuclear

Esta guia define el lenguaje visual aplicado en `frontend/src/App.css` para mantener consistencia entre Figma y React.

## Frames

- Desktop: 1440 x 1024
- Tablet: 1024 x 1366
- Mobile: 390 x 844

## Grid

- Desktop: 12 columnas, margin 80, gutter 24
- Tablet: 8 columnas, margin 40, gutter 20
- Mobile: 4 columnas, margin 20, gutter 16

## Tokens de color

- `bg-0`: #050B14
- `bg-1`: #0A1424
- `panel`: rgba(11, 24, 42, 0.92)
- `panel-border`: rgba(89, 134, 169, 0.28)
- `text-0`: #D6E8F6
- `text-1`: #8FB0C8
- `primary`: #2FC7DC
- `accent`: #9CFF5A
- `ok`: #3FE38F
- `error`: #FF6B7D

## Tipografia

- Heading/UI: Chakra Petch
- Datos numericos: IBM Plex Mono

Escala sugerida:

- H1: 35 / 700 / tracking +3%
- H2: 24 / 600 / tracking +2%
- Body: 16 / 400
- Label: 14 / 500
- Mono result: 15 / 500

## Componentes

- Card
  - Radius: 14
  - Border: panel-border
  - Shadow: 0 18 50 rgba(0,0,0,0.34)
- Input
  - Height: 42
  - Radius: 8
  - Border: rgba(143,176,200,0.36)
- Button Primary
  - Fill: linear 135deg #1B6F97 -> #114D69
  - Radius: 9
- Button Accent
  - Fill: linear 135deg #76DB3F -> #3F9C2A
  - Text: #04140B
- Badge
  - Radius: pill
  - Border: rgba(47,199,220,0.45)

## Layout

1. Hero card con estado de modulo
2. Estado backend
3. Accesos a simulaciones
4. Formularios de calculo
5. Grafica de barras

## Motion

- Hover botones: translateY(-1px)
- Transicion sugerida: 160ms ease-out
- Evitar animaciones excesivas dentro de panel cientifico
