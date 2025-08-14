import fs from 'fs';
import path from 'path';

/**
 * Parse CSS custom properties from tokens file
 * @param {string} tokensPath - Path to tokens.css file
 * @param {number} basePxSize - Base pixel size for rem conversion (default: 16)
 * @returns {Object} Token map with property names as keys and numeric values in rem
 */
export function parseTokens(tokensPath, basePxSize = 16) {
  const tokenMap = {};
  
  try {
    const resolvedPath = path.resolve(tokensPath);
    
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ Token file not found: ${resolvedPath}`);
      console.error(`   Make sure the file exists or update the tokensPath option`);
      return tokenMap;
    }
    
    const tokensContent = fs.readFileSync(resolvedPath, 'utf8');
    
    // Extract CSS custom properties and their values
    const tokenRegex = /--([^:]+):\s*([^;]+);/g;
    let match;
    let tokenCount = 0;
    
    while ((match = tokenRegex.exec(tokensContent)) !== null) {
      const tokenName = `--${match[1].trim()}`;
      const tokenValue = match[2].trim();
      
      // Extract numeric value from rem units
      const remMatch = tokenValue.match(/^([0-9.]+)rem/);
      if (remMatch) {
        tokenMap[tokenName] = parseFloat(remMatch[1]);
        tokenCount++;
      } else {
        // Extract numeric value from px units and convert to rem
        const pxMatch = tokenValue.match(/^([0-9.]+)px/);
        if (pxMatch) {
          tokenMap[tokenName] = parseFloat(pxMatch[1]) / basePxSize;
          tokenCount++;
        } else {
          // Try to extract numeric value without units (assume rem)
          const numericMatch = tokenValue.match(/^([0-9.]+)/);
          if (numericMatch) {
            tokenMap[tokenName] = parseFloat(numericMatch[1]);
            tokenCount++;
          } else {
            console.warn(`⚠️  Skipping token "${tokenName}" with non-numeric value: "${tokenValue}"`);
          }
        }
      }
    }
    
    console.log(`✅ Loaded ${tokenCount} tokens from ${tokensPath}`);
    if (tokenCount === 0) {
      console.warn(`⚠️  No valid tokens found in ${tokensPath}. Check file format.`);
    }
  } catch (error) {
    console.error(`❌ Could not parse tokens file (${tokensPath}):`, error.message);
  }
  
  return tokenMap;
}

/**
 * Resolve parameter value from token or numeric input
 * @param {string} param - Parameter to resolve (token name or numeric value)
 * @param {Object} tokenMap - Map of tokens
 * @param {number} basePxSize - Base pixel size for rem conversion (default: 16)
 * @returns {number} Resolved numeric value in rem
 */
export function resolveValue(param, tokenMap, basePxSize = 16) {
  const trimmedParam = param.trim();
  
  // Check if it's a direct token reference (--token-name)
  if (trimmedParam.startsWith('--')) {
    const tokenValue = tokenMap[trimmedParam];
    if (tokenValue !== undefined) {
      return tokenValue;
    }
    console.error(`❌ Token "${trimmedParam}" not found in tokens file. Available tokens: ${Object.keys(tokenMap).join(', ')}`);
    return NaN; // Return NaN to make the error more obvious
  }
  
  // Parse as numeric value with units
  const remMatch = trimmedParam.match(/^([0-9.]+)rem$/);
  if (remMatch) {
    return parseFloat(remMatch[1]);
  }
  
  const pxMatch = trimmedParam.match(/^([0-9.]+)px$/);
  if (pxMatch) {
    return parseFloat(pxMatch[1]) / basePxSize;
  }
  
  // Parse as plain number (assume rem)
  const numericValue = parseFloat(trimmedParam);
  if (isNaN(numericValue)) {
    console.error(`❌ Invalid numeric value: "${trimmedParam}". Expected a number, px value, rem value, or --token-name`);
    return NaN;
  }
  return numericValue;
}