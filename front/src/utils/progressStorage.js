const PROGRESS_STORAGE_KEY = "hangulKid.v1.progress";
const SETTINGS_STORAGE_KEY = "hangulKid.v1.settings";
const SCHEMA_VERSION = 1;

const EMPTY_PROGRESS = Object.freeze({
  version: SCHEMA_VERSION,
  lastLetterKey: "",
  byLetter: {}
});

const EMPTY_SETTINGS = Object.freeze({
  version: SCHEMA_VERSION,
  ttsSupported: null
});

function isStorageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function toSafeObject(value) {
  return value && typeof value === "object" ? value : null;
}

function toNonNegativeInteger(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.floor(parsed));
}

function normalizeLetterEntry(entry) {
  const payload = toSafeObject(entry);
  const lastWordIdRaw = payload?.lastWordId;
  const lastWordId =
    typeof lastWordIdRaw === "string" && lastWordIdRaw.trim().length > 0
      ? lastWordIdRaw.trim()
      : null;

  return {
    lastWordId,
    seenCount: toNonNegativeInteger(payload?.seenCount)
  };
}

function cloneEmptyProgress() {
  return {
    version: SCHEMA_VERSION,
    lastLetterKey: "",
    byLetter: {}
  };
}

function cloneEmptySettings() {
  return {
    version: SCHEMA_VERSION,
    ttsSupported: null
  };
}

function readRawFromStorage(key) {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeRawToStorage(key, value) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // Ignore quota/privacy mode failures and continue with in-memory defaults.
  }
}

function parseJson(rawValue) {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
}

function normalizeProgress(value) {
  const payload = toSafeObject(value);
  if (!payload) {
    return cloneEmptyProgress();
  }

  const rawVersion = Number(payload.version);
  if (Number.isFinite(rawVersion) && rawVersion > SCHEMA_VERSION) {
    return cloneEmptyProgress();
  }

  const byLetterInput = toSafeObject(payload.byLetter) ?? {};
  const byLetter = {};

  for (const [key, rawEntry] of Object.entries(byLetterInput)) {
    if (typeof key !== "string" || key.trim().length === 0) {
      continue;
    }
    byLetter[key] = normalizeLetterEntry(rawEntry);
  }

  const lastLetterKey =
    typeof payload.lastLetterKey === "string" ? payload.lastLetterKey.trim() : "";

  return {
    version: SCHEMA_VERSION,
    lastLetterKey,
    byLetter
  };
}

function normalizeSettings(value) {
  const payload = toSafeObject(value);
  if (!payload) {
    return cloneEmptySettings();
  }

  const rawVersion = Number(payload.version);
  if (Number.isFinite(rawVersion) && rawVersion > SCHEMA_VERSION) {
    return cloneEmptySettings();
  }

  return {
    version: SCHEMA_VERSION,
    ttsSupported: typeof payload.ttsSupported === "boolean" ? payload.ttsSupported : null
  };
}

export function readProgressState() {
  const raw = readRawFromStorage(PROGRESS_STORAGE_KEY);
  const parsed = parseJson(raw);
  return normalizeProgress(parsed ?? EMPTY_PROGRESS);
}

export function writeProgressState(progress) {
  const normalized = normalizeProgress(progress);
  writeRawToStorage(PROGRESS_STORAGE_KEY, JSON.stringify(normalized));
}

export function readLetterProgress(letterKey) {
  if (typeof letterKey !== "string" || letterKey.trim().length === 0) {
    return normalizeLetterEntry(null);
  }

  const state = readProgressState();
  return normalizeLetterEntry(state.byLetter[letterKey]);
}

export function saveLetterProgress(letterKey, entry) {
  if (typeof letterKey !== "string" || letterKey.trim().length === 0) {
    return;
  }

  const state = readProgressState();
  const nextState = {
    ...state,
    lastLetterKey: letterKey,
    byLetter: {
      ...state.byLetter,
      [letterKey]: normalizeLetterEntry(entry)
    }
  };
  writeProgressState(nextState);
}

export function saveLastLetterKey(letterKey) {
  if (typeof letterKey !== "string" || letterKey.trim().length === 0) {
    return;
  }

  const state = readProgressState();
  if (state.lastLetterKey === letterKey) {
    return;
  }

  writeProgressState({
    ...state,
    lastLetterKey: letterKey
  });
}

export function readSettingsState() {
  const raw = readRawFromStorage(SETTINGS_STORAGE_KEY);
  const parsed = parseJson(raw);
  return normalizeSettings(parsed ?? EMPTY_SETTINGS);
}

export function writeSettingsState(settings) {
  const normalized = normalizeSettings(settings);
  writeRawToStorage(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
}

export function saveTtsSupport(ttsSupported) {
  const state = readSettingsState();
  writeSettingsState({
    ...state,
    ttsSupported: Boolean(ttsSupported)
  });
}

