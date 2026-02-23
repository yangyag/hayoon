const KOREAN_LANGUAGE = "ko-KR";

function getSynthesis() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.speechSynthesis ?? null;
}

function pickVoice(voices) {
  if (!Array.isArray(voices) || voices.length === 0) {
    return null;
  }

  const exactMatch = voices.find(
    (voice) => typeof voice.lang === "string" && voice.lang.toLowerCase() === KOREAN_LANGUAGE.toLowerCase()
  );
  if (exactMatch) {
    return exactMatch;
  }

  return (
    voices.find(
      (voice) => typeof voice.lang === "string" && voice.lang.toLowerCase().startsWith("ko")
    ) ?? null
  );
}

export function isTtsSupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined" &&
    Boolean(getSynthesis())
  );
}

export function stopSpeaking() {
  const synthesis = getSynthesis();
  if (!synthesis) {
    return;
  }

  synthesis.cancel();
}

export function speakWord(word) {
  if (!isTtsSupported()) {
    return false;
  }

  const text = typeof word === "string" ? word.trim() : "";
  if (text.length === 0) {
    return false;
  }

  const synthesis = getSynthesis();
  if (!synthesis) {
    return false;
  }

  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = KOREAN_LANGUAGE;

  const voice = pickVoice(synthesis.getVoices());
  if (voice) {
    utterance.voice = voice;
  }

  synthesis.cancel();
  synthesis.speak(utterance);
  return true;
}

