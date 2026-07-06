<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getLetters } from "../api";
import { LETTERS } from "../data/letterCatalog";

const router = useRouter();

const letters = ref(LETTERS.map((item) => ({ ...item, enabled: false })));
const loading = ref(true);
const error = ref("");
const notice = ref("");

let noticeTimeoutId = null;
let active = true;

function showSoonMessage() {
  notice.value = "곧 열려요";
  if (noticeTimeoutId) {
    window.clearTimeout(noticeTimeoutId);
  }
  noticeTimeoutId = window.setTimeout(() => {
    notice.value = "";
  }, 1400);
}

function handleLetterClick(letter) {
  if (letter.enabled) {
    router.push(`/learn/${letter.key}`);
    return;
  }
  showSoonMessage();
}

async function loadLetters() {
  loading.value = true;
  error.value = "";

  try {
    const items = await getLetters();
    if (active) {
      letters.value = items;
    }
  } catch (loadError) {
    if (active) {
      error.value = "글자 목록을 불러오지 못했어요.";
      letters.value = LETTERS.map((item) => ({ ...item, enabled: false }));
    }
  } finally {
    if (active) {
      loading.value = false;
    }
  }
}

onMounted(() => {
  active = true;
  loadLetters();
});

onUnmounted(() => {
  active = false;
  if (noticeTimeoutId) {
    window.clearTimeout(noticeTimeoutId);
  }
});
</script>

<template>
  <main class="page letters-page">
    <header class="top-nav">
      <button type="button" class="btn ghost" @click="router.push('/library')">
        뒤로
      </button>
      <button type="button" class="btn ghost" @click="router.push('/')">
        홈
      </button>
    </header>

    <section class="panel letters-panel">
      <h1 class="section-title">어떤 글자를 배울까?</h1>
      <p class="section-subtitle">가~하 중에서 골라요.</p>

      <p v-if="loading" class="status-text">글자를 불러오는 중...</p>
      <p v-if="error" class="status-text warning">{{ error }}</p>

      <div class="letters-grid">
        <button
          v-for="letter in letters"
          :key="letter.key"
          type="button"
          :class="['letter-btn', letter.enabled ? 'enabled' : 'locked']"
          @click="handleLetterClick(letter)"
          :aria-disabled="!letter.enabled"
        >
          {{ letter.label }}
        </button>
      </div>

      <p class="soon-message" aria-live="polite">
        {{ notice }}
      </p>
    </section>
  </main>
</template>
