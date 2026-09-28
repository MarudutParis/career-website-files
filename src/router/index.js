import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import JobsView from "../views/JobsView.vue";
import JobDetailView from "../views/JobDetailView.vue";
import ApplyView from "../views/ApplyView.vue";

import AdminOpenPositionsView from "../views/AdminOpenPositionsView.vue";
import AdminApplicantsView from "../views/AdminApplicantsView.vue";
import ApplicantDetailView from "../views/ApplicantDetailView.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    // Public website
    {
      path: "/",
      name: "home",
      component: HomeView,
    },

    {
      path: "/careers",
      name: "careers",
      component: JobsView,
    },

    {
      path: "/careers/:slug",
      name: "job-detail",
      component: JobDetailView,
    },

    {
      path: "/apply/:slug",
      name: "apply",
      component: ApplyView,
    },

    // Admin
    {
      path: "/admin/open-positions",
      name: "admin-open-positions",
      component: AdminOpenPositionsView,
    },

    {
      path: "/admin/applicants",
      name: "admin-applicants",
      component: AdminApplicantsView,
    },

    {
      path: "/admin/applicants/:id",
      name: "admin-applicant-detail",
      component: ApplicantDetailView,
    },

    // Fallback
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;