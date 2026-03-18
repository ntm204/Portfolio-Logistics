const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify } = require('html-minifier-terser');
const CleanCSS = require('clean-css');

const DIST = 'dist';

/**
 * Main build function
 */
async function build() {
  console.log('--- Starting Build Process ---');

  // 1. Clean and create distribution directory
  if (shell.test('-d', DIST)) {
    shell.rm('-rf', DIST);
  }
  shell.mkdir('-p', [
    DIST,
    path.join(DIST, 'css'),
    path.join(DIST, 'js'),
    path.join(DIST, 'assets'),
    path.join(DIST, 'locales')
  ]);

  // 2. Optimize HTML
  console.log('--- Optimizing HTML ---');
  const htmlSource = fs.readFileSync('index.html', 'utf8');
  const minifiedHtml = await minify(htmlSource, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true
  });
  fs.writeFileSync(path.join(DIST, 'index.html'), minifiedHtml);

  // 3. Optimize CSS
  console.log('--- Optimizing CSS ---');
  const cssDir = 'css';
  if (fs.existsSync(cssDir)) {
    fs.readdirSync(cssDir).forEach(file => {
      if (file.endsWith('.css')) {
        const cssPath = path.join(cssDir, file);
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        const minifiedCss = new CleanCSS({ level: 2 }).minify(cssContent).styles;
        fs.writeFileSync(path.join(DIST, 'css', file), minifiedCss);
      }
    });
  }

  // 4. Obfuscate JS
  console.log('--- Obfuscating JavaScript ---');
  const jsDir = 'js';
  if (fs.existsSync(jsDir)) {
    fs.readdirSync(jsDir).forEach(file => {
      if (file.endsWith('.js')) {
        const jsPath = path.join(jsDir, file);
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        const obfuscatedJs = JavaScriptObfuscator.obfuscate(jsContent, {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          numbersToExpressions: true,
          simplify: true,
          stringArray: true,
          stringArrayThreshold: 0.75,
          splitStrings: true,
          unicodeEscapeSequence: true
        }).getObfuscatedCode();
        fs.writeFileSync(path.join(DIST, 'js', file), obfuscatedJs);
      }
    });
  }

  // 5. Copy Assets, Locales, and Admin
  console.log('--- Copying Assets, Locales & Admin ---');
  if (fs.existsSync('assets')) shell.cp('-R', 'assets/*', path.join(DIST, 'assets'));
  if (fs.existsSync('locales')) shell.cp('-R', 'locales/*', path.join(DIST, 'locales'));
  if (fs.existsSync('admin')) {
    shell.mkdir('-p', path.join(DIST, 'admin'));
    shell.cp('-R', 'admin/*', path.join(DIST, 'admin'));
  }

  console.log('--- Build Successful! All files optimized in /dist ---');
}

// Execute build with error handling
build().catch(err => {
  console.error('--- Build Failed:', err, '---');
  process.exit(1);
});
