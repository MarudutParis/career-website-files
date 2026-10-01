<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const route = useRoute();
const router = useRouter();

const applicant = ref(null);

const isLoading = ref(true);
const error = ref("");

const resumeUrl = ref("");

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "?";
}

function getFileName(path) {
  if (!path) return "Resume";

  try {
    const cleanPath = path.split("?")[0];
    const parts = cleanPath.split("/");

    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return "Resume";
  }
}

function getResumeUrl(resumeValue) {
  if (!resumeValue) return null;

  // Existing full URL
  if (resumeValue.startsWith("http://") || resumeValue.startsWith("https://")) {
    return resumeValue;
  }

  // Existing rows containing only the file path
  const { data } = supabase.storage.from("resumes").getPublicUrl(resumeValue);

  return data?.publicUrl || null;
}

function openResume() {
  if (!resumeUrl.value) {
    alert("Resume is not available.");
    return;
  }

  window.open(resumeUrl.value, "_blank", "noopener,noreferrer");
}

function goBack() {
  router.push("/admin/applicants");
}

async function logout() {
  await supabase.auth.signOut();

  router.replace("/admin/login");
}

async function loadApplicant() {
  isLoading.value = true;
  error.value = "";

  const applicantId = route.params.id;

  if (!applicantId) {
    error.value = "Applicant ID is missing.";
    isLoading.value = false;
    return;
  }

  const { data, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicantId)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to load applicant:", fetchError);

    error.value = "Failed to load applicant information.";
  } else if (!data) {
    error.value = "Applicant not found.";
  } else {
    applicant.value = data;

    resumeUrl.value = getResumeUrl(data.resume_url) || "";
  }

  isLoading.value = false;
}

onMounted(loadApplicant);
</script>

<template>
  <div class="admin-page">
    <!-- SIDEBAR -->

    <aside class="sidebar">
      <div class="brand-area">
        <div class="brand">CAREER</div>

        <div class="brand-subtitle">ADMIN PORTAL</div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/open-positions" class="nav-item">
          <span class="nav-icon">▣</span>
          <span>Open Positions</span>
        </router-link>

        <router-link to="/admin/applicants" class="nav-item active">
          <span class="nav-icon">♙</span>
          <span>Applicants</span>
        </router-link>
      </nav>

      <button class="logout-button" @click="logout">
        <span class="logout-icon">↪</span>
        <span>Logout</span>
      </button>
    </aside>

    <!-- MAIN -->

    <main class="main">
      <!-- BACK -->

      <button class="back-button" @click="goBack">← Back to Applicants</button>

      <!-- HEADER -->

      <header class="page-header">
        <div>
          <h1>Applicant Detail</h1>

          <p>Review the information submitted by this applicant.</p>
        </div>

        <span v-if="applicant" class="status-badge"> New </span>
      </header>

      <!-- LOADING -->

      <div v-if="isLoading" class="state">Loading applicant...</div>

      <!-- ERROR -->

      <div v-else-if="error" class="state error">
        {{ error }}
      </div>

      <!-- APPLICANT -->

      <template v-else-if="applicant">
        <!-- APPLICANT SUMMARY -->

        <section class="summary-card">
          <div class="avatar">
            {{ getInitial(applicant.full_name) }}
          </div>

          <div class="summary-info">
            <h2>
              {{ applicant.full_name || "Unnamed applicant" }}
            </h2>

            <p class="summary-position">
              {{ applicant.job_title || "-" }}
            </p>

            <p class="summary-date">
              Applied {{ formatDate(applicant.created_at) }}
            </p>
          </div>
        </section>

        <!-- PERSONAL INFORMATION -->

        <section class="content-card">
          <div class="card-title">Personal Information</div>

          <div class="information-grid">
            <div class="information-item">
              <span class="label"> Full Name </span>

              <strong>
                {{ applicant.full_name || "-" }}
              </strong>
            </div>

            <div class="information-item">
              <span class="label"> Email </span>

              <strong>
                {{ applicant.email || "-" }}
              </strong>
            </div>

            <div class="information-item">
              <span class="label"> Phone </span>

              <strong>
                {{ applicant.phone || "-" }}
              </strong>
            </div>

            <div class="information-item">
              <span class="label"> Position Applied </span>

              <strong>
                {{ applicant.job_title || "-" }}
              </strong>
            </div>

            <div class="information-item">
              <span class="label"> Applied Date </span>

              <strong>
                {{ formatDate(applicant.created_at) }}
              </strong>
            </div>
          </div>
        </section>

        <!-- RESUME -->

        <section class="content-card">
          <div class="card-title">Resume</div>

          <div class="resume-row">
            <div class="resume-icon">PDF</div>

            <div class="resume-info">
              <strong>
                {{ getFileName(applicant.resume_url) }}
              </strong>

              <span> Candidate resume / CV </span>
            </div>

            <button
              class="primary-button"
              :disabled="!resumeUrl"
              @click="openResume"
            >
              View CV
            </button>
          </div>
        </section>

        <!-- COVER LETTER -->

        <section class="content-card">
          <div class="card-title">Cover Letter</div>

          <div class="cover-letter">
            {{ applicant.cover_letter || "No cover letter provided." }}
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;

  display: flex;

  background: #f7f7f4;
  color: #14231e;
}

