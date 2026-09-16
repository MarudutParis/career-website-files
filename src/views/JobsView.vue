<script setup>
import { jobs } from "../data/jobs";
</script>
<template>
  <div class="page">
    <header class="nav">
      <router-link to="/" class="brand">CAREER</router-link>
      <nav><router-link to="/">Home</router-link><router-link to="/careers">Open positions</router-link></nav>
    </header>
    <main class="container content">
      <router-link to="/" class="back">← Back home</router-link>
      <p class="eyebrow">CAREERS</p><h1>Open positions</h1>
      <p class="lead">Find a role where you can learn, contribute, and grow.</p>
      <section class="jobs">
        <router-link v-for="job in jobs" :key="job.slug" :to="`/careers/${job.slug}`" class="job">
          <div><small>{{ job.department }}</small><h2>{{ job.title }}</h2><p>{{ job.location }} · {{ job.type }}</p></div><b>↗</b>
        </router-link>
      </section>
    </main>
  </div>
</template>
