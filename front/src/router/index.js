import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../pages/WelcomePage.vue";
import LibraryPage from "../pages/LibraryPage.vue";
import LettersPage from "../pages/LettersPage.vue";
import LearnPage from "../pages/LearnPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: WelcomePage },
    { path: "/library", component: LibraryPage },
    { path: "/letters", component: LettersPage },
    { path: "/learn/:letterKey", component: LearnPage },
    { path: "/:pathMatch(.*)*", redirect: "/" }
  ]
});
