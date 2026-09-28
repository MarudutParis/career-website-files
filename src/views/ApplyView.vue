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
const phone = ref("");
const coverLetter = ref("");
const resume = ref(null);

const submitted = ref(false);
const error = ref("");
const isSubmitting = ref(false);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Set this in .env:
// VITE_SUPABASE_RESUME_BUCKET=YOUR_BUCKET_NAME
const RESUME_BUCKET = import.meta.env.VITE_SUPABASE_RESUME_BUCKET || "resumes";

console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Resume Bucket:", RESUME_BUCKET);

function chooseFile(event) {
  resume.value = event.target.files?.[0] || null;
  error.value = "";

  if (!resume.value) return;

  const allowedExtensions = ["pdf", "doc", "docx"];
  const extension = resume.value.name.split(".").pop()?.toLowerCase() || "";

  if (
    !ALLOWED_TYPES.includes(resume.value.type) &&
    !allowedExtensions.includes(extension)
  ) {
    error.value = "Please upload a PDF, DOC, or DOCX file.";
    resume.value = null;
    event.target.value = "";
    return;
  }

  if (resume.value.size > MAX_FILE_SIZE) {
    error.value = "Resume must be 5 MB or smaller.";
    resume.value = null;
    event.target.value = "";
  }
}

async function submit() {
  error.value = "";

  if (!fullName.value.trim() || !email.value.trim() || !resume.value) {
    error.value = "Please complete your name, email, and resume.";
    return;
  }

  if (!job.value) {
    error.value = "The selected job could not be found.";
    return;
  }

  isSubmitting.value = true;

  const extension = resume.value.name.split(".").pop()?.toLowerCase() || "pdf";

  const safeBaseName =
    resume.value.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "") || `resume.${extension}`;

  const filePath = `${Date.now()}-${safeBaseName}`;

  try {
    // 1. Upload the resume to Supabase Storage.
    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(filePath, resume.value, {
        upsert: false,
        contentType: resume.value.type || undefined,
      });

    if (uploadError) {
      console.error("Resume upload error:", uploadError);
      error.value =
        "Failed to upload your resume. Please check the Storage bucket and try again.";
      return;
    }

    // 2. Get the complete public URL.
    // This requires the Storage bucket to be PUBLIC.
    const { data: publicUrlData } = supabase.storage
      .from(RESUME_BUCKET)
      .getPublicUrl(filePath);

    const resumeUrl = publicUrlData?.publicUrl;

    if (!resumeUrl) {
      console.error("Could not create resume public URL.");
      await supabase.storage.from(RESUME_BUCKET).remove([filePath]);
      error.value = "Failed to create the resume URL.";
      return;
    }

    // 3. Save the application and the FULL resume URL in the database.
    const { error: databaseError } = await supabase
      .from("applications")
      .insert({
        full_name: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim() || null,
        job_title: job.value.title,
        cover_letter: coverLetter.value.trim() || null,
        resume_url: resumeUrl,
      });

    if (databaseError) {
      console.error("Database insert error:", databaseError);

      // Remove the uploaded file if the database insert failed.
      await supabase.storage.from(RESUME_BUCKET).remove([filePath]);

      error.value = "Failed to submit the application. Please try again.";
      return;
    }

    submitted.value = true;
  } catch (err) {
    console.error("Unexpected application error:", err);
    error.value = "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="page">
    <header class="nav">
      <router-link to="/" class="brand">CAREER</router-link>

      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/careers">Open positions</router-link>
      </nav>
    </header>

    <main class="container content">
      <router-link :to="job ? `/careers/${job.slug}` : '/careers'" class="back">
        ← Back to listing
      </router-link>

      <section v-if="!submitted">
        <p class="eyebrow">APPLY</p>

        <h1>{{ job?.title || "Job application" }}</h1>

        <p class="lead">
          Fill out the form below. We will get back to you within a week.
        </p>

        <form class="form" @submit.prevent="submit">
          <label>
            Full name
            <input
              v-model="fullName"
              placeholder="Jane Doe"
              autocomplete="name"
            />
          </label>

          <label>
            Email
            <input
              v-model="email"
              type="email"
              placeholder="jane@example.com"
              autocomplete="email"
            />
          </label>

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

          <label>
            Cover letter
            <span>(optional)</span>
            <textarea
              v-model="coverLetter"
              rows="6"
              placeholder="Tell us why you're a great fit..."
            ></textarea>
          </label>

          <label>
            Resume
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              @change="chooseFile"
            />
          </label>

          <small> PDF, DOC, or DOCX. Max 5 MB. </small>

          <p v-if="resume" class="file-name">Selected: {{ resume.name }}</p>

          <p v-if="error" class="error">
            {{ error }}
          </p>

          <button class="button" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Submitting..." : "Submit application" }}
          </button>
        </form>
      </section>

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
.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  margin-top: 8px;
}

.file-name {
  color: #374151;
  font-size: 14px;
}

label span {
  color: #6b7280;
  font-weight: normal;
}
</style>
