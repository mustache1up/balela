import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "./components/LoginPage.vue";
import RoomPage from "./components/RoomPage.vue";
import GamePage from "./components/GamePage.vue";
import VotingPage from "./components/VotingPage.vue";

const routes = [
  { path: "/", component: LoginPage },
  { path: "/room", component: RoomPage },
  { path: "/game", component: GamePage },
  { path: "/voting", component: VotingPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
