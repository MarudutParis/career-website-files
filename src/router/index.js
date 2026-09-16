import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import JobsView from "../views/JobsView.vue";
import JobDetailView from "../views/JobDetailView.vue";
import ApplyView from "../views/ApplyView.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/careers", component: JobsView },
    { path: "/careers/:slug", component: JobDetailView },
    { path: "/apply/:slug", component: ApplyView }
  ]
});
