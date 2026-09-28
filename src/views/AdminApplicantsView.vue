<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { supabase } from "../lib/supabase";

const RESUME_BUCKET = import.meta.env.VITE_SUPABASE_RESUME_BUCKET || "resumes";

const applicants = ref([]);
const loading = ref(true);
const error = ref("");
const search = ref("");
const positionFilter = ref("All");

const positions = computed(() => {
  const values = applicants.value
    .map((applicant) => applicant.job_title)
    .filter(Boolean);

  return ["All", ...new Set(values)];
});

const filteredApplicants = computed(() => {
  const query = search.value.trim().toLowerCase();

  return applicants.value.filter((applicant) => {
    const matchesSearch =
      !query ||
      applicant.full_name?.toLowerCase().includes(query) ||
      applicant.email?.toLowerCase().includes(query) ||
      applicant.job_title?.toLowerCase().includes(query);

    const matchesPosition =
      positionFilter.value === "All" ||
      applicant.job_title === positionFilter.value;

    return matchesSearch && matchesPosition;
  });
});

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

  // New records should already contain the full URL.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Old records may contain only the Storage path/filename.
  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(value);

  return data?.publicUrl || null;
}

function openResume(applicant) {
  const url = getResumeUrl(applicant.resume_url);

  if (!url) {
    window.alert("No resume is available for this applicant.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

async function loadApplicants() {
  loading.value = true;
  error.value = "";

  const { data, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error(fetchError);
    error.value = "Failed to load applicants.";
    applicants.value = [];
  } else {
    applicants.value = data || [];
  }

  loading.value = false;
}

onMounted(loadApplicants);
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
        <RouterLink to="/admin/open-positions"> Open Positions </RouterLink>

        <RouterLink to="/admin/applicants" class="active">
          Applicants
        </RouterLink>
      </nav>
    </aside>

    <main class="main">
      <header class="page-header">
        <div>
          <h1>Applicants</h1>
          <p>View and manage candidates who applied for available positions.</p>
        </div>
      </header>

      <section class="toolbar">
        <input
          v-model="search"
          type="search"
          placeholder="Search by name, email, or position..."
        />

        <select v-model="positionFilter">
          <option
            v-for="position in positions"
            :key="position"
            :value="position"
          >
            {{ position === "All" ? "All Positions" : position }}
          </option>
        </select>
      </section>

      <p v-if="loading" class="state">Loading applicants...</p>

      <p v-else-if="error" class="state error">
        {{ error }}
      </p>

      <section v-else class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Applicant Name</th>
                <th>Position Applied</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(applicant, index) in filteredApplicants"
                :key="applicant.id"
              >
                <td>{{ index + 1 }}</td>

                <td>
                  <RouterLink
                    :to="`/admin/applicants/${applicant.id}`"
                    class="applicant-name"
                  >
                    {{ applicant.full_name }}
                  </RouterLink>

                  <div class="email">
                    {{ applicant.email }}
                  </div>
                </td>

                <td>{{ applicant.job_title || "-" }}</td>

                <td>{{ formatDate(applicant.created_at) }}</td>

                <td>
                  <span class="status">New</span>
                </td>

                <td>
                  <div class="actions">
                    <RouterLink
                      :to="`/admin/applicants/${applicant.id}`"
                      class="action-button"
                    >
                      View
                    </RouterLink>

                    <button
                      type="button"
                      class="action-button"
                      @click="openResume(applicant)"
                    >
                      Resume
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredApplicants.length === 0">
                <td colspan="6" class="empty">No applicants found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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
  background: #ffffff;
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
  padding: 40px;
  min-width: 0;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
}

.page-header p {
  margin: 8px 0 0;
  color: #6b7280;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin: 28px 0 18px;
}

.toolbar input,
.toolbar select {
  height: 44px;
  border: 1px solid #dfe3e8;
  border-radius: 9px;
  background: #fff;
  padding: 0 14px;
}

.toolbar input {
  flex: 1;
}

.card {
  background: #fff;
  border: 1px solid #e6e9ed;
  border-radius: 14px;
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 850px;
}

th,
td {
  padding: 16px 18px;
  border-bottom: 1px solid #edf0f2;
  text-align: left;
  font-size: 14px;
}

th {
  background: #fafbfb;
  color: #687182;
  font-weight: 600;
}

.applicant-name {
  color: #172033;
  font-weight: 600;
  text-decoration: none;
}

.applicant-name:hover {
  color: #11815f;
}

.email {
  margin-top: 4px;
  color: #8a93a1;
  font-size: 12px;
}

.status {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  background: #e9f3fb;
  color: #2773a8;
  font-size: 12px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 7px;
}

.action-button {
  border: 1px solid #dfe3e8;
  border-radius: 7px;
  padding: 7px 10px;
  background: #fff;
  color: #344054;
  text-decoration: none;
  cursor: pointer;
  font-size: 12px;
}

.action-button:hover {
  border-color: #11815f;
  color: #11815f;
}

.state {
  padding: 30px;
  text-align: center;
  color: #667085;
}

.error {
  color: #dc2626;
}

.empty {
  text-align: center;
  color: #8a93a1;
  padding: 40px;
}
</style>
