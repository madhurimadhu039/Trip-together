import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const docsDir = path.resolve('docs');

if (fs.existsSync(distDir)) {
  // Strip the uncompiled root redirect script from compiled dist/index.html
  const distIndexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndexPath)) {
    let html = fs.readFileSync(distIndexPath, 'utf-8');
    html = html.replace(/<script id="github-pages-root-redirect">[\s\S]*?<\/script>/, '');
    fs.writeFileSync(distIndexPath, html, 'utf-8');
  }

  // Ensure 404.html is present in dist
  const public404 = path.resolve('public', '404.html');
  const dist404 = path.join(distDir, '404.html');
  if (fs.existsSync(public404) && !fs.existsSync(dist404)) {
    fs.copyFileSync(public404, dist404);
  }

  // Synchronize compiled dist/ to docs/ for GitHub Pages compatibility
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  fs.cpSync(distDir, docsDir, { recursive: true });
  console.log('✓ Successfully synchronized dist/ to docs/ for GitHub Pages compatibility.');
}