/* ========================================
SIDEBAR
======================================== */

.sidebar {
  position: fixed;

  top: 0;
  left: 0;
  bottom: 0;

  width: 255px;

  display: flex;
  flex-direction: column;

  padding: 34px 22px 30px;

  box-sizing: border-box;

  background: #fbfbf8;

  border-right: 1px solid #dedfd9;
}

.brand-area {
  padding: 0 14px;
}

.brand {
  color: #14231e;

  font-size: 21px;
  font-weight: 700;

  letter-spacing: 0.2em;
}

.brand-subtitle {
  margin-top: 2px;

  color: #71807b;

  font-size: 11px;

  letter-spacing: 0.18em;
}

.sidebar-nav {
  margin-top: 85px;

  display: flex;
  flex-direction: column;

  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;

  gap: 14px;

  padding: 13px 15px;

  border-radius: 10px;

  color: #51655e;

  text-decoration: none;

  font-size: 15px;
}

.nav-item:hover {
  background: #f0f3ef;
}

.nav-item.active {
  background: #e8f2eb;

  color: #176a58;

  font-weight: 600;
}

.nav-icon {
  width: 22px;

  text-align: center;

  font-size: 18px;
}

.logout-button {
  margin-top: auto;

  display: flex;
  align-items: center;

  gap: 14px;

  padding: 13px 15px;

  border: 0;

  background: transparent;

  color: #52655e;

  font-family: inherit;

  font-size: 15px;

  cursor: pointer;

  text-align: left;
}

.logout-button:hover {
  color: #176a58;
}

.logout-icon {
  font-size: 22px;
}

/* ========================================
   MAIN
======================================== */

.main {
  width: calc(100% - 255px);

  margin-left: 255px;

  padding: 35px 45px 80px;
}

.back-button {
  padding: 0;

  border: 0;

  background: transparent;

  color: #176a58;

  font-family: inherit;

  font-size: 14px;

  cursor: pointer;
}

.back-button:hover {
  text-decoration: underline;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-top: 25px;
}

.page-header h1 {
  margin: 0;

  color: #13241f;

  font-family: Georgia, "Times New Roman", serif;

  font-size: 58px;
  font-weight: 500;

  line-height: 1;
}

.page-header p {
  margin: 14px 0 0;

  color: #60736b;

  font-size: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 48px;

  padding: 7px 14px;

  border-radius: 999px;

  background: #e8f3fb;

  color: #1769aa;

  font-size: 12px;
  font-weight: 600;
}

/* ========================================
   SUMMARY
======================================== */

