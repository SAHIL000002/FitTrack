---
name: Nexus Athletica
colors:
  surface: '#111509'
  surface-dim: '#111509'
  surface-bright: '#373b2d'
  surface-container-lowest: '#0c0f05'
  surface-container-low: '#191d11'
  surface-container: '#1d2114'
  surface-container-high: '#282b1e'
  surface-container-highest: '#333628'
  on-surface: '#e1e4d0'
  on-surface-variant: '#c3c9ae'
  inverse-surface: '#e1e4d0'
  inverse-on-surface: '#2e3224'
  outline: '#8d937a'
  outline-variant: '#434934'
  surface-tint: '#a5d700'
  primary: '#ffffff'
  on-primary: '#273500'
  primary-container: '#bff525'
  on-primary-container: '#526d00'
  inverse-primary: '#4d6700'
  secondary: '#c6c6c9'
  on-secondary: '#2f3133'
  secondary-container: '#454749'
  on-secondary-container: '#b4b5b7'
  tertiary: '#ffffff'
  on-tertiary: '#312e3f'
  tertiary-container: '#e5dff5'
  on-tertiary-container: '#666274'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#bff525'
  primary-fixed-dim: '#a5d700'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#394d00'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#e5dff5'
  tertiary-fixed-dim: '#c9c4d9'
  on-tertiary-fixed: '#1c1a29'
  on-tertiary-fixed-variant: '#484556'
  background: '#111509'
  on-background: '#e1e4d0'
  surface-variant: '#333628'
typography:
  display-hero:
    fontFamily: Anton
    fontSize: 72px
    fontWeight: '400'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.0'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: '0'
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 28px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: '0'
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Barlow Condensed
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Barlow Condensed
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.05em
spacing:
  grid-type: fluid
  columns: '12'
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  margin-screen: 24px
---

## Brand & Style

Nexus Athletica embodies an uncompromising industrial athletic performance aesthetic. The personality is fierce, precise, and utilitarian—built for athletes who demand exactness and raw power. The UI evokes the feeling of high-end, heavy-duty training environments, combining raw industrial starkness with elite sports engineering.

The chosen design style is a hybrid of **Brutalism** and **High-Contrast Modernism**: sharp geometry, heavy structural framing, high-impact typography, and a stark dark mode foundation punctuated by a hyper-vibrant lime accent for critical data points and active states.

## Colors

The color palette is deliberately restrained and focused on performance tracking. The foundation is built on deep carbon blacks and cold structural greys, creating an obsidian arena for the primary accent.

- **Background (`#070809`):** The absolute canvas, absorbing light and pushing data forward.
- **Secondary (`#111315`):** Structural container color for modular grouping.
- **Surface (`#181B1E`):** Elevated interactive zones and card layers.
- **Text (`#F4F4F2`):** High-contrast off-white for maximum legibility under fatigue.
- **Muted Text (`#92979D`):** Industrial steel grey for secondary telemetry and labels.
- **Primary Accent (`#C8FF32`):** Electric lime reserved exclusively for live data, active states, and high-priority calls to action.

## Typography

Typography acts as a structural element, combining the commanding, compressed impact of **Anton** for headlines with the utilitarian density of **Barlow Condensed** for body content. **JetBrains Mono** is utilized for all metrics, timers, and telemetry data to reinforce the precision athletic instrumentation feel. Maintain strict uppercase formatting for primary statistics and section headers.

## Layout & Spacing

The layout is governed by a strict, high-density 12-column fluid grid system optimized for rapid data ingestion and telemetry dashboards. Spacing relies on a tight 4px baseline grid, utilizing sharp margins (24px on desktop, 16px on mobile) and high-contrast structural dividers rather than soft separation. Components must snap cleanly to grid intersections to maintain the uncompromising industrial blueprint aesthetic.

## Elevation & Depth

Elevation is achieved entirely through **low-contrast outlines** and stark surface tone shifts (`#111315` to `#181B1E`), completely avoiding diffuse drop shadows or atmospheric blurs. Boundaries are defined by crisp 1px borders using the muted text or secondary color tokens. Active or hovered states are signaled by snapping to a high-contrast lime border (`#C8FF32`) or solid background inversion, reinforcing a flat, mechanical, tactical interface.

## Shapes

The shape language is strictly **sharp (0px roundedness)**. All containers, buttons, input fields, and structural cards feature hard 90-degree corners. This severe geometry communicates industrial precision, durability, and raw functionality, stripping away any decorative softness.

## Components

### Buttons
- **Primary:** Solid `#C8FF32` background with `#070809` text, sharp 0px corners, uppercase condensed typography, and zero radius. On hover, invert to high-contrast border with transparent fill.
- **Secondary:** Transparent fill with a 1px `#92979D` border and `#F4F4F2` text. Hover state switches to 1px `#C8FF32` border and `#C8FF32` text.

### Chips & Tags
- Rectangular telemetry tags featuring a 1px border, monospace font (`JetBrains Mono`), and high-density padding (4px 8px). Active filter states fill completely with `#C8FF32` and `#070809` text.

### Input Fields
- Heavy industrial input zones with `#111315` background and 1px `#92979D` bottom or full border. Focus state locks a 1px solid `#C8FF32` border with no glow effects.

### Checkboxes & Radio Buttons
- Custom square checkboxes (0px radius) with a hard border. Checked state fills the box with `#C8FF32` and displays a sharp black checkmark.

### Cards & Containers
- Modular telemetry panels built on `#181B1E` surfaces with 1px `#111315` borders and stark internal grid lines dividing metric modules.

### Specialized Components
- **Telemetry Readouts:** Large-scale numeric counters using `Anton` paired with small monospace unit labels (e.g., `RPM`, `BPM`, `KG`).
- **Progress Bars:** Segmented linear strength and load meters featuring hard-edged blocks that increment in sharp steps rather than smooth gradients.