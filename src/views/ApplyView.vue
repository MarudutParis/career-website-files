<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { jobs } from "../data/jobs";
import { supabase } from "../lib/supabase";

const route = useRoute();

const job = computed(() =>
  jobs.find((item) => item.slug === route.params.slug),
);

const fullName = ref("");
const email = ref("");
const coverLetter = ref("");
const resume = ref(null);
const submitted = ref(false);
const error = ref("");
const isSubmitting = ref(false);

function chooseFile(e) {
  resume.value = e.target.files[0] || null;
}

async function submit() {
  error.value = "";

  if (!fullName.value || !email.value || !resume.value) {
    error.value = "Please complete your name, email, and resume.";
    return;
  }

  isSubmitting.value = true;

  const { error: databaseError } = await supabase.from("applications").insert({
    full_name: fullName.value.trim(),
    email: email.value.trim(),
    job_title: job.value?.title || "Unknown position",
    cover_letter: coverLetter.value.trim() || null,
    resume_url: null,
  });

  if (databaseError) {
    console.error(databaseError);
    error.value = "Failed to submit application. Please try again.";
    isSubmitting.value = false;
    return;
  }

  submitted.value = true;
  isSubmitting.value = false;
}
</script>
<template>
  <div class="page">
    <header class="nav">
      <router-link to="/" class="brand">CAREER</router-link>
      <nav>
        <router-link to="/">Home</router-link
        ><router-link to="/careers">Open positions</router-link>
      </nav>
    </header>
    <main class="container content">
      <router-link :to="job ? `/careers/${job.slug}` : '/careers'" class="back"
        >← Back to listing</router-link
      >
      <section v-if="!submitted">
        <p class="eyebrow">APPLY</p>
        <h1>{{ job?.title || "Job application" }}</h1>
        <p class="lead">
          Fill out the form below. We will get back to you within a week.
        </p>
        <form class="form" @submit.prevent="submit">
          <label
            >Full name<input v-model="fullName" placeholder="Jane Doe"
          /></label>
          <label
            >Email<input
              v-model="email"
              type="email"
              placeholder="jane@example.com"
          /></label>
          <label
            >Cover letter <span>(optional)</span
            ><textarea
              v-model="coverLetter"
              rows="6"
              placeholder="Tell us why you're a great fit..."
            ></textarea>
          </label>
          <label
            >Resume<input
              type="file"
              accept=".pdf,.doc,.docx"
              @change="chooseFile"
          /></label>
          <small>PDF, DOC, or DOCX. Max 5 MB.</small>
          <p v-if="error" class="error">{{ error }}</p>
          <button class="button">Submit application</button>
        </form>
      </section>
      <section v-else>
        <p class="eyebrow">APPLICATION RECEIVED</p>
        <h1>Thank you, {{ fullName }}.</h1>
        <p class="lead">Your application has been received in this demo.</p>
        <router-link to="/careers" class="button"
          >Back to positions</router-link
        >
      </section>
    </main>
  </div>
</template>
