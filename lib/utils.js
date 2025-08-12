/**
 * Utility functions for the fluid sizing plugin
 */

/**
 * Validate plugin options
 * @param {Object} opts - Plugin options
 * @returns {Object} Validated options with defaults
 */
export function validateOptions(opts = {}) {
  return {
    tokensPath: opts.tokensPath || './src/assets/tokens.css',
    minBreakpoint: opts.minBreakpoint || 21.25,
    maxBreakpoint: opts.maxBreakpoint || 80,
    precision: opts.precision || 4,
    ...opts
  };
}

/**
 * Check if a CSS declaration contains fluid() function calls
 * @param {string} value - CSS declaration value
 * @returns {boolean} True if contains fluid() calls
 */
export function hasFluidFunction(value) {
  return value.includes('fluid(');
}

/**
 * Parse fluid() function parameters from CSS value
 * @param {string} fluidCall - The fluid() function call string
 * @returns {Array} Array of parameter strings
 */
export function parseFluidParams(fluidCall) {
  // Extract parameters from fluid(param1, param2, ...)
  const match = fluidCall.match(/fluid\((.*?)\)/);
  if (!match) return [];
  
  return match[1].split(',').map(param => param.trim());
}