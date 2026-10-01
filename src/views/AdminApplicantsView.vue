]
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();

const applicants = ref([]);
const isLoading = ref(true);
const error = ref("");

const searchQuery = ref("");
const selectedPosition = ref("All Positions");

const positions = computed(() => {
  const uniquePositions = [
    ...new Set(
      applicants.value.map((applicant) => applicant.job_title).filter(Boolean),
    ),
  ];

  return uniquePositions;
});

const filteredApplicants = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return applicants.value.filter((applicant) => {
    const matchesSearch =
      !query ||
      applicant.full_name?.toLowerCase().includes(query) ||
      applicant.email?.toLowerCase().includes(query) ||
      applicant.job_title?.toLowerCase().includes(query);

    const matchesPosition =
      selectedPosition.value === "All Positions" ||
      applicant.job_title === selectedPosition.value;

    return matchesSearch && matchesPosition;
  });
});

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

function viewApplicant(id) {
  router.push(`/admin/applicants/${id}`);
}

function getResumeUrl(resumeUrl) {
  if (!resumeUrl) return null;

  // Existing full URL
  if (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://")) {
    return resumeUrl;
  }

  // Existing rows that only contain the filename/path
  const { data } = supabase.storage.from("resumes").getPublicUrl(resumeUrl);

  return data?.publicUrl || null;
}

function openResume(applicant) {
  const resumeUrl = getResumeUrl(applicant.resume_url);

  if (!resumeUrl) {
    alert("Resume is not available.");
    return;
  }

  window.open(resumeUrl, "_blank", "noopener,noreferrer");
}

async function logout() {
  await supabase.auth.signOut();

  router.replace("/admin/login");
}

async function loadApplicants() {
  isLoading.value = true;
  error.value = "";

  const { data, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (fetchError) {
    console.error("Failed to load applicants:", fetchError);

    error.value = "Failed to load applicants. Please try again.";

    applicants.value = [];
  } else {
    applicants.value = data || [];
  }

  isLoading.value = false;
}

onMounted(loadApplicants);
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
      <header class="page-header">
        <div>
          <h1>Applicants</h1>

          <p>View and manage candidates who applied for available positions.</p>
        </div>
      </header>

      <div class="divider"></div>

      <!-- FILTERS -->

      <section class="filters">
        <div class="search-wrapper">
          <span class="search-icon"> ⌕ </span>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or position..."
          />
        </div>

        <select v-model="selectedPosition" class="position-filter">
          <option value="All Positions">All Positions</option>

          <option
            v-for="position in positions"
            :key="position"
            :value="position"
          >
            {{ position }}
          </option>
        </select>
      </section>

      <!-- LOADING -->

      <div v-if="isLoading" class="state">Loading applicants...</div>

      <!-- ERROR -->

      <div v-else-if="error" class="state error">
        {{ error }}
      </div>

      <!-- TABLE -->

      <section v-else class="table-card">
        <div class="table-header">
          <div class="col-number">NO.</div>

          <div class="col-applicant">APPLICANT NAME</div>

          <div class="col-position">POSITION APPLIED</div>

          <div class="col-date">APPLIED DATE</div>

          <div class="col-status">STATUS</div>

          <div class="col-actions">ACTIONS</div>
        </div>

        <!-- EMPTY -->

        <div v-if="filteredApplicants.length === 0" class="empty">
          No applicants found.
        </div>

        <!-- ROWS -->

        <div
          v-for="(applicant, index) in filteredApplicants"
          :key="applicant.id"
          class="table-row"
        >
          <div class="col-number">
            {{ index + 1 }}
          </div>

          <div class="col-applicant">
            <button class="name-button" @click="viewApplicant(applicant.id)">
              {{ applicant.full_name || "Unnamed applicant" }}
            </button>

            <span class="email">
              {{ applicant.email || "-" }}
            </span>
          </div>

          <div class="col-position">
            {{ applicant.job_title || "-" }}
          </div>

          <div class="col-date">
            {{ formatDate(applicant.created_at) }}
          </div>

          <div class="col-status">
            <span class="status-badge"> New </span>
          </div>

          <div class="col-actions">
            <button class="action-button" @click="viewApplicant(applicant.id)">
              View
            </button>

            <button class="action-button" @click="openResume(applicant)">
              Resume
            </button>
          </div>
        </div>
      </section>
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

  padding: 48px 45px 80px;
}

