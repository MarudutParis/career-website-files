<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../lib/supabase";

const route = useRoute();

const job = ref(null);
const isLoading = ref(true);
const error = ref("");

async function loadJob() {
  isLoading.value = true;
  error.value = "";

  const { data, error: fetchError } = await supabase
    .from("job_positions")
    .select("*")
    .eq("slug", route.params.slug)
    .eq("active", true)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to load job:", fetchError);
    error.value = "Failed to load this position.";
  } else {
    job.value = data;
  }

  isLoading.value = false;
}

function splitList(text) {
  if (!text) return [];

  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

onMounted(loadJob);
</script>

<template>
  <div class="page">
    <!-- NAVIGATION -->
    <header class="nav">
      <router-link to="/" class="brand"> CAREER </router-link>

      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/careers">Open positions</router-link>
      </nav>
    </header>

    <!-- CONTENT -->
    <main class="container content">
      <router-link to="/careers" class="back"> ← Back to listing </router-link>

      <!-- LOADING -->
      <div v-if="isLoading" class="state">Loading position...</div>

      <!-- ERROR -->
      <div v-else-if="error" class="state error">
        {{ error }}
      </div>

      <!-- POSITION NOT FOUND -->
      <div v-else-if="!job" class="not-found">
        <h1>Position not found</h1>

        <router-link to="/careers" class="back-link">
          ← Back to listing
        </router-link>
      </div>

      <!-- JOB DETAIL -->
      <template v-else>
        <!-- JOB HEADER -->
        <section class="job-header">
          <p class="department">
            {{ job.department }}
          </p>

          <h1>
            {{ job.title }}
          </h1>

          <p class="meta">
            {{ job.location }}
            ·
            {{ job.employment_type }}
          </p>
        </section>

        <!-- MAIN GRID -->
        <section class="job-layout">
          <!-- LEFT -->
          <div class="job-content">
            <section>
              <h2>About the role</h2>

              <p>
                {{ job.description }}
              </p>
            </section>

            <section>
              <h2>Responsibilities</h2>

              <ul>
                <li v-for="item in splitList(job.responsibilities)" :key="item">
                  {{ item }}
                </li>
              </ul>
            </section>

            <section>
              <h2>Requirements</h2>

              <ul>
                <li v-for="item in splitList(job.requirements)" :key="item">
                  {{ item }}
                </li>
              </ul>
            </section>
          </div>

          <!-- RIGHT -->
          <aside class="apply-card">
            <p class="apply-eyebrow">INTERESTED?</p>

            <h2>Ready to apply?</h2>

            <p>Send us your details and resume.</p>

            <router-link :to="`/apply/${job.slug}`" class="apply-button">
              Apply for this role
            </router-link>
          </aside>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f6f2;
  color: #14231e;
}

/* =========================
   NAVIGATION
========================= */

.nav {
  max-width: 960px;
  height: 84px;
  margin: 0 auto;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #deded8;
}

.brand {
  color: #14231e;
  text-decoration: none;

  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

nav {
  display: flex;
  gap: 28px;
}

nav a {
  color: #355047;
  text-decoration: none;
  font-size: 14px;
}

nav a:hover {
  color: #286b5b;
}

/* =========================
   CONTAINER
========================= */

.container {
  max-width: 960px;
  margin: 0 auto;
}

.content {
  padding: 58px 0 100px;
}

.back {
  color: #4e6860;
  text-decoration: none;
  font-size: 14px;
}

.back:hover {
  color: #286b5b;
}

/* =========================
   JOB HEADER
========================= */

.job-header {
  padding-top: 100px;
  padding-bottom: 52px;
}

.department {
  margin: 0 0 24px;

  color: #286b5b;

  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.job-header h1 {
  margin: 0;

  color: #14231e;

  font-family: Georgia, "Times New Roman", serif;
  font-size: 68px;
  font-weight: 500;
  line-height: 1.05;
}

.meta {
  margin: 20px 0 0;

  color: #587067;
  font-size: 16px;
}

/* =========================
   JOB LAYOUT
========================= */

.job-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  gap: 70px;
  align-items: start;
}

.job-content {
  min-width: 0;
}

.job-content section {
  margin-bottom: 48px;
}

.job-content h2 {
  margin: 0 0 24px;

  color: #14231e;

  font-size: 23px;
  font-weight: 700;
}

.job-content p {
  margin: 0;

  color: #5d7068;

  font-size: 16px;
  line-height: 1.8;
}

.job-content ul {
  margin: 0;
  padding-left: 22px;

  color: #5d7068;

  font-size: 16px;
  line-height: 1.9;
}

.job-content li {
  padding-left: 4px;
}

/* =========================
   APPLY CARD
========================= */

.apply-card {
  padding: 38px 28px;

  background: #edf0e9;
}

.apply-eyebrow {
  margin: 0 0 38px;

  color: #527068;

  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.apply-card h2 {
  margin: 0 0 20px;

  color: #14231e;

  font-size: 24px;
}

.apply-card p:not(.apply-eyebrow) {
  margin: 0 0 26px;

  color: #5d7068;

  font-size: 15px;
  line-height: 1.6;
}

.apply-button {
  display: inline-block;

  padding: 14px 21px;

  background: #286f5d;
  color: white;

  text-decoration: none;

  font-size: 14px;
  font-weight: 700;
}

.apply-button:hover {
  background: #205d4e;
}

/* =========================
   STATES
========================= */

.state {
  padding: 120px 0;

  color: #66766f;

  text-align: center;
}

.error {
  color: #b42318;
}

.not-found {
  padding-top: 110px;
}

.not-found h1 {
  margin: 0 0 30px;

  color: #14231e;

  font-family: Georgia, "Times New Roman", serif;
  font-size: 64px;
  font-weight: 500;
}

.back-link {
  color: #286b5b;
  text-decoration: none;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1000px) {
  .nav,
  .container {
    margin-left: 30px;
    margin-right: 30px;
  }
}

@media (max-width: 800px) {
  .job-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .apply-card {
    max-width: 400px;
  }

  .job-header h1 {
    font-size: 54px;
  }
}

@media (max-width: 600px) {
  .nav {
    height: 75px;
  }

  nav {
    gap: 15px;
  }

  .content {
    padding-top: 40px;
  }

  .job-header {
    padding-top: 70px;
  }

  .job-header h1 {
    font-size: 45px;
  }

  .not-found h1 {
    font-size: 45px;
  }
}
</style>
