<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../lib/supabase";

const route = useRoute();

/* =========================
   JOB
========================= */

const job = ref(null);
const isLoadingJob = ref(true);

/* =========================
   FORM
========================= */

const fullName = ref("");
const email = ref("");
const phone = ref("");
const coverLetter = ref("");
const resume = ref(null);

/* =========================
   STATE
========================= */

const submitted = ref(false);
const error = ref("");
const isSubmitting = ref(false);

/* =========================
   RESUME SETTINGS
========================= */

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const RESUME_BUCKET = import.meta.env.VITE_SUPABASE_RESUME_BUCKET || "resumes";

/* =========================
   LOAD JOB
========================= */

async function loadJob() {
  isLoadingJob.value = true;
  error.value = "";

  const slug = route.params.slug;

  if (!slug) {
    error.value = "No job position was specified.";
    isLoadingJob.value = false;
    return;
  }

  const { data, error: jobError } = await supabase
    .from("job_positions")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (jobError) {
    console.error("Failed to load job:", jobError);
    error.value = "Failed to load the selected job position.";
    isLoadingJob.value = false;
    return;
  }

  if (!data) {
    console.error("Job not found:", slug);
    error.value = "The selected job position could not be found.";
    isLoadingJob.value = false;
    return;
  }

  job.value = data;
  isLoadingJob.value = false;
}

/* =========================
   FILE SELECTION
========================= */

function chooseFile(event) {
  resume.value = event.target.files?.[0] || null;
  error.value = "";

  if (!resume.value) {
    return;
  }

  const allowedExtensions = ["pdf", "doc", "docx"];

  const extension = resume.value.name.split(".").pop()?.toLowerCase() || "";

  const validType =
    ALLOWED_TYPES.includes(resume.value.type) ||
    allowedExtensions.includes(extension);

  if (!validType) {
    error.value = "Please upload a PDF, DOC, or DOCX file.";

    resume.value = null;
    event.target.value = "";

    return;
  }

  if (resume.value.size > MAX_FILE_SIZE) {
    error.value = "Resume must be 5 MB or smaller.";

    resume.value = null;
    event.target.value = "";

    return;
  }
}

/* =========================
   SUBMIT APPLICATION
========================= */

