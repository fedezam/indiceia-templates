#!/usr/bin/env node
// ============================================================
// indiceia-templates/scripts/compile.js
// Compila src/ de cada template en un único template.txt
//
// Estructura esperada por template:
//   public/templates/[ID]/
//     src/
//       index.html   ← estructura HTML con {{PLACEHOLDERS}}
//       style.css    ← estilos
//       script.js    ← lógica
//     template.txt   ← output compilado (generado automáticamente)
//
// Si no existe src/, el template se saltea (ya tiene template.txt manual)
// ============================================================

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = path.join(__dirname, '..', 'public', 'templates');

function compile(templateDir) {
  const srcDir    = path.join(templateDir, 'src');
  const htmlPath  = path.join(srcDir, 'index.html');
  const cssPath   = path.join(srcDir, 'style.css');
  const jsPath    = path.join(srcDir, 'script.js');
  const outputPath = path.join(templateDir, 'template.txt');

  if (!fs.existsSync(srcDir)) return null;

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Falta src/index.html en ${templateDir}`);
  }

  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Inyectar CSS inline antes de </head>
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');
    html = html.replace('</head>', `  <style>\n${css}\n  </style>\n</head>`);
  }

  // Inyectar JS inline antes de </body>
  if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf-8');
    html = html.replace('</body>', `  <script>\n${js}\n  </script>\n</body>`);
  }

  fs.writeFileSync(outputPath, html, 'utf-8');
  return outputPath;
}

function main() {
  if (!fs.existsSync(TEMPLATES_ROOT)) {
    console.error(`❌ No existe: ${TEMPLATES_ROOT}`);
    process.exit(1);
  }

  const dirs = fs.readdirSync(TEMPLATES_ROOT)
    .filter(d => fs.statSync(path.join(TEMPLATES_ROOT, d)).isDirectory());

  console.log(`🔨 Compilando templates...\n`);

  let compiled = 0;
  let skipped  = 0;

  for (const dir of dirs) {
    const templateDir = path.join(TEMPLATES_ROOT, dir);
    try {
      const output = compile(templateDir);
      if (output) {
        console.log(`✓ ${dir} → template.txt`);
        compiled++;
      } else {
        console.log(`⏭  ${dir} → sin src/, saltando`);
        skipped++;
      }
    } catch (err) {
      console.error(`❌ ${dir}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  console.log(`\n✅ ${compiled} compilados, ${skipped} salteados`);
}

main();
