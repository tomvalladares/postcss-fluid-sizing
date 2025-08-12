/**
 * Calculate fluid sizing using clamp() function
 * @param {number} minSize - Minimum size in rem
 * @param {number} maxSize - Maximum size in rem  
 * @param {number} minBreakpoint - Minimum viewport width in rem
 * @param {number} maxBreakpoint - Maximum viewport width in rem
 * @returns {string} CSS clamp() function
 */
export function calculateFluid(minSize, maxSize, minBreakpoint = 21.25, maxBreakpoint = 96) {
  // Round values to 4 decimal places for precision
  let minSizeRem = Math.round(minSize * 10000) / 10000;
  let maxSizeRem = Math.round(maxSize * 10000) / 10000;
  
  // Check if minSize is greater than maxSize (inverted behavior)
  const inverted = minSizeRem > maxSizeRem;
  
  let minWidth, maxWidth;
  if (inverted) {
    // Swap sizes and breakpoints for inverted behavior
    [minSizeRem, maxSizeRem] = [maxSizeRem, minSizeRem];
    maxWidth = Math.round(minBreakpoint * 10000) / 10000;
    minWidth = Math.round(maxBreakpoint * 10000) / 10000;
  } else {
    minWidth = Math.round(minBreakpoint * 10000) / 10000;
    maxWidth = Math.round(maxBreakpoint * 10000) / 10000;
  }
  
  // Calculate slope and Y-axis intersection for linear interpolation
  const slope = (maxSizeRem - minSizeRem) / (maxWidth - minWidth);
  const yAxisInt = -1 * minWidth * slope + minSizeRem;
  
  // Define the preferred size for clamp function, rounded to 4 decimals
  const prefSize = `${yAxisInt.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw`;
  
  // Return clamp function
  return `clamp(${minSizeRem.toFixed(4)}rem, ${prefSize}, ${maxSizeRem.toFixed(4)}rem)`;
}