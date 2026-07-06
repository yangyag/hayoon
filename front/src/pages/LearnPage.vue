<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getLetterWords } from "../api";
import { findLetterLabel } from "../data/letterCatalog";
import {
  readLetterProgress,
  saveLastLetterKey,
  saveLetterProgress,
  saveTtsSupport
} from "../utils/progressStorage";
import { shuffle } from "../utils/shuffle";
import { isTtsSupported, speakWord, stopSpeaking } from "../utils/tts";

const EMPTY_CYCLE = {
  order: [],
  cursor: 0,
  current: null,
  lastWordId: null,
  seenCount: 0
};

function createShuffledOrder(sourceWords, lastWordId) {
  if (sourceWords.length === 0) {
    return [];
  }

  const order = shuffle(sourceWords);
  if (order.length > 1 && lastWordId && order[0]?.id === lastWordId) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

function buildInitialCycle(words, savedProgress) {
  const hasLastWord = words.some((item) => item.id === savedProgress.lastWordId);
  const safeCount = Math.max(0, Math.min(savedProgress.seenCount, words.length));

  return {
    ...EMPTY_CYCLE,
    lastWordId: hasLastWord ? savedProgress.lastWordId : null,
    seenCount: hasLastWord ? safeCount : 0
  };
}

const route = useRoute();
const router = useRouter();

const letterKey = computed(() => route.params.letterKey ?? "");
const letterLabel = computed(() => findLetterLabel(letterKey.value));
const currentWord = computed(() => cycle.value.current);

const words = ref([]);
const loading = ref(true);
const error = ref("");
const showIntro = ref(true);
const imageFailed = ref(false);
const cycle = ref({ ...EMPTY_CYCLE });
const ttsSupported = ref(false);
const ttsNotice = ref("");

// letterKey 변경/언마운트 시 진행 중 비동기 로드를 무효화하는 토큰 (React 의 active 플래그와 동등)
let loadToken = 0;

async function loadWords(key) {
  const token = ++loadToken;
  const savedProgress = readLetterProgress(key);
  saveLastLetterKey(key);

  loading.value = true;
  error.value = "";
  showIntro.value = true;
  cycle.value = { ...EMPTY_CYCLE };
  ttsNotice.value = "";

  try {
    const items = await getLetterWords(key);
    if (token !== loadToken) return;
    words.value = items;
    cycle.value = buildInitialCycle(items, savedProgress);
  } catch (loadError) {
    if (token !== loadToken) return;
    words.value = [];
    error.value = "단어를 불러오지 못했어요.";
    cycle.value = { ...EMPTY_CYCLE };
  } finally {
    if (token === loadToken) {
      loading.value = false;
    }
  }
}

function drawNextWord() {
  if (words.value.length === 0) {
    return;
  }

  const previous = cycle.value;
  let order = previous.order;
  let cursor = previous.cursor;

  if (order.length === 0 || cursor >= order.length) {
    order = createShuffledOrder(words.value, previous.lastWordId);
    cursor = 0;
  }

  const nextWord = order[cursor] ?? previous.current;
  const nextCursor = cursor + 1;
  const nextSeenCount = (previous.seenCount % words.value.length) + 1;

  cycle.value = {
    order,
    cursor: nextCursor,
    current: nextWord,
    lastWordId: nextWord?.id ?? previous.lastWordId,
    seenCount: nextSeenCount
  };
}

function handleNext() {
  stopSpeaking();
  ttsNotice.value = "";

  if (showIntro.value) {
    showIntro.value = false;
    drawNextWord();
    return;
  }
  drawNextWord();
}

function handleSpeak() {
  const ok = speakWord(cycle.value.current?.word ?? "");
  if (!ok) {
    ttsNotice.value = "읽어주기를 사용할 수 없어요.";
    return;
  }
  ttsNotice.value = "";
}

function handleSpeakLetter() {
  const ok = speakWord(letterLabel.value);
  if (!ok) {
    ttsNotice.value = "읽어주기를 사용할 수 없어요.";
    return;
  }
  ttsNotice.value = "";
}

onMounted(() => {
  const supported = isTtsSupported();
  ttsSupported.value = supported;
  saveTtsSupport(supported);
});

onUnmounted(() => {
  stopSpeaking();
  loadToken += 1;
});

watch(letterKey, (key) => {
  loadWords(key);
}, { immediate: true });

watch(() => cycle.value.current?.id, () => {
  imageFailed.value = false;
});

watch(
  [
    () => cycle.value.current?.id,
    () => cycle.value.lastWordId,
    () => cycle.value.seenCount,
    () => error.value,
    letterKey,
    () => showIntro.value
  ],
  () => {
    if (showIntro.value || !cycle.value.current?.id || Boolean(error.value)) {
      return;
    }
    saveLetterProgress(letterKey.value, {
      lastWordId: cycle.value.lastWordId,
      seenCount: cycle.value.seenCount
    });
  }
);
</script>

<template>
  <main class="page learn-page">
    <header class="top-nav">
      <button type="button" class="btn ghost" @click="router.push('/letters')">
        뒤로
      </button>
      <button type="button" class="btn ghost" @click="router.push('/')">
        홈
      </button>
    </header>

    <section class="panel learn-panel">
      <p v-if="loading" class="status-text">학습 카드를 준비하는 중...</p>
      <p v-if="!loading && error" class="status-text warning">{{ error }}</p>

      <article v-if="!loading && !error && showIntro" class="intro-card">
        <p class="intro-label">오늘의 글자</p>
        <button
          type="button"
          class="intro-letter intro-letter-btn"
          @click="handleSpeakLetter"
          :aria-label="`${letterLabel} 발음 듣기`"
        >
          {{ letterLabel }}
        </button>
        <p class="section-subtitle">버튼을 눌러 단어 놀이를 시작해요.</p>
      </article>

      <article v-if="!loading && !error && !showIntro" class="word-card">
        <div class="image-frame">
          <img
            v-if="currentWord?.imageUrl && !imageFailed"
            :src="currentWord?.imageUrl"
            :alt="currentWord?.word"
            @error="imageFailed = true"
          />
          <div v-else class="image-placeholder">이미지 준비 중</div>
        </div>
        <p class="word-text">
          <template v-if="currentWord?.word">
            <strong>{{ currentWord.word.slice(0, 1) }}</strong>{{ currentWord.word.slice(1) }}
          </template>
        </p>
        <div class="word-actions">
          <button
            type="button"
            class="btn ghost tts-btn"
            @click="handleSpeak"
            :disabled="!ttsSupported || !currentWord?.word"
          >
            읽어주기
          </button>
        </div>
        <p class="progress-text">
          {{ cycle.seenCount }} / {{ words.length }}
        </p>
      </article>

      <p v-if="!loading && !error && words.length === 0" class="status-text warning">
        아직 단어가 없어요.
      </p>
      <p v-if="!loading && !error && !ttsSupported" class="tts-status warning">
        이 브라우저는 읽어주기를 지원하지 않아요.
      </p>
      <p v-if="!loading && !error && ttsNotice" class="tts-status warning">
        {{ ttsNotice }}
      </p>

      <button
        type="button"
        class="btn primary giant"
        @click="handleNext"
        :disabled="loading || Boolean(error) || words.length === 0"
      >
        다음
      </button>
    </section>
  </main>
</template>
