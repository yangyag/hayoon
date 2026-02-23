import { LETTERS } from "./data/letterCatalog";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

function readArray(payload, candidates) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of candidates) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function normalizeEnabledFlag(item) {
  if (typeof item?.enabled === "boolean") {
    return item.enabled;
  }
  if (typeof item?.open === "boolean") {
    return item.open;
  }
  if (typeof item?.active === "boolean") {
    return item.active;
  }
  if (typeof item?.status === "string") {
    const status = item.status.toLowerCase();
    return status === "enabled" || status === "open" || status === "active";
  }
  return true;
}

function withApiBase(path) {
  if (!API_BASE_URL) {
    return path;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

function resolveImageUrl(imageUrl) {
  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
    return "";
  }
  const trimmed = imageUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return withApiBase(trimmed);
  }
  return trimmed;
}

async function fetchJson(url) {
  const response = await fetch(withApiBase(url), {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getLetters() {
  const payload = await fetchJson("/api/v1/letters");
  const rows = readArray(payload, ["items", "letters"]);

  const normalized = rows
    .map((item) => ({
      key: String(item?.key ?? item?.id ?? item?.letterKey ?? "").trim(),
      label: String(item?.label ?? item?.letter ?? item?.character ?? "").trim(),
      enabled: normalizeEnabledFlag(item)
    }))
    .filter((item) => item.key.length > 0);

  const byKey = new Map(normalized.map((item) => [item.key, item]));

  return LETTERS.map((base) => {
    const apiLetter = byKey.get(base.key);
    if (!apiLetter) {
      return { ...base, enabled: false };
    }

    return {
      key: base.key,
      label: apiLetter.label || base.label,
      enabled: apiLetter.enabled
    };
  });
}

export async function getLetterWords(letterKey) {
  const safeKey = encodeURIComponent(letterKey);
  const payload = await fetchJson(`/api/v1/letters/${safeKey}/words`);
  const rows = readArray(payload, ["items", "words"]);

  return rows
    .map((item, index) => ({
      id: String(item?.id ?? `${letterKey}-${index}`),
      word: String(item?.word ?? item?.label ?? "").trim(),
      imageUrl: resolveImageUrl(
        String(item?.imageUrl ?? item?.imagePath ?? item?.image ?? "").trim()
      )
    }))
    .filter((item) => item.word.length > 0);
}
