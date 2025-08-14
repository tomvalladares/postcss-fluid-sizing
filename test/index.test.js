import postcss from 'postcss';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import fluidSizingPlugin from '../index.js';

// Create test tokens file
const tokensContent = `
:root {
  --text-sm: 0.875rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --text-px-sm: 14px;
  --text-px-lg: 20px;
  --space-px-md: 16px;
}
`;

const testTokensPath = './test/tokens.css';
mkdirSync(dirname(testTokensPath), { recursive: true });
writeFileSync(testTokensPath, tokensContent);

// Test runner
async function runTest(name, input, expected, options = {}) {
  try {
    const result = await postcss([fluidSizingPlugin({ tokensPath: testTokensPath, ...options })])
      .process(input, { from: undefined });
    
    const actual = result.css.trim();
    
    if (actual === expected.trim()) {
      console.log(`✅ ${name}`);
      return true;
    } else {
      console.log(`❌ ${name}`);
      console.log(`Expected: ${expected.trim()}`);
      console.log(`Actual:   ${actual}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    return false;
  }
}

// Test cases
const tests = [
  {
    name: 'Basic fluid with numeric values',
    input: '.test { font-size: fluid(1, 2); }',
    expected: '.test { font-size: clamp(1.0000rem, 0.6383rem + 1.7021vw, 2.0000rem); }'
  },
  {
    name: 'Fluid with custom breakpoints', 
    input: '.test { font-size: fluid(1, 2, 20, 80); }',
    expected: '.test { font-size: clamp(1.0000rem, 0.6667rem + 1.6667vw, 2.0000rem); }'
  },
  {
    name: 'Fluid with CSS tokens',
    input: '.test { font-size: fluid(--text-sm, --text-xl); }',
    expected: '.test { font-size: clamp(0.8750rem, 0.7394rem + 0.6383vw, 1.2500rem); }'
  },
  {
    name: 'Multiple fluid calls in same declaration',
    input: '.test { margin: fluid(0.5, 1) fluid(--space-sm, --space-lg); }',
    expected: '.test { margin: clamp(0.5000rem, 0.3191rem + 0.8511vw, 1.0000rem) clamp(0.5000rem, 0.1383rem + 1.7021vw, 1.5000rem); }'
  },
  {
    name: 'Inverted scaling (min > max)',
    input: '.test { font-size: fluid(2, 1); }',
    expected: '.test { font-size: clamp(1.0000rem, 2.3617rem + -1.7021vw, 2.0000rem); }'
  },
  {
    name: 'No fluid function should pass through unchanged',
    input: '.test { font-size: 1rem; color: blue; }',
    expected: '.test { font-size: 1rem; color: blue; }'
  },
  {
    name: 'Mixed fluid and regular values',
    input: '.test { padding: 1rem fluid(0.5, 2) 0; }',
    expected: '.test { padding: 1rem clamp(0.5000rem, -0.0426rem + 2.5532vw, 2.0000rem) 0; }'
  },
  {
    name: 'Fluid with px values',
    input: '.test { font-size: fluid(16px, 24px); }',
    expected: '.test { font-size: clamp(1.0000rem, 0.8191rem + 0.8511vw, 1.5000rem); }'
  },
  {
    name: 'Fluid with mixed px and rem values',
    input: '.test { margin: fluid(8px, 2rem); }',
    expected: '.test { margin: clamp(0.5000rem, -0.0426rem + 2.5532vw, 2.0000rem); }'
  },
  {
    name: 'Fluid with px tokens',
    input: '.test { font-size: fluid(--text-px-sm, --text-px-lg); }',
    expected: '.test { font-size: clamp(0.8750rem, 0.7394rem + 0.6383vw, 1.2500rem); }'
  }
];

// Run all tests
console.log('🧪 Running PostCSS Fluid Sizing Plugin Tests\\n');

let passed = 0;
let total = tests.length;

for (const test of tests) {
  const success = await runTest(test.name, test.input, test.expected, test.options);
  if (success) passed++;
}

console.log(`\\n📊 Test Results: ${passed}/${total} passed`);

if (passed === total) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('💥 Some tests failed!');
  process.exit(1);
}