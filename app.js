"use strict";

const DEBOUNCE_MS = 300;
const TOAST_MS = 1600;

// No text or background colors on purpose: the mail client decides them for light and dark mode.
// Only the accent, the borders and the logo cell are fixed. A translucent gray border blends
// into whatever background the client uses; Outlook desktop ignores rgba and uses the solid fallback.
const COLOR_ACCENT = "#02898d";
const COLOR_BORDER_FALLBACK = "#d1d4d7";
const COLOR_BORDER = "rgba(128,128,128,0.23)";
const LOGO_BASE = "https://datadise.com/images/";
const LOGO_TILES = {
  accent: { bg: COLOR_ACCENT, src: `${LOGO_BASE}ddmono.png` },
  black: { bg: "#101213", src: `${LOGO_BASE}dddark.png` },
  white: { bg: "#ffffff", src: `${LOGO_BASE}ddlight.png` },
};

const form = document.getElementById("signature-form");
const preview = document.getElementById("preview");
const previewPanel = document.getElementById("preview-panel");
const previewThemeSwitch = document.getElementById("preview-theme-switch");
const toast = document.getElementById("toast");
const codeDialog = document.getElementById("code-dialog");
const codeDialogCode = document.getElementById("code-dialog-code");

let currentHtml = "";
let currentText = "";

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

function polishPhoneDigits(value) {
  let digits = String(value).replace(/\D/g, "");
  if (digits.startsWith("48")) digits = digits.slice(2);
  return digits.slice(0, 9);
}

function formatPhone(value) {
  const digits = polishPhoneDigits(value);
  const groups = [];
  for (let i = 0; i < digits.length; i += 3) {
    groups.push(digits.slice(i, i + 3));
  }
  return groups.length ? `+48 ${groups.join(" ")}` : "+48";
}

function phoneTelHref(value) {
  const digits = polishPhoneDigits(value);
  return digits ? `tel:+48${digits}` : "tel:+48";
}

function debounce(fn, ms) {
  let timer;
  const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
  debounced.flush = () => {
    clearTimeout(timer);
    fn();
  };
  return debounced;
}

// Placeholders double as the default values, so the HTML is the single source of truth.
function readValues() {
  const values = {};
  for (const input of form.elements) {
    if (!input.name) continue;
    if (input.type === "radio") {
      if (input.checked) values[input.name] = input.value;
      continue;
    }
    values[input.name] = input.value.trim() || input.placeholder;
  }
  return values;
}

function buildSignatureHtml({ name, title, phone, email, logoTile }) {
  const tile = LOGO_TILES[logoTile];
  const safeName = escapeHtml(name.toLocaleUpperCase("pl"));
  const safeTitle = escapeHtml(title.toLocaleUpperCase("pl"));
  const safePhone = escapeHtml(formatPhone(phone));
  const safeEmail = escapeHtml(email);

  const border = `border:1px solid ${COLOR_BORDER_FALLBACK};border-color:${COLOR_BORDER};`;
  const legalCell = `padding:10px;vertical-align:top;font-size:7.5pt;line-height:1.45;`;
  const legal = `${legalCell}${border}`;
  const divider = `border:0;border-right:1px solid ${COLOR_BORDER_FALLBACK};border-right-color:${COLOR_BORDER};`;
  const link = (weight) =>
    `color:${COLOR_ACCENT} !important;text-decoration:none !important;font-weight:${weight} !important;`;
  const cols = '<col style="width:5%">'.repeat(20);

  return [
    `<table role="presentation" width="368" cellspacing="0" cellpadding="0" style="width:100%;max-width:368px;border-collapse:collapse;table-layout:fixed;font-family:Inter,Arial,sans-serif;">`,
    `<colgroup>${cols}</colgroup>`,
    `<tr>`,
    `<td colspan="12" style="padding:10px;vertical-align:middle;${border}">`,
    `<p style="margin:0;line-height:1.2;"><strong style="font-size:12pt;color:${COLOR_ACCENT};">${safeName}</strong></p>`,
    `</td>`,
    `<td colspan="8" valign="middle" bgcolor="${tile.bg}" style="padding:10px;vertical-align:middle;text-align:center;line-height:0;font-size:0;background-color:${tile.bg};${border}">`,
    `<a href="https://datadise.com/?utm_source=footer" style="text-decoration:none;">`,
    `<img src="${escapeHtml(tile.src)}" width="115" height="11" alt="Datadise" style="width:115px;height:auto;border:0;display:inline-block;vertical-align:middle;">`,
    `</a>`,
    `</td>`,
    `</tr>`,
    `<tr>`,
    `<td colspan="20" style="padding:10px;vertical-align:top;font-size:9pt;line-height:1.2;${border}">${safeTitle}</td>`,
    `</tr>`,
    `<tr>`,
    `<td colspan="20" style="padding:0;vertical-align:top;${border}">`,
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">`,
    `<tr>`,
    `<td style="padding:10px;vertical-align:top;font-size:9pt;line-height:1.2;white-space:nowrap;border:0;border-right:1px solid ${COLOR_BORDER_FALLBACK};border-right-color:${COLOR_BORDER};">`,
    `<a href="${phoneTelHref(phone)}" x-apple-data-detectors="false" style="color:inherit !important;text-decoration:none !important;font-weight:700 !important;">${safePhone}</a>`,
    `</td>`,
    `<td width="100%" style="padding:10px;vertical-align:top;font-size:9pt;line-height:1.2;border:0;">`,
    `<a href="mailto:${safeEmail}" style="${link(700)}">${safeEmail}</a>`,
    `</td>`,
    `</tr>`,
    `</table>`,
    `</td>`,
    `</tr>`,
    `<tr>`,
    `<td colspan="20" style="${legal}">`,
    `Szczegółowe informacje dotyczące przetwarzania danych osobowych oraz przysługujących Państwu praw znajdują się w naszej `,
    `<a href="https://datadise.com/privacy/" style="${link(400)}">Polityce Prywatności</a>. Kontakt: `,
    `<a href="mailto:rodo@datadise.com" style="${link(400)}">rodo@datadise.com</a>.`,
    `</td>`,
    `</tr>`,
    `<tr>`,
    `<td colspan="20" style="${legal}">`,
    `Ta wiadomość jest przeznaczona wyłącznie dla jej adresata i może zawierać poufne informacje. Jeśli nie są Państwo adresatem, wszelkie użycie, rozpowszechnianie lub kopiowanie tej wiadomości jest zabronione. Prosimy o jej usunięcie i poinformowanie o tym fakcie nadawcy.`,
    `</td>`,
    `</tr>`,
    `<tr>`,
    `<td colspan="20" style="${legal}">`,
    `Administratorem Państwa danych osobowych jest Datadise sp. z o.o. z siedzibą w Warszawie (02-532) przy ul. Rako&zwnj;wieckiej 3&zwnj;6.`,
    `</td>`,
    `</tr>`,
    `<tr>`,
    `<td colspan="20" style="padding:0;vertical-align:top;${border}">`,
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;table-layout:fixed;">`,
    `<colgroup>${'<col style="width:31.3333%">'.repeat(2)}<col style="width:37.3334%"></colgroup>`,
    `<tr>`,
    `<td style="${legalCell}${divider}">NIP: 5213960034</td>`,
    `<td style="${legalCell}${divider}">KRS: 0000&zwnj;959617</td>`,
    `<td style="${legalCell}border:0;">REGON: 5214&zwnj;95685</td>`,
    `</tr>`,
    `</table>`,
    `</td>`,
    `</tr>`,
    `</table>`,
  ].join("");
}

function buildSignatureText({ name, title, phone, email }) {
  return [name, title, `${formatPhone(phone)} | ${email}`, "Datadise"].join("\n");
}

function render() {
  const values = readValues();
  currentHtml = buildSignatureHtml(values);
  currentText = buildSignatureText(values);
  preview.innerHTML = currentHtml;
}

const scheduleRender = debounce(render, DEBOUNCE_MS);

// While the modal dialog is open, everything outside it is inert and covered by its backdrop.
function overlayHost() {
  return codeDialog.open ? codeDialog : document.body;
}

function copyViaSelection(node) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
  const ok = document.execCommand("copy");
  selection.removeAllRanges();
  if (!ok) throw new Error("execCommand copy failed");
}

function copyTextViaSelection(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.cssText = "position:fixed;left:-9999px;top:0;";
  overlayHost().append(textarea);
  try {
    textarea.select();
    if (!document.execCommand("copy")) throw new Error("execCommand copy failed");
  } finally {
    textarea.remove();
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.warn("Clipboard API failed, falling back to execCommand", error);
    copyTextViaSelection(text);
  }
}

function copyHtmlViaSelection(html) {
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-9999px;top:0;";
  holder.innerHTML = html;
  overlayHost().append(holder);
  try {
    copyViaSelection(holder);
  } finally {
    holder.remove();
  }
}

async function copyRichText() {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([currentHtml], { type: "text/html" }),
        "text/plain": new Blob([currentText], { type: "text/plain" }),
      }),
    ]);
  } catch (error) {
    console.warn("Clipboard API failed, falling back to execCommand", error);
    copyHtmlViaSelection(currentHtml);
  }
}

let toastTimer;
function showToast(message, isError = false) {
  const host = overlayHost();
  if (toast.parentElement !== host) host.append(toast);
  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), TOAST_MS);
}

const COPY_ACTIONS = {
  html: () => copyText(currentHtml),
  rich: copyRichText,
};

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  // The user may click "Kopiuj" before the debounce fires.
  scheduleRender.flush();
  try {
    await COPY_ACTIONS[button.dataset.copy]();
    showToast("Skopiowano!");
  } catch (error) {
    console.error(error);
    showToast("Nie udało się skopiować", true);
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-code]")) return;
  scheduleRender.flush();
  codeDialogCode.value = currentHtml;
  codeDialog.showModal();
  codeDialogCode.scrollTop = 0;
});

codeDialog.addEventListener("click", (event) => {
  if (event.target === codeDialog) codeDialog.close();
});

form.addEventListener("input", (event) => {
  if (event.target.type === "radio") scheduleRender.flush();
  else scheduleRender();
});
form.addEventListener("submit", (event) => event.preventDefault());

previewThemeSwitch.addEventListener("click", () => {
  const isLight = previewPanel.dataset.client !== "light";
  previewPanel.dataset.client = isLight ? "light" : "dark";
  previewThemeSwitch.setAttribute("aria-checked", String(isLight));
});

render();
