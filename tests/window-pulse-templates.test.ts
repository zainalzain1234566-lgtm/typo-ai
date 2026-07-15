import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const templates = readFileSync("src/lib/templates.ts", "utf8");
const registry = readFileSync("src/components/carousel/renderers/registry.ts", "utf8");

const paletteColors = [
  ["#161A22", "#FFF1A8"],
  ["#10221E", "#E8FFF5"],
  ["#28161A", "#FFF1E8"],
  ["#18202A", "#F5FAFF"],
  ["#021827", "#F4FBFF"],
  ["#11183A", "#F8FAFF"],
  ["#1B1438", "#F9F5FF"],
  ["#111A1D", "#F1FAF8"],
] as const;

function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

test("Window and Pulse are shared subject-image templates with four palettes", () => {
  for (const [id, name] of [["window", "نافذة"], ["pulse", "نبض"]]) {
    assert.match(
      templates,
      new RegExp(`id: "${id}"[\\s\\S]*?name: "${name}"[\\s\\S]*?component: "${id}"[\\s\\S]*?category: "shared"[\\s\\S]*?usesSubjectImages: true`),
    );
  }

  for (const name of [
    "ليلي ذهبي", "زمردي ضبابي", "نبيذي دافئ", "رمادي جليدي",
    "سماوي داكن", "نيلي كهربائي", "بنفسجي رقمي", "فحمي فيروزي",
  ]) {
    assert.match(templates, new RegExp(`name: "${name}"`));
  }

  for (const [background, text] of paletteColors) {
    assert.ok(contrast(background, text) >= 4.5, `${background}/${text} must meet 4.5:1 contrast`);
  }
});

test("Window and Pulse have focused registered renderers", () => {
  for (const [id, component] of [["window", "Window"], ["pulse", "Pulse"]]) {
    const path = `src/components/carousel/renderers/${id}.tsx`;
    assert.ok(existsSync(path), `${path} is missing`);
    assert.match(registry, new RegExp(`import \\{ ${component} \\} from "\\./${id}"`));
    assert.match(registry, new RegExp(`\\b${id}: ${component}`));
  }
});

test("Window renderer exposes the image, panel, placeholder, and editable text markers", () => {
  const path = "src/components/carousel/renderers/window.tsx";
  const source = existsSync(path) ? readFileSync(path, "utf8") : "";
  for (const token of [
    "BaseSlide", "TitleText", "BodyText", "templateLayoutProfile",
    "data-project-image", "data-window-panel", "data-window-placeholder",
  ]) {
    assert.match(source, new RegExp(token));
  }
  assert.match(source, /slide\.type === "cover"/);
  assert.match(source, /slide\.type === "ending"/);
});

test("Pulse renderer exposes its image frame, grid, placeholder, and editable text markers", () => {
  const path = "src/components/carousel/renderers/pulse.tsx";
  const source = existsSync(path) ? readFileSync(path, "utf8") : "";
  for (const token of [
    "BaseSlide", "TitleText", "BodyText", "templateLayoutProfile",
    "data-project-image", "data-pulse-grid", "data-pulse-image-frame", "data-pulse-placeholder",
    "data-pulse-comparison",
  ]) {
    assert.match(source, new RegExp(token));
  }
  assert.match(source, /slide\.type === "cover"/);
  assert.match(source, /slide\.type === "ending"/);
});

test("migration seeds Window and Pulse with eight palettes", () => {
  const path = "supabase/migrations/0024_seed_window_pulse_templates.sql";
  assert.ok(existsSync(path), `${path} is missing`);
  const sql = readFileSync(path, "utf8");

  assert.match(sql, /'window'[^;]*\b32\b[^;]*'shared'/i);
  assert.match(sql, /'pulse'[^;]*\b33\b[^;]*'shared'/i);
  for (const slug of ["window", "pulse"]) {
    const insert = Array.from(sql.matchAll(/INSERT INTO (?:public\.)?template_palettes[^;]*;/gi))
      .map((match) => match[0])
      .find((block) => new RegExp(`WHERE\\s+t\\.slug\\s*=\\s*'${slug}'`, "i").test(block));
    assert.ok(insert, `${slug} palette insert is missing`);
    assert.equal(insert.match(/\([^()]*#[\da-f]{6}[^()]*\)/gi)?.length, 4);
  }
});
