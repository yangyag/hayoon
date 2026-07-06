<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main class="page library-page">
    <header class="top-nav">
      <button type="button" class="btn ghost" @click="router.push('/')">
        홈
      </button>
    </header>

    <section class="panel library-panel">
      <h1 class="section-title">책장을 열어볼까?</h1>
      <p class="section-subtitle">오늘은 가나다 한글 책 한 권!</p>

      <button
        type="button"
        class="book-card"
        @click="router.push('/letters')"
        aria-label="가나다 한글 책 열기"
      >
        <span class="book-spine">가나다</span>
        <span class="book-title">가나다 한글</span>
        <span class="book-hint">터치해서 시작</span>
      </button>
    </section>
  </main>
</template>
