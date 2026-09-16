<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { jobs } from "../data/jobs";
const route = useRoute();
const job = computed(() => jobs.find(item => item.slug === route.params.slug));
</script>
<template>
  <div class="page">
    <header class="nav">
      <router-link to="/" class="brand">CAREER</router-link>
      <nav><router-link to="/">Home</router-link><router-link to="/careers">Open positions</router-link></nav>
    </header>
    <main class="container content">
      <router-link to="/careers" class="back">← Back to listing</router-link>
      <template v-if="job">
        <p class="eyebrow">{{ job.department }}</p><h1>{{ job.title }}</h1><p class="meta">{{ job.location }} · {{ job.type }}</p>
        <div class="detail">
          <article><h2>About the role</h2><p>{{ job.description }}</p><h2>Responsibilities</h2><ul><li v-for="x in job.responsibilities" :key="x">{{ x }}</li></ul><h2>Requirements</h2><ul><li v-for="x in job.requirements" :key="x">{{ x }}</li></ul></article>
          <aside><p class="eyebrow">INTERESTED?</p><h2>Ready to apply?</h2><p>Send us your details and resume.</p><router-link :to="`/apply/${job.slug}`" class="button">Apply for this role</router-link></aside>
        </div>
      </template>
      <h1 v-else>Position not found</h1>
    </main>
  </div>
</template>
