// Đổi mã ngôn ngữ (ISO 639-1 "en", ISO 639-2 "eng", hoặc "en-US") sang tên đầy đủ.
// Sách trong thư viện được nhập từ Open Library nên thường dùng mã 3 ký tự.

const LANGUAGE_NAMES: Record<string, string> = {
  // ISO 639-1
  ar: "Arabic",
  bg: "Bulgarian",
  bn: "Bengali",
  ca: "Catalan",
  cs: "Czech",
  cy: "Welsh",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  eo: "Esperanto",
  es: "Spanish",
  et: "Estonian",
  eu: "Basque",
  fa: "Persian",
  fi: "Finnish",
  fr: "French",
  ga: "Irish",
  gl: "Galician",
  he: "Hebrew",
  hi: "Hindi",
  hr: "Croatian",
  hu: "Hungarian",
  hy: "Armenian",
  id: "Indonesian",
  is: "Icelandic",
  it: "Italian",
  ja: "Japanese",
  ka: "Georgian",
  kk: "Kazakh",
  ko: "Korean",
  la: "Latin",
  lt: "Lithuanian",
  lv: "Latvian",
  mk: "Macedonian",
  ms: "Malay",
  nl: "Dutch",
  no: "Norwegian",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovenian",
  sq: "Albanian",
  sr: "Serbian",
  sv: "Swedish",
  sw: "Swahili",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  ur: "Urdu",
  vi: "Vietnamese",
  yi: "Yiddish",
  zh: "Chinese",

  // ISO 639-2 / MARC (dữ liệu cũ dùng mã 3 ký tự)
  ara: "Arabic",
  bul: "Bulgarian",
  chi: "Chinese",
  zho: "Chinese",
  cze: "Czech",
  ces: "Czech",
  dan: "Danish",
  dut: "Dutch",
  nld: "Dutch",
  eng: "English",
  est: "Estonian",
  fin: "Finnish",
  fre: "French",
  fra: "French",
  ger: "German",
  deu: "German",
  gre: "Greek",
  ell: "Greek",
  heb: "Hebrew",
  hin: "Hindi",
  hun: "Hungarian",
  ice: "Icelandic",
  isl: "Icelandic",
  ita: "Italian",
  jpn: "Japanese",
  kor: "Korean",
  lat: "Latin",
  lit: "Lithuanian",
  nor: "Norwegian",
  per: "Persian",
  fas: "Persian",
  pol: "Polish",
  por: "Portuguese",
  rum: "Romanian",
  ron: "Romanian",
  rus: "Russian",
  slo: "Slovak",
  slk: "Slovak",
  spa: "Spanish",
  swe: "Swedish",
  tha: "Thai",
  tur: "Turkish",
  ukr: "Ukrainian",
  urd: "Urdu",
  vie: "Vietnamese",
  wel: "Welsh",
  cym: "Welsh",
  yid: "Yiddish",
};

/**
 * Trả về tên ngôn ngữ hiển thị được cho người dùng.
 * Không nhận ra mã thì trả lại chính mã đó (viết hoa chữ đầu) để không mất dữ liệu.
 */
export const getLanguageName = (code?: string | null): string => {
  const raw = (code ?? "").trim();

  if (!raw) return "Unknown";

  const normalized = raw.toLowerCase().replace(/_/g, "-");
  const direct = LANGUAGE_NAMES[normalized];

  if (direct) return direct;

  // "en-US" → thử phần ngôn ngữ, sau đó để Intl xử lý.
  const base = normalized.split("-")[0];

  if (LANGUAGE_NAMES[base]) return LANGUAGE_NAMES[base];

  try {
    const display = new Intl.DisplayNames(["en"], { type: "language" }).of(base);

    if (display && display.toLowerCase() !== base) return display;
  } catch {
    // Intl không hỗ trợ mã này (hoặc runtime thiếu ICU) → rơi xuống fallback.
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1);
};
