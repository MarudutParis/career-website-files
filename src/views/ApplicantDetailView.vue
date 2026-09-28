<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const route = useRoute();
const router = useRouter();

const RESUME_BUCKET = import.meta.env.VITE_SUPABASE_RESUME_BUCKET || "resumes";

const applicant = ref(null);
const resumeUrl = ref(null);
const loading = ref(true);
const error = ref("");

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getResumeUrl(value) {
  if (!value) return null;

  // Correct format for new applications.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Backward compatibility for old rows that stored only
  // the Storage path or filename.
  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(value);

  return data?.publicUrl || null;
}

function getResumeName(value) {
  if (!value) return "No resume";

  try {
    const cleanValue = value.split("?")[0];
    const name = decodeURIComponent(cleanValue.split("/").pop() || "");
    return name || "Resume";
  } catch {
    return "Resume";
  }
}

function viewResume() {
  if (!resumeUrl.value) {
    window.alert("No resume is available for this applicant.");
    return;
  }

  window.open(resumeUrl.value, "_blank", "noopener,noreferrer");
}

async function loadApplicant() {
  loading.value = true;
  error.value = "";

  const applicantId = route.params.id;

  if (!applicantId) {
    error.value = "Applicant ID is missing.";
    loading.value = false;
    return;
  }

  const { data, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicantId)
    .single();

  if (fetchError) {
    console.error("Applicant fetch error:", fetchError);
    error.value = "Failed to load applicant.";
    loading.value = false;
    return;
  }

  applicant.value = data;
  resumeUrl.value = getResumeUrl(data.resume_url);
  loading.value = false;
}

onMounted(loadApplicant);
</script>

<template>
  <div class="admin-page">
    <aside class="sidebar">
      <div class="brand-area">
        <div class="brand-mark">RPC</div>
        <div>
          <strong>RPC</strong>
          <small>RECRUITMENT</small>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/open-positions"> Open Positions </router-link>

        <router-link to="/admin/applicants" class="active">
          Applicants
        </router-link>
      </nav>
    </aside>

    <main class="main">
      <button class="back-button" type="button" @click="router.back()">
        ← Back to Applicants
      </button>

      <p v-if="loading" class="state">Loading applicant...</p>

      <p v-else-if="error" class="state error">
        {{ error }}
      </p>

      <template v-else-if="applicant">
        <header class="page-header">
          <div>
            <h1>Applicant Detail</h1>
            <p>Review the information submitted by this applicant.</p>
          </div>

          <span class="status">New</span>
        </header>

        <section class="overview-card">
          <div class="avatar">
            {{ applicant.full_name?.charAt(0)?.toUpperCase() || "A" }}
          </div>

          <div class="overview-text">
            <h2>{{ applicant.full_name }}</h2>
            <p>{{ applicant.job_title || "Position not specified" }}</p>
            <small> Applied {{ formatDate(applicant.created_at) }} </small>
          </div>
        </section>

        <div class="grid">
          <section class="card">
            <div class="card-header">
              <h2>Personal Information</h2>
            </div>

            <div class="info-grid">
              <div>
                <span>Full Name</span>
                <strong>{{ applicant.full_name || "-" }}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{{ applicant.email || "-" }}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{{ applicant.phone || "-" }}</strong>
              </div>

              <div>
                <span>Position Applied</span>
                <strong>{{ applicant.job_title || "-" }}</strong>
              </div>

              <div>
                <span>Applied Date</span>
                <strong>{{ formatDate(applicant.created_at) }}</strong>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <h2>Resume</h2>
            </div>

            <div class="resume-box">
              <div class="document-icon">PDF</div>

              <div class="resume-info">
                <strong>
                  {{ getResumeName(applicant.resume_url) }}
                </strong>
                <span> Candidate resume / CV </span>
              </div>

              <button
                class="view-button"
                type="button"
                @click="viewResume"
                :disabled="!resumeUrl"
              >
                View CV
              </button>
            </div>
          </section>

          <section class="card cover-letter-card">
            <div class="card-header">
              <h2>Cover Letter</h2>
            </div>

            <p class="cover-letter">
              {{ applicant.cover_letter || "No cover letter provided." }}
            </p>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  background: #f5f7f8;
  color: #172033;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  padding: 28px 18px;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px 32px;
}

.brand-mark {
  font-weight: 800;
  color: #138a68;
}

.brand-area strong {
  display: block;
  font-size: 15px;
}

.brand-area small {
  display: block;
  font-size: 10px;
  color: #7b8494;
  letter-spacing: 0.08em;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
}

.sidebar-nav a {
  padding: 12px 14px;
  border-radius: 10px;
  color: #5b6473;
  text-decoration: none;
}

.sidebar-nav a.active,
.sidebar-nav a:hover {
  background: #eaf7f1;
  color: #11815f;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 40px;
}

.back-button {
  border: 0;
  background: transparent;
  color: #11815f;
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  font-size: 14px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
}

.page-header p {
  margin: 8px 0 0;
  color: #6b7280;
}

.status {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: #e9f3fb;
  color: #2773a8;
  font-size: 12px;
  font-weight: 600;
}

.overview-card,
.card {
  background: #fff;
  border: 1px solid #e6e9ed;
  border-radius: 14px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  margin-top: 24px;
}

.avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #eaf7f1;
  color: #11815f;
  font-weight: 700;
  font-size: 20px;
}

.overview-text h2 {
  margin: 0;
  font-size: 21px;
}

.overview-text p {
  margin: 5px 0;
  color: #475467;
}

.overview-text small {
  color: #8a93a1;
}

.grid {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}

.card-header {
  padding: 20px 22px;
  border-bottom: 1px solid #edf0f2;
}

.card-header h2 {
  margin: 0;
  font-size: 17px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  padding: 22px;
}

.info-grid span {
  display: block;
  color: #8a93a1;
  font-size: 12px;
  margin-bottom: 5px;
}

.info-grid strong {
  font-size: 14px;
  font-weight: 600;
  word-break: break-word;
}

.resume-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px;
}

.document-icon {
  width: 48px;
  height: 56px;
  display: grid;
  place-items: center;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  color: #d14b4b;
  font-size: 11px;
  font-weight: 700;
  background: #fff7f7;
}

.resume-info {
  display: grid;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.resume-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-info span {
  color: #8a93a1;
  font-size: 12px;
}

.view-button {
  border: 0;
  border-radius: 8px;
  padding: 10px 15px;
  background: #11815f;
  color: #fff;
  cursor: pointer;
}

.view-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cover-letter {
  padding: 22px;
  margin: 0;
  color: #475467;
  white-space: pre-wrap;
  line-height: 1.7;
}

.state {
  padding: 50px;
  text-align: center;
  color: #667085;
}

.error {
  color: #dc2626;
}

@media (max-width: 800px) {
  .sidebar {
    width: 190px;
  }

  .main {
    padding: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