.page-header h1 {
  margin: 0;

  color: #13241f;

  font-family: Georgia, "Times New Roman", serif;

  font-size: 62px;
  font-weight: 500;

  line-height: 1;
}

.page-header p {
  margin: 16px 0 0;

  color: #60736b;

  font-size: 17px;
}

.divider {
  height: 1px;

  margin-top: 34px;

  background: #dfe1dc;
}

/* ========================================
   FILTERS
======================================== */

.filters {
  display: grid;

  grid-template-columns: 1fr 280px;

  gap: 18px;

  margin-top: 36px;
}

.search-wrapper {
  position: relative;
}

.search-wrapper input,
.position-filter {
  width: 100%;

  height: 58px;

  box-sizing: border-box;

  border: 1px solid #d7dbd6;

  border-radius: 10px;

  background: #fff;

  color: #263a33;

  font-family: inherit;

  font-size: 15px;

  outline: none;
}

.search-wrapper input {
  padding: 0 20px 0 54px;
}

.search-wrapper input:focus,
.position-filter:focus {
  border-color: #75a895;
}

.search-wrapper input::placeholder {
  color: #8a9994;
}

.search-icon {
  position: absolute;

  left: 20px;
  top: 50%;

  transform: translateY(-50%);

  color: #6d7d77;

  font-size: 25px;
}

.position-filter {
  padding: 0 18px;

  cursor: pointer;
}

/* ========================================
   TABLE
======================================== */

.table-card {
  margin-top: 32px;

  overflow: hidden;

  border: 1px solid #d9dcd7;

  border-radius: 12px;

  background: #fff;
}

.table-header,
.table-row {
  display: grid;

  grid-template-columns:
    55px
    minmax(230px, 1.5fr)
    minmax(180px, 1fr)
    145px
    100px
    190px;

  align-items: center;

  column-gap: 18px;
}

.table-header {
  min-height: 58px;

  padding: 0 26px;

  box-sizing: border-box;

  border-bottom: 1px solid #e1e3df;

  color: #667770;

  font-size: 12px;
  font-weight: 600;

  letter-spacing: 0.12em;
}

.table-row {
  min-height: 108px;

  padding: 0 26px;

  box-sizing: border-box;

  border-bottom: 1px solid #e6e8e4;
}

.table-row:last-child {
  border-bottom: 0;
}

.col-number {
  color: #53665f;

  font-size: 15px;
}

.col-applicant {
  display: flex;
  flex-direction: column;

  gap: 5px;
}

.name-button {
  width: fit-content;

  padding: 0;

  border: 0;

  background: transparent;

  color: #14231e;

  font-family: inherit;

  font-size: 16px;
  font-weight: 700;

  cursor: pointer;

  text-align: left;
}

.name-button:hover {
  color: #176a58;
}

.email {
  color: #788681;

  font-size: 14px;
}

.col-position {
  color: #263b34;

  font-size: 15px;
}

.col-date {
  color: #51655e;

  font-size: 14px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 48px;

  padding: 7px 12px;

  border-radius: 999px;

  background: #e8f3fb;

  color: #1769aa;

  font-size: 12px;
  font-weight: 600;
}

.col-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 10px 16px;

  border: 1px solid #cbd4cf;

  border-radius: 8px;

  background: #fff;

  color: #216653;

  font-family: inherit;

  font-size: 14px;

  cursor: pointer;
}

.action-button:hover {
  border-color: #79a795;

  background: #f1f7f3;
}

.empty {
  padding: 70px 30px;

  color: #71807b;

  text-align: center;
}

.state {
  padding: 100px 20px;

  color: #65766f;

  text-align: center;
}

.error {
  color: #b42318;
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 1200px) {
  .table-card {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1000px;
  }
}

@media (max-width: 800px) {
  .sidebar {
    width: 210px;
  }

  .main {
    width: calc(100% - 210px);

    margin-left: 210px;

    padding: 35px 25px;
  }

  .page-header h1 {
    font-size: 48px;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
