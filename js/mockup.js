/* ===== mockup.js: product pictures drawn as SVG ===== */

// Colour options: hex = product colour, ink = readable text colour on it
const COLORS = {
  Black: { hex: "#15171c", ink: "#ffffff" },
  White: { hex: "#f4f4f4", ink: "#111111" },
  Navy:  { hex: "#1f2f56", ink: "#ffffff" },
  Red:   { hex: "#b3262e", ink: "#ffffff" },
  Olive: { hex: "#55603a", ink: "#ffffff" }
};

// Returns an SVG picture of the product with the design name printed on it
function productSvg(product, colorName, designText) {
  const c = COLORS[colorName] || COLORS.Black;
  const line = 'stroke="rgba(0,0,0,0.35)" stroke-width="2" stroke-linejoin="round"';

  // Shorten long design names so they fit on the product
  let raw = designText || "";
  if (raw.length > 14) raw = raw.slice(0, 13) + "\u2026";
  const size = raw.length > 10 ? 10 : 13;

  function printText(y) {
    if (raw === "") return "";
    return '<text x="100" y="' + y + '" text-anchor="middle" font-family="Inter, sans-serif" font-size="' + size + '" font-weight="600" fill="' + c.ink + '">' + escapeHtml(raw) + '</text>';
  }

  let shape = "";

  if (product === "Hoodie") {
    shape =
      '<path d="M72 30 L38 48 L14 130 L40 138 L55 95 L55 180 L145 180 L145 95 L160 138 L186 130 L162 48 L128 30 Q100 52 72 30 Z" fill="' + c.hex + '" ' + line + '/>' +
      '<path d="M70 32 Q100 -6 130 32 Q100 58 70 32 Z" fill="' + c.hex + '" ' + line + '/>' +
      '<path d="M80 140 L120 140 L126 165 L74 165 Z" fill="none" ' + line + '/>' +
      printText(112);
  } else if (product === "Tote bag") {
    shape =
      '<path d="M72 72 Q72 22 100 22 Q128 22 128 72" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M72 72 Q72 22 100 22 Q128 22 128 72" fill="none" stroke="' + c.hex + '" stroke-width="7" stroke-linecap="round"/>' +
      '<rect x="45" y="68" width="110" height="112" rx="5" fill="' + c.hex + '" ' + line + '/>' +
      printText(128);
  } else if (product === "Cap") {
    shape =
      '<path d="M42 118 Q42 48 100 48 Q158 48 158 118 Z" fill="' + c.hex + '" ' + line + '/>' +
      '<path d="M40 118 Q100 128 188 116 Q176 150 108 148 Q54 146 40 118 Z" fill="' + c.hex + '" ' + line + '/>' +
      '<circle cx="100" cy="48" r="5" fill="' + c.hex + '" ' + line + '/>' +
      printText(92);
  } else {
    // T-shirt (default)
    shape =
      '<path d="M70 25 L40 40 L12 75 L38 95 L55 80 L55 175 L145 175 L145 80 L162 95 L188 75 L160 40 L130 25 Q100 48 70 25 Z" fill="' + c.hex + '" ' + line + '/>' +
      printText(105);
  }

  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + escapeHtml(product) + ' preview">' + shape + '</svg>';
}