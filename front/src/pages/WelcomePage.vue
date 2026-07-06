<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main class="page welcome-page">
    <div class="bg-orb orb-a" />
    <div class="bg-orb orb-b" />
    <div class="bg-orb orb-c" />

    <section class="panel welcome-panel">
      <p class="eyebrow">한글 놀이 시간</p>
      <h1 class="hero-title">하윤이 환영해~</h1>
      <p class="hero-subtitle">반짝이는 책장에서 가나다 여행을 시작해요.</p>
      <button
        type="button"
        class="btn primary giant"
        @click="router.push('/library')"
      >
        시작하기
      </button>
    </section>
  </main>
</template>
