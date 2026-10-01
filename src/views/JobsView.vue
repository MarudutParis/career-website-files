<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../lib/supabase";

const jobs = ref([]);
const isLoading = ref(true);
const error = ref("");

async function loadJobs() {
  isLoading.value = true;
  error.value = "";

  const { data, error: fetchError } = await supabase
    .from("job_positions")
    .select("id, title, slug, department, location, employment_type")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Failed to load jobs:", fetchError);
    error.value = "Unable to load open positions.";
    jobs.value = [];
  } else {
    jobs.value = data || [];
  }

  isLoading.value = false;
}

onMounted(loadJobs);
</script>

<template>
  <div class="page">
    <!-- NAVBAR -->
    <header class="nav">
      <router-link to="/" class="brand"> CAREER </router-link>

      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/careers">Open positions</router-link>
      </nav>
    </header>

    <!-- CONTENT -->
    <main class="container content">
      <router-link to="/" class="back"> ← Back home </router-link>

      <section class="hero">
        <p class="eyebrow">CAREERS</p>

        <h1>Open positions</h1>

        <p class="lead">
          Find a role where you can learn, contribute, and grow.
        </p>
      </section>

      <!-- LOADING -->
      <div v-if="isLoading" class="state">Loading open positions...</div>

      <!-- ERROR -->
      <div v-else-if="error" class="state error">
        {{ error }}
      </div>

      <!-- NO JOBS -->
      <div v-else-if="jobs.length === 0" class="state">
        <h2>No open positions</h2>
        <p>There are currently no open positions available.</p>
      </div>

      <!-- JOB LIST -->
      <section v-else class="job-list">
        <router-link
          v-for="job in jobs"
          :key="job.id"
          :to="`/careers/${job.slug}`"
          class="job"
        >
          <div class="job-info">
            <p class="department">
              {{ job.department }}
            </p>

            <h2>
              {{ job.title }}
            </h2>

            <p class="meta">
              {{ job.location }}
              ·
              {{ job.employment_type }}
            </p>
          </div>

          <div class="arrow">↗</div>
        </router-link>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f6f2;
  color: #14231e;
}

.nav {
  max-width: 960px;
  height: 82px;
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

.container {
  max-width: 960px;
  margin: 0 auto;
}

.content {
  padding: 58px 0 90px;
}

.back {
  color: #4e6860;
  text-decoration: none;
  font-size: 14px;
}

.back:hover {
  color: #286b5b;
}

.hero {
  padding-top: 54px;
  padding-bottom: 50px;
  border-bottom: 1px solid #deded8;
}

.eyebrow {
  margin: 0 0 25px;
  color: #286b5b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

h1 {
  margin: 0;
  color: #14231e;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 72px;
  font-weight: 500;
  line-height: 1.05;
}

.lead {
  margin: 20px 0 0;
  color: #5d7068;
  font-size: 16px;
}

.job-list {
  display: flex;
  flex-direction: column;
}

.job {
  min-height: 158px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #deded8;
  color: inherit;
  text-decoration: none;
  transition: padding 0.2s ease;
}

.job:hover {
  padding-left: 8px;
}

.job-info {
  padding: 30px 0;
}

.department {
  margin: 0 0 10px;
  color: #286b5b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.job h2 {
  margin: 0;
  color: #14231e;
  font-size: 26px;
  font-weight: 700;
}

.meta {
  margin: 18px 0 0;
  color: #60736b;
  font-size: 15px;
}

.arrow {
  color: #286b5b;
  font-size: 28px;
  padding-right: 3px;
}

.state {
  padding: 70px 0;
  color: #66766f;
  text-align: center;
}

.state h2 {
  margin-bottom: 10px;
  color: #14231e;
}

.error {
  color: #b42318;
}

@media (max-width: 1000px) {
  .nav,
  .container {
    margin-left: 30px;
    margin-right: 30px;
  }
}

@media (max-width: 700px) {
  .content {
    padding-top: 40px;
  }

  h1 {
    font-size: 50px;
  }

  .job h2 {
    font-size: 22px;
  }

  .nav {
    height: 75px;
  }

  nav {
    gap: 16px;
  }
}
</style>
