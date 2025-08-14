# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PostCSS Fluid Sizing is a PostCSS plugin that transforms `fluid()` function calls into CSS `clamp()` functions for responsive typography and sizing. The plugin supports CSS custom property tokens for design system consistency, automatic px-to-rem conversion, and includes easing curves for non-linear scaling behavior.

### Architecture

The codebase follows a modular architecture:

- **index.js**: Main plugin entry point that orchestrates the transformation process
- **lib/fluid-calc.js**: Core mathematical calculations for fluid sizing using linear interpolation
- **lib/token-parser.js**: Handles parsing and resolving CSS custom properties from token files
- **lib/utils.js**: Utility functions for validation and parameter parsing

The plugin processes CSS declarations by:
1. Detecting `fluid()` function calls in CSS values
2. Parsing parameters (min/max sizes, optional breakpoints, and easing curves)
3. Converting px values to rem using configurable base size (default: 16px = 1rem)
4. Resolving CSS custom property tokens from external token files (supports both rem and px)
5. Applying easing functions for non-linear scaling (quad, cubic, ease-in/out)
6. Calculating interpolation between breakpoints (linear or curve approximation)
7. Outputting CSS `clamp()` functions with precise mathematical formulas in rem units

### Key Components

**Token Resolution**: The plugin can resolve CSS custom properties (e.g., `--text-lg`) from external token files, defaulting to `./src/assets/tokens.css`. Supports both rem and px values in tokens, with automatic px-to-rem conversion. Token values are cached and re-parsed on each build.

**Fluid Calculation**: Uses mathematical formulas to generate responsive `clamp()` functions:
- **Linear**: `slope = (maxSize - minSize) / (maxBreakpoint - minBreakpoint)`
- **Non-linear**: Uses derivative at midpoint for curve approximation
- **Easing Functions**: quad (t²), cubic (t³), ease-in/out patterns
- Output: `clamp(min, yIntercept + slope*100vw, max)`

**Inverted Scaling**: Automatically handles cases where minSize > maxSize by swapping values and breakpoints.

## Development Commands

```bash
# Run tests
npm test

# Test with specific Node.js version (requires Node 14+)
node test/index.test.js

# Prepare for publishing (runs tests)
npm run prepublishOnly
```

Note: Linting is not currently configured (`npm run lint` outputs placeholder message).

## Testing

The test suite uses a custom test runner in `test/index.test.js` that:
- Creates test token files dynamically
- Processes CSS through PostCSS with the plugin
- Compares expected vs actual output with precise decimal matching
- Tests numeric values, custom breakpoints, CSS tokens, multiple calls, and inverted scaling

Test tokens are created at `./test/tokens.css` with predefined values for typography and spacing scales.

## Configuration

Plugin accepts these options:
- `tokensPath`: Path to CSS tokens file (default: `./src/assets/tokens.css`)
- `minBreakpoint`: Minimum viewport width in rem (default: 21.25 = 340px)
- `maxBreakpoint`: Maximum viewport width in rem (default: 80 = 1280px)
- `basePxSize`: Base font size for px to rem conversion (default: 16)
- `precision`: Decimal precision for calculations (default: 4)

## Code Style

- ES modules throughout (`import`/`export`)
- Functional programming approach with pure functions
- Extensive error handling with console warnings for invalid inputs
- 4-decimal precision for all mathematical calculations
- Comprehensive JSDoc documentation for all functions