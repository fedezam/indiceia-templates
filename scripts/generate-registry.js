import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TEMPLATES_DIR = path.join(ROOT, "public/templates");
const OUTPUT = path.join(TEMPLATES_DIR, "registry.json");

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function scanTemplates() {
  const out = {};

  const dirs = fs
    .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const dir of dirs) {
    const id = dir.name;
    const base = path.join(TEMPLATES_DIR, id);

    const metadataPath = path.join(base, "metadata.json");
    if (!fs.existsSync(metadataPath)) continue;

    const metadata = readJSON(metadataPath);

    const previewsDir = path.join(base, "previews");
    const previews = {};

    if (fs.existsSync(previewsDir)) {
      for (const file of fs.readdirSync(previewsDir)) {
        const rel = `/templates/${id}/previews/${file}`;

        if (file.endsWith(".html")) previews.html = rel;
        else if (file.endsWith(".jsx")) previews.jsx = rel;
        else if (file.match(/\.(png|jpg|jpeg|webp)$/)) previews.image = rel;
      }
    }

    out[id] = {
      id,
      version: metadata.version,
      tier: metadata.tier,

      paths: {
        preview_jsx: `/templates/${id}/component.jsx`,
        runtime_html: `/templates/${id}/runtime.html`
      },

      previews,
      metadata
    };
  }

  return out;
}

const registry = {
  generated_at: new Date().toISOString(),
  templates: scanTemplates()
};

fs.writeFileSync(OUTPUT, JSON.stringify(registry, null, 2));
console.log("✔ registry.json generado");