async function submit() {
  error.value = "";

  /* -------------------------
     Basic validation
  ------------------------- */

  if (isLoadingJob.value) {
    error.value = "Please wait while the job position is loading.";
    return;
  }

  if (!job.value) {
    error.value = "The selected job position could not be found.";
    return;
  }

  if (!fullName.value.trim()) {
    error.value = "Please enter your full name.";
    return;
  }

  if (!email.value.trim()) {
    error.value = "Please enter your email.";
    return;
  }

  if (!resume.value) {
    error.value = "Please upload your resume.";
    return;
  }

  /* -------------------------
     Prevent double submit
  ------------------------- */

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  /* -------------------------
     Prepare file name
  ------------------------- */

  const extension = resume.value.name.split(".").pop()?.toLowerCase() || "pdf";

  const safeBaseName =
    resume.value.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "") || `resume.${extension}`;

  const filePath = `${Date.now()}-${safeBaseName}`;

  try {
    /* =========================
       1. UPLOAD RESUME
    ========================= */

    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(filePath, resume.value, {
        upsert: false,
        contentType: resume.value.type || undefined,
      });

    if (uploadError) {
      console.error("Resume upload error:", uploadError);

      error.value = "Failed to upload your resume. Please try again.";

      return;
    }

    /* =========================
       2. CREATE RESUME URL
    ========================= */

    const { data: publicUrlData } = supabase.storage
      .from(RESUME_BUCKET)
      .getPublicUrl(filePath);

    const resumeUrl = publicUrlData?.publicUrl;

    if (!resumeUrl) {
      console.error("Could not create resume URL.");

      error.value = "Failed to create the resume URL.";

      return;
    }

    /* =========================
       3. INSERT APPLICATION
    ========================= */

    const applicationData = {
      full_name: fullName.value.trim(),

      email: email.value.trim(),

      phone: phone.value.trim() || null,

      /*
       * Keep job_title for compatibility
       * with existing application records.
       */
      job_title: job.value.title,

      /*
       * IMPORTANT:
       * This is the new foreign key.
       */
      job_position_id: job.value.id,

      cover_letter: coverLetter.value.trim() || null,

      resume_url: resumeUrl,
    };

    console.log("Submitting application:", applicationData);

    const { error: databaseError } = await supabase
      .from("applications")
      .insert(applicationData);

    if (databaseError) {
      console.error("Database insert error:", databaseError);

      error.value = "Failed to submit the application. Please try again.";

      return;
    }

    /* =========================
       4. SUCCESS
    ========================= */

    submitted.value = true;
  } catch (err) {
    console.error("Unexpected application error:", err);

    error.value = "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}

/* =========================
   INITIAL LOAD
========================= */

onMounted(() => {
  loadJob();
});
</script>

<template>
  <div class="page">
    <!-- =========================
         NAVIGATION
    ========================== -->

    <header class="nav">
      <router-link to="/" class="brand"> CAREER </router-link>

      <nav>
        <router-link to="/"> Home </router-link>

        <router-link to="/careers"> Open positions </router-link>
      </nav>
    </header>

    <!-- =========================
         MAIN
    ========================== -->

    <main class="container content">
      <!-- Back -->
      <router-link :to="job ? `/careers/${job.slug}` : '/careers'" class="back">
        ← Back to listing
      </router-link>

      <!-- =========================
           LOADING
      ========================== -->

      <section v-if="isLoadingJob" class="loading">
        <p>Loading job position...</p>
      </section>

      <!-- =========================
           ERROR LOADING JOB
      ========================== -->

      <section v-else-if="!job" class="not-found">
        <p class="eyebrow">CAREERS</p>

        <h1>Position not found</h1>

        <p class="lead">
          {{ error || "The selected job position could not be found." }}
        </p>

        <router-link to="/careers" class="button">
          Back to positions
        </router-link>
      </section>

      <!-- =========================
           APPLICATION FORM
      ========================== -->

      <section v-else-if="!submitted">
        <p class="eyebrow">APPLY</p>

        <h1>
          {{ job.title }}
        </h1>

        <p class="job-meta">
          {{ job.location }}
          ·
          {{ job.employment_type }}
        </p>

        <p class="lead">
          Fill out the form below. We will get back to you within a week.
        </p>

        <!-- FORM -->

        <form class="form" @submit.prevent="submit">
          <!-- Full Name -->

          <label>
            Full name

            <input
              v-model="fullName"
              type="text"
              placeholder="Jane Doe"
              autocomplete="name"
            />
          </label>

          <!-- Email -->

          <label>
            Email

            <input
              v-model="email"
              type="email"
              placeholder="jane@example.com"
              autocomplete="email"
            />
          </label>

          <!-- Phone -->

          <label>
            Phone
            <span>(optional)</span>

            <input
              v-model="phone"
              type="tel"
              placeholder="+62..."
              autocomplete="tel"
            />
          </label>

          <!-- Cover Letter -->

          <label>
            Cover letter
            <span>(optional)</span>

            <textarea
              v-model="coverLetter"
              rows="6"
              placeholder="Tell us why you're a great fit..."
            ></textarea>
          </label>

          <!-- Resume -->

          <label>
            Resume

            <input
              type="file"
              accept="
                .pdf,
                .doc,
                .docx,
                application/pdf,
                application/msword,
                application/vnd.openxmlformats-officedocument.wordprocessingml.document
              "
              @change="chooseFile"
            />
          </label>

          <small> PDF, DOC, or DOCX. Max 5 MB. </small>

          <!-- Selected File -->

          <p v-if="resume" class="file-name">
            Selected:
            {{ resume.name }}
          </p>

          <!-- Error -->

          <p v-if="error" class="error">
            {{ error }}
          </p>

          <!-- Submit -->

          <button class="button" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Submitting..." : "Submit application" }}
          </button>
        </form>
      </section>

      <!-- =========================
           SUCCESS
      ========================== -->

      <section v-else>
        <p class="eyebrow">APPLICATION RECEIVED</p>

        <h1>Thank you, {{ fullName }}.</h1>

        <p class="lead">Your application has been received successfully.</p>

        <router-link to="/careers" class="button">
          Back to positions
        </router-link>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* =========================
   PAGE
========================= */

.page {
  min-height: 100vh;
  background: #f8f8f5;
  color: #17251f;
}

/* =========================
   NAV
========================= */

.nav {
  width: min(960px, calc(100% - 40px));
  margin: 0 auto;

  height: 82px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #dedfda;
}

.brand {
  color: #14231e;
  text-decoration: none;

  font-size: 18px;
  font-weight: 700;

  letter-spacing: 0.14em;
}

.nav nav {
  display: flex;
  gap: 28px;
}

.nav nav a {
  color: #36534a;
  text-decoration: none;

  font-size: 14px;
}

.nav nav a:hover {
  color: #16785a;
}

/* =========================
   CONTENT
========================= */

.content {
  width: min(960px, calc(100% - 40px));

  margin: 0 auto;

  padding: 55px 0 100px;
}

.back {
  display: inline-block;

  margin-bottom: 55px;

  color: #36534a;
  text-decoration: none;

  font-size: 14px;
}

.back:hover {
  color: #16785a;
}

/* =========================
   HEADINGS
========================= */

.eyebrow {
  margin: 0 0 20px;

  color: #16785a;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 0.18em;
}

h1 {
  margin: 0;

  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(48px, 7vw, 78px);

  line-height: 0.98;

  font-weight: 400;

  letter-spacing: -0.04em;
}

.job-meta {
  margin: 20px 0 0;

  color: #5f716a;

  font-size: 15px;
}

.lead {
  max-width: 650px;

  margin: 28px 0 0;

  color: #567069;

  font-size: 16px;

  line-height: 1.7;
}

/* =========================
   FORM
========================= */

.form {
  margin-top: 50px;

  padding: 34px;

  border: 1px solid #d9ddd8;

  background: #fff;
}

.form label {
  display: block;

  margin-bottom: 24px;

  color: #244139;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 0.12em;

  text-transform: uppercase;
}

.form label span {
  color: #718079;

  font-weight: 400;

  letter-spacing: 0;
}

.form input,
.form textarea {
  display: block;

  width: 100%;

  margin-top: 9px;

  padding: 14px 15px;

  border: 1px solid #d1d8d3;

  border-radius: 0;

  background: #fff;

  color: #17251f;

  font-family: inherit;

  font-size: 15px;

  box-sizing: border-box;
}

.form input {
  height: 48px;
}

.form textarea {
  resize: vertical;

  min-height: 150px;

  line-height: 1.6;
}

.form input:focus,
.form textarea:focus {
  outline: none;

  border-color: #277b61;

  box-shadow: 0 0 0 2px rgba(39, 123, 97, 0.08);
}

.form small {
  display: block;

  margin-top: -12px;
  margin-bottom: 15px;

  color: #718079;

  font-size: 13px;
}

.file-name {
  margin: 0 0 18px;

  color: #36534a;

  font-size: 14px;
}

/* =========================
   BUTTON
========================= */

.button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-height: 46px;

  padding: 0 24px;

  border: 0;

  background: #287660;

  color: white;

  text-decoration: none;

  font-family: inherit;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.button:hover {
  background: #1f634f;
}

.form .button {
  width: 100%;
  margin-top: 5px;
}

.button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* =========================
   ERROR
========================= */

.error {
  margin: 0 0 18px;

  color: #c62828;

  font-size: 14px;

  line-height: 1.5;
}

/* =========================
   LOADING
========================= */

.loading {
  padding: 100px 0;

  color: #61736b;

  font-size: 15px;
}

/* =========================
   NOT FOUND
========================= */

.not-found {
  padding: 40px 0;
}

.not-found .lead {
  margin-bottom: 30px;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 700px) {
  .nav {
    width: calc(100% - 32px);

    height: 70px;
  }

  .nav nav {
    gap: 15px;
  }

  .content {
    width: calc(100% - 32px);

    padding-top: 40px;
  }

  h1 {
    font-size: 52px;
  }

  .form {
    padding: 24px 20px;
  }
}

@media (max-width: 480px) {
  .nav {
    align-items: flex-start;

    padding: 20px 0;

    height: auto;
  }

  .nav nav {
    flex-direction: column;

    gap: 8px;
  }

  .content {
    padding-top: 35px;
  }

  h1 {
    font-size: 44px;
  }

  .back {
    margin-bottom: 40px;
  }
}
</style>
