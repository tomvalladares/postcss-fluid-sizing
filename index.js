import { parseTokens, resolveValue } from './lib/token-parser.js';
import { calculateFluid } from './lib/fluid-calc.js';
import { validateOptions, hasFluidFunction } from './lib/utils.js';

/**
 * PostCSS Fluid Sizing Plugin
 * 
 * Transforms fluid() function calls into CSS clamp() functions for responsive typography and sizing.
 * Supports CSS custom property tokens for consistent design systems.
 * 
 * @param {Object} opts - Plugin options
 * @param {string} opts.tokensPath - Path to CSS tokens file (default: './src/assets/tokens.css')
 * @param {number} opts.minBreakpoint - Minimum viewport breakpoint in rem (default: 21.25)
 * @param {number} opts.maxBreakpoint - Maximum viewport breakpoint in rem (default: 80)
 * @returns {Object} PostCSS plugin
 */
export default function fluidSizingPlugin(opts = {}) {
  const options = validateOptions(opts);
  
  // Parse tokens once when plugin initializes
  let tokenMap = parseTokens(options.tokensPath);
  
  return {
    postcssPlugin: 'postcss-fluid-sizing-plugin',
    prepare() {
      // Re-parse tokens on each build to pick up changes
      tokenMap = parseTokens(options.tokensPath);
    },
    Declaration(decl) {
      // Check if the declaration value contains 'fluid('
      if (!hasFluidFunction(decl.value)) return;
      
      // Replace all fluid() calls in the declaration value
      decl.value = decl.value.replace(/fluid\((.*?)\)/g, (fullMatch, params) => {
        try {
          // Parse parameters
          const paramArray = params.split(',').map(param => {
            const resolved = resolveValue(param, tokenMap);
            if (resolved === 0 && param.trim() !== '0') {
              console.warn(`Could not resolve parameter: ${param.trim()}`);
            }
            return resolved;
          });
          
          // Validate parameter count (2-4 parameters expected)
          if (paramArray.length < 2 || paramArray.length > 4) {
            console.warn(`Invalid parameter count for fluid(): expected 2-4, got ${paramArray.length}`);
            return fullMatch; // Return original if invalid
          }
          
          // Apply default breakpoints if not provided
          const [minSize, maxSize, minBreakpoint, maxBreakpoint] = [
            ...paramArray,
            options.minBreakpoint,
            options.maxBreakpoint
          ].slice(0, 4);
          
          return calculateFluid(minSize, maxSize, minBreakpoint, maxBreakpoint);
        } catch (error) {
          console.error(`Error processing fluid() function: ${error.message}`);
          return fullMatch; // Return original if error
        }
      });
    }
  };
}

// Required for PostCSS plugin detection
fluidSizingPlugin.postcss = true;