import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import JobsView from "../views/JobsView.vue";
import JobDetailView from "../views/JobDetailView.vue";
import ApplyView from "../views/ApplyView.vue";

import AdminOpenPositionsView from "../views/AdminOpenPositionsView.vue";
import AdminPositionFormView from "../views/AdminPositionFormView.vue";

import AdminApplicantsView from "../views/AdminApplicantsView.vue";
import ApplicantDetailView from "../views/ApplicantDetailView.vue";
import AdminLoginView from "../views/AdminLoginView.vue";

import { supabase } from "../lib/supabase";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    /*
    |--------------------------------------------------------------------------
    | PUBLIC WEBSITE
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | ADMIN LOGIN
    |--------------------------------------------------------------------------
    */

    {
      path: "/admin/login",
      name: "admin-login",
      component: AdminLoginView,
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN OPEN POSITIONS
    |--------------------------------------------------------------------------
    */

    {
      path: "/admin/open-positions",
      name: "admin-open-positions",
      component: AdminOpenPositionsView,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/admin/open-positions/new",
      name: "admin-position-new",
      component: AdminPositionFormView,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/admin/open-positions/:id/edit",
      name: "admin-position-edit",
      component: AdminPositionFormView,
      meta: {
        requiresAuth: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN APPLICANTS
    |--------------------------------------------------------------------------
    */

    {
      path: "/admin/applicants",
      name: "admin-applicants",
      component: AdminApplicantsView,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/admin/applicants/:id",
      name: "admin-applicant-detail",
      component: ApplicantDetailView,
      meta: {
        requiresAuth: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | FALLBACK
    |--------------------------------------------------------------------------
    */

    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

/*
|--------------------------------------------------------------------------
| ADMIN AUTH GUARD
|--------------------------------------------------------------------------
*/

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      path: "/admin/login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  return true;
});

export default router;