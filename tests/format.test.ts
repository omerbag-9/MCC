import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, lines, paragraphs, slugify, specRows } from "../lib/format.ts";

test("paragraphs split on blank lines and drop empty ones", () => {
  assert.deepEqual(paragraphs("One\nstill one\n\n  Two  \n\n\n"), ["One\nstill one", "Two"]);
  assert.deepEqual(paragraphs(""), []);
});

test("slugify makes safe, short URL parts", () => {
  assert.equal(slugify("Samir William Stores – Merghany"), "samir-william-stores-merghany");
  assert.equal(slugify("  Café  Déjà Vu!! "), "cafe-deja-vu");
  assert.equal(slugify("x".repeat(200)).length, 80);
});

test("escapeHtml escapes everything that matters in HTML", () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("lines trims, drops bullets and empty lines", () => {
  assert.deepEqual(lines("- One\r\n\n• Two\n * Three "), ["One", "Two", "Three"]);
});

test("specRows reads 'Label: value' lines", () => {
  assert.deepEqual(specRows("Area: 1,200 m²\nTime: 10:30\nNo label"), [
    ["Area", "1,200 m²"],
    ["Time", "10:30"],
    ["", "No label"],
  ]);
});