.summary-card {
  margin-top: 35px;

  display: flex;
  align-items: center;

  gap: 20px;

  padding: 22px 26px;

  border: 1px solid #d9dcd7;

  border-radius: 12px;

  background: #fff;
}

.avatar {
  width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background: #e7f3ec;

  color: #18735f;

  font-size: 20px;
  font-weight: 700;
}

.summary-info h2 {
  margin: 0;

  color: #14231e;

  font-size: 21px;
}

.summary-position {
  margin: 5px 0 0;

  color: #3f564e;

  font-size: 15px;
}

.summary-date {
  margin: 5px 0 0;

  color: #7a8984;

  font-size: 13px;
}

/* ========================================
   CONTENT CARDS
======================================== */

.content-card {
  margin-top: 18px;

  overflow: hidden;

  border: 1px solid #d9dcd7;

  border-radius: 12px;

  background: #fff;
}

.card-title {
  padding: 19px 20px;

  border-bottom: 1px solid #e1e3df;

  color: #14231e;

  font-size: 16px;
  font-weight: 700;
}

.information-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  column-gap: 70px;
  row-gap: 26px;

  padding: 25px 20px 30px;
}

.information-item {
  display: flex;
  flex-direction: column;

  gap: 6px;
}

.label {
  color: #778680;

  font-size: 11px;
  font-weight: 600;

  text-transform: uppercase;

  letter-spacing: 0.08em;
}

.information-item strong {
  color: #172a23;

  font-size: 14px;

  font-weight: 600;

  word-break: break-word;
}

/* ========================================
   RESUME
======================================== */

.resume-row {
  min-height: 95px;

  display: flex;
  align-items: center;

  gap: 16px;

  padding: 20px;
}

.resume-icon {
  width: 44px;
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid #e4d5d2;

  border-radius: 7px;

  background: #fff7f5;

  color: #d33a2c;

  font-size: 11px;
  font-weight: 700;
}

.resume-info {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;

  gap: 5px;
}

.resume-info strong {
  color: #20322c;

  font-size: 14px;

  word-break: break-word;
}

.resume-info span {
  color: #7a8984;

  font-size: 12px;
}

.primary-button {
  flex-shrink: 0;

  padding: 11px 18px;

  border: 0;

  border-radius: 7px;

  background: #197b62;

  color: white;

  font-family: inherit;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
}

.primary-button:hover {
  background: #146a54;
}

.primary-button:disabled {
  opacity: 0.5;

  cursor: not-allowed;
}

/* ========================================
   COVER LETTER
======================================== */

.cover-letter {
  min-height: 100px;

  padding: 25px 20px 30px;

  color: #455951;

  font-size: 15px;

  line-height: 1.7;

  white-space: pre-wrap;
}

/* ========================================
   STATES
======================================== */

.state {
  padding: 120px 20px;

  color: #65766f;

  text-align: center;
}

.error {
  color: #b42318;
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 900px) {
  .sidebar {
    width: 210px;
  }

  .main {
    width: calc(100% - 210px);

    margin-left: 210px;

    padding: 30px;
  }

  .page-header h1 {
    font-size: 48px;
  }

  .information-grid {
    column-gap: 30px;
  }
}

@media (max-width: 700px) {
  .sidebar {
    position: static;

    width: 100%;
    min-height: auto;

    border-right: 0;
    border-bottom: 1px solid #dedfd9;
  }

  .admin-page {
    display: block;
  }

  .sidebar-nav {
    margin-top: 30px;
  }

  .logout-button {
    margin-top: 25px;
  }

  .main {
    width: 100%;

    margin-left: 0;

    padding: 30px 20px 60px;
  }

  .page-header {
    flex-direction: column;

    gap: 20px;
  }

  .page-header h1 {
    font-size: 43px;
  }

  .information-grid {
    grid-template-columns: 1fr;
  }

  .resume-row {
    align-items: flex-start;

    flex-wrap: wrap;
  }

  .primary-button {
    margin-left: 60px;
  }
}
</style>
