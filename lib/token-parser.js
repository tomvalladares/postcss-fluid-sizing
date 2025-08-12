import fs from 'fs';
import path from 'path';

/**
 * Parse CSS custom properties from tokens file
 * @param {string} tokensPath - Path to tokens.css file
 * @returns {Object} Token map with property names as keys and numeric values
 */
export function parseTokens(tokensPath) {
  const tokenMap = {};
  
  try {
    const resolvedPath = path.resolve(tokensPath);
    
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Token file not found: ${tokensPath}`);
      return tokenMap;
    }
    
    const tokensContent = fs.readFileSync(resolvedPath, 'utf8');
    
    // Extract CSS custom properties and their values
    const tokenRegex = /--([^:]+):\s*([^;]+);/g;
    let match;
    
    while ((match = tokenRegex.exec(tokensContent)) !== null) {
      const tokenName = `--${match[1].trim()}`;
      const tokenValue = match[2].trim();
      
      // Extract numeric value from rem units
      const remMatch = tokenValue.match(/^([0-9.]+)rem/);
      if (remMatch) {
        tokenMap[tokenName] = parseFloat(remMatch[1]);
      } else {
        // Try to extract numeric value without units
        const numericMatch = tokenValue.match(/^([0-9.]+)/);
        if (numericMatch) {
          tokenMap[tokenName] = parseFloat(numericMatch[1]);
        }
      }
    }
  } catch (error) {
    console.warn(`Could not parse tokens file (${tokensPath}):`, error.message);
  }
  
  return tokenMap;
}

/**
 * Resolve parameter value from token or numeric input
 * @param {string} param - Parameter to resolve (token name or numeric value)
 * @param {Object} tokenMap - Map of tokens
 * @returns {number} Resolved numeric value
 */
export function resolveValue(param, tokenMap) {
  const trimmedParam = param.trim();
  
  // Check if it's a token reference
  if (trimmedParam.startsWith('--')) {
    const tokenValue = tokenMap[trimmedParam];
    if (tokenValue !== undefined) {
      return tokenValue;
    }
    console.warn(`Token ${trimmedParam} not found in tokens file`);
    return 0;
  }
  
  // Parse as numeric value (assuming rem)
  const numericValue = parseFloat(trimmedParam);
  return isNaN(numericValue) ? 0 : numericValue;
}