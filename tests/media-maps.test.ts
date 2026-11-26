import { test } from "node:test";
import assert from "node:assert/strict";
import { MEDIA_KEY_PATTERN, mediaUrl } from "../lib/media.ts";
import { mapEmbedFromInput, mapsLink, safeMapUrl } from "../lib/maps.ts";

test("mediaUrl uses the media domain when set, the /media route otherwise", () => {
  assert.equal(mediaUrl("projects/a/photos/001.webp", "https://media.example.com/"), "https://media.example.com/projects/a/photos/001.webp");
  assert.equal(mediaUrl("projects/a/photos/001.webp"), "/media/projects/a/photos/001.webp");
  assert.equal(mediaUrl(null), null);
  assert.equal(mediaUrl(""), null);
});

test("only upload keys are servable: never backups or trash", () => {
  assert.ok(MEDIA_KEY_PATTERN.test("projects/light-logistics/photos/2026-11-26-abc123.webp"));
  assert.ok(MEDIA_KEY_PATTERN.test("site/pages/about-story-image/2026-11-26-abc123.jpg"));
  assert.ok(!MEDIA_KEY_PATTERN.test("backups/d1/production/2026-11-26-11-03.sql.gz"));
  assert.ok(!MEDIA_KEY_PATTERN.test("trash/2026-11-26/projects/a/photos/001.webp"));
  assert.ok(!MEDIA_KEY_PATTERN.test("projects/../backups/x.webp"));
  assert.ok(!MEDIA_KEY_PATTERN.test("projects/a/photo.exe"));
});

test("safeMapUrl allows Google Maps over https only", () => {
  assert.ok(safeMapUrl("https://www.google.com/maps/embed?pb=!1m18"));
  assert.ok(safeMapUrl("https://www.google.com.eg/maps/embed?pb=!1m18"));
  assert.ok(safeMapUrl("https://maps.google.co.uk/maps?q=x&output=embed"));
  assert.equal(safeMapUrl("http://www.google.com/maps/embed?pb=x"), null);
  assert.equal(safeMapUrl("https://evil.example/maps/embed"), null);
  assert.equal(safeMapUrl("https://google.com.evil.example/maps"), null);
  assert.equal(safeMapUrl("javascript:alert(1)"), null);
});

test("mapEmbedFromInput accepts Google's embed code or its address", () => {
  const src = "https://www.google.com/maps/embed?pb=!1m18!2sMCC";
  assert.equal(mapEmbedFromInput(`<iframe src="${src}" width="600"></iframe>`), src);
  assert.equal(mapEmbedFromInput(src), src);
  assert.equal(mapEmbedFromInput("   "), "");
  assert.equal(mapEmbedFromInput("https://maps.app.goo.gl/abc"), null);
});

test("mapsLink opens the pinned place, else the address", () => {
  const embed = "https://www.google.com/maps/embed?pb=!1m18!1s0x14583d:0x1a2b!2sMCC";
  assert.equal(mapsLink({ mapEmbedUrl: embed, address: "" }), `https://www.google.com/maps?cid=${0x1a2b}`);
  assert.equal(mapsLink({ mapEmbedUrl: "", address: "90th Street, New Cairo" }), "https://www.google.com/maps/search/?api=1&query=90th%20Street%2C%20New%20Cairo");
  assert.equal(mapsLink({ mapEmbedUrl: "", address: " " }), null);
});
