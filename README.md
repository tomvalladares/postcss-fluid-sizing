# PostCSS Fluid Sizing

A PostCSS plugin that transforms `fluid()` function calls into CSS `clamp()` functions for responsive typography and sizing. Supports CSS custom property tokens for consistent design systems.

## Features

- 🔄 **Fluid Typography & Sizing**: Automatically scales between min/max values across viewport ranges
- 🎯 **CSS Token Support**: Use CSS custom properties as values for design system consistency  
- 📐 **Multi-Unit Support**: Works with `rem`, `px`, and unitless values with automatic conversion
- 📱 **Responsive by Default**: Configurable breakpoints with sensible defaults
- ⚡ **Build-time Processing**: No runtime JavaScript, outputs pure CSS
- 🛠️ **Flexible Configuration**: Customizable token paths, breakpoints, and px conversion

## Installation

```bash
npm install postcss-fluid-sizing --save-dev
```

## Usage

### Basic Setup

```js
// postcss.config.js
import fluidSizingPlugin from 'postcss-fluid-sizing';

export default {
  plugins: [
    fluidSizingPlugin({
      tokensPath: './src/assets/tokens.css', // optional
      minBreakpoint: 21.25, // 340px, optional  
      maxBreakpoint: 80,     // 1280px, optional
      basePxSize: 16         // px to rem conversion, optional
    })
  ]
};
```

### CSS Usage

```css
/* Basic usage with numeric values (rem) */
.heading {
  font-size: fluid(1.5, 3);
  /* Output: clamp(1.5rem, 1.2891rem + 1.2553vw, 3rem) */
}

/* Using px values (automatically converted to rem) */
.text {
  font-size: fluid(16px, 24px);
  /* 16px = 1rem, 24px = 1.5rem */
}

/* Mixed units */
.mixed {
  margin: fluid(8px, 2rem);
  /* 8px = 0.5rem, mixed with 2rem */
}

/* With custom breakpoints */
.custom {
  font-size: fluid(1, 2, 20, 80);
  /* min: 1rem, max: 2rem, from 20rem to 80rem viewport */
}

/* Using CSS custom property tokens */
.title {
  font-size: fluid(--text-sm, --text-xl);
  margin: fluid(--space-md, --space-lg);
}
```

### CSS Tokens File

Create a tokens file (default: `./src/assets/tokens.css`):

```css
:root {
  /* Typography tokens - rem values */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem; 
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  
  /* Typography tokens - px values (auto-converted) */
  --text-px-sm: 14px;  /* → 0.875rem */
  --text-px-lg: 20px;  /* → 1.25rem */
  
  /* Spacing tokens */
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Spacing tokens - px values */
  --space-px-xs: 4px;  /* → 0.25rem */
  --space-px-sm: 8px;  /* → 0.5rem */
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tokensPath` | `string` | `'./src/assets/tokens.css'` | Path to CSS tokens file |
| `minBreakpoint` | `number` | `21.25` | Minimum viewport width in rem (340px) |  
| `maxBreakpoint` | `number` | `80` | Maximum viewport width in rem (1280px) |
| `basePxSize` | `number` | `16` | Base font size for px to rem conversion |
| `precision` | `number` | `4` | Decimal precision for calculations |

## Examples

### Responsive Typography Scale

```css
/* Using rem values */
.display-1 { font-size: fluid(2, 4); }
.display-2 { font-size: fluid(1.75, 3.5); }
.heading-1 { font-size: fluid(1.5, 3); }

/* Using px values */
.heading-2 { font-size: fluid(20px, 40px); }
.body { font-size: fluid(16px, 18px); }

/* Using tokens */
.small { font-size: fluid(--text-px-sm, --text-lg); }
```

### Component Spacing

```css
.card {
  padding: fluid(--space-md, --space-xl);
  margin-bottom: fluid(--space-sm, --space-lg);
}

.section {
  padding-block: fluid(2, 6);
}
```

### Inverted Scaling

When `minSize > maxSize`, the plugin automatically inverts the breakpoint behavior:

```css
.mobile-first {
  font-size: fluid(2, 1); /* Larger on mobile, smaller on desktop */
}
```

## How It Works

The plugin processes `fluid()` functions and converts them to CSS `clamp()` with linear interpolation:

1. **Parse Parameters**: Extract min/max sizes and breakpoints from `fluid()` calls
2. **Unit Conversion**: Convert px values to rem using `basePxSize` (default: 16px = 1rem)
3. **Resolve Tokens**: Look up CSS custom property values from tokens file (supports both rem and px)
4. **Calculate**: Generate linear interpolation between breakpoints using precise math
5. **Output**: CSS `clamp(min, preferred, max)` function with rem units

### Formula

The preferred value uses this calculation:
```
preferredValue = yIntercept + slope * 100vw
slope = (maxSize - minSize) / (maxBreakpoint - minBreakpoint)  
yIntercept = -minBreakpoint * slope + minSize
```

## Browser Support

Supports all browsers that support CSS `clamp()` function:
- Chrome 79+
- Firefox 75+ 
- Safari 13.1+
- Edge 79+

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Run tests: `npm test`
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature/my-feature`
6. Submit a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related

- [PostCSS](https://postcss.org/) - Tool for transforming CSS
- [CSS clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp) - CSS function for responsive values