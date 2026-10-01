<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();
const positions = ref([]);
const isLoading = ref(true);
const error = ref("");

async function loadPositions() {
  const { data, error: e } = await supabase
    .from("job_positions")
    .select("*")
    .order("created_at", { ascending: false });

  if (e) {
    console.error(e);
    error.value = "Failed to load open positions.";
  } else {
    positions.value = data || [];
  }
  isLoading.value = false;
}

function addPosition() {
  router.push("/admin/open-positions/new");
}

function editPosition(id) {
  router.push(`/admin/open-positions/${id}/edit`);
}

async function deletePosition(position) {
  if (
    !window.confirm(`Delete "${position.title}"? This action cannot be undone.`)
  )
    return;

  const { error: e } = await supabase
    .from("job_positions")
    .delete()
    .eq("id", position.id);

  if (e) {
    console.error(e);
    error.value = "Failed to delete the position.";
    return;
  }

  positions.value = positions.value.filter((p) => p.id !== position.id);
}

function viewPosition(position) {
  router.push(`/careers/${position.slug}`);
}

async function logout() {
  const { error: e } = await supabase.auth.signOut();
  if (e) {
    error.value = "Failed to log out.";
    return;
  }
  router.replace("/admin/login");
}

onMounted(loadPositions);
</script>

<template>
  <div class="admin-page">
    <aside class="sidebar">
      <div>
        <div class="brand">CAREER</div>
        <div class="subtitle">ADMIN PORTAL</div>
      </div>

      <nav class="side-nav">
        <router-link to="/admin/open-positions" class="active"
          >Open Positions</router-link
        >
        <router-link to="/admin/applicants">Applicants</router-link>
      </nav>

      <div class="sidebar-bottom">
        <router-link to="/" class="back">← Back to Website</router-link>
        <button class="logout" @click="logout">↪ Logout</button>
      </div>
    </aside>

    <main class="main">
      <header class="header">
        <div>
          <h1>Open Positions</h1>
          <p>Manage job positions on the career website.</p>
        </div>

        <div class="header-right">
          <button class="add" @click="addPosition">+ Add Position</button>
          <div class="admin">
            <span class="avatar">A</span>
            <span>Admin</span>
          </div>
        </div>
      </header>

      <section class="content">
        <p v-if="error" class="error">{{ error }}</p>
        <div v-if="isLoading" class="state">Loading positions...</div>

        <div v-else-if="positions.length === 0" class="empty">
          <h2>No open positions</h2>
          <p>Create your first position.</p>
          <button class="add" @click="addPosition">+ Add Position</button>
        </div>

        <div v-else class="positions">
          <article
            v-for="position in positions"
            :key="position.id"
            class="card"
          >
            <div class="info">
              <div class="title-row">
                <div>
                  <h2>{{ position.title }}</h2>
                  <p class="department">{{ position.department }}</p>
                </div>
                <span class="status" :class="{ inactive: !position.active }">
                  {{ position.active ? "Active" : "Inactive" }}
                </span>
              </div>

              <p class="description">{{ position.description }}</p>
              <p class="meta">
                {{ position.location }} · {{ position.employment_type }}
              </p>
            </div>

            <div class="actions">
              <button class="edit" @click="editPosition(position.id)">
                Edit
              </button>
              <button class="delete" @click="deletePosition(position)">
                Delete
              </button>
              <button class="view" @click="viewPosition(position)">
                View Position →
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
.admin-page {
  min-height: 100vh;
  display: flex;
  background: #f7f8f6;
  color: #14231e;
}
.sidebar {
  width: 260px;
  min-height: 100vh;
  padding: 30px 22px;
  background: #fbfaf7;
  border-right: 1px solid #e1e5e1;
  display: flex;
  flex-direction: column;
}
.brand {
  font-size: 25px;
  font-weight: 700;
  letter-spacing: 0.13em;
}
.subtitle {
  margin-top: 4px;
  color: #6d8179;
  font-size: 11px;
  letter-spacing: 0.16em;
}
.side-nav {
  margin-top: 52px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.side-nav a {
  padding: 14px 16px;
  border-radius: 9px;
  color: #36534a;
  text-decoration: none;
}
.side-nav a.active,
.side-nav a:hover {
  background: #e7f2ec;
  color: #147b5c;
}
.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.back {
  color: #60736b;
  text-decoration: none;
  font-size: 14px;
}
.logout {
  border: 0;
  background: transparent;
  color: #a83232;
  padding: 0;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.main {
  flex: 1;
  min-width: 0;
}
.header {
  min-height: 136px;
  padding: 30px 46px;
  background: #fff;
  border-bottom: 1px solid #e1e5e1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.header h1 {
  margin: 0;
  font-size: 34px;
}
.header p {
  margin: 7px 0 0;
  color: #64766f;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 28px;
}
.add {
  border: 0;
  border-radius: 6px;
  background: #17815f;
  color: white;
  padding: 13px 18px;
  font-weight: 700;
  cursor: pointer;
}
.add:hover {
  background: #116d50;
}
.admin {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #19845f;
  color: white;
  font-weight: 700;
}
.content {
  padding: 38px 46px 60px;
}
.positions {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.card {
  background: #fff;
  border: 1px solid #e0e4e0;
  border-radius: 14px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}
.info {
  flex: 1;
}
.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}
.card h2 {
  margin: 0;
  font-size: 22px;
}
.department {
  margin: 8px 0 0;
  color: #16805d;
  font-size: 14px;
}
.description {
  margin: 17px 0 8px;
  color: #60736b;
  line-height: 1.55;
}
.meta {
  margin: 0;
  color: #87948e;
  font-size: 13px;
}
.status {
  padding: 7px 12px;
  border-radius: 999px;
  background: #e7f4ed;
  color: #16805d;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.status.inactive {
  background: #eee;
  color: #707070;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.actions button {
  padding: 10px 14px;
  border-radius: 6px;
  background: white;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.edit {
  border: 1px solid #ccd5d0;
  color: #263b34;
}
.delete {
  border: 1px solid #efcaca;
  color: #c63131;
}
.view {
  border: 0;
  color: #16805d;
}
.error {
  padding: 13px 15px;
  margin: 0 0 20px;
  background: #fff0f0;
  color: #b42318;
  border-radius: 7px;
}
.state,
.empty {
  padding: 70px 20px;
  text-align: center;
  color: #65756e;
}
.empty h2 {
  color: #14231e;
}
@media (max-width: 900px) {
  .sidebar {
    width: 210px;
  }
  .header,
  .content {
    padding-left: 28px;
    padding-right: 28px;
  }
  .card {
    align-items: flex-start;
    flex-direction: column;
  }
  .actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
@media (max-width: 650px) {
  .admin-page {
    display: block;
  }
  .sidebar {
    width: 100%;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid #e1e5e1;
  }
  .side-nav {
    margin-top: 25px;
  }
  .sidebar-bottom {
    margin-top: 25px;
  }
  .header {
    align-items: flex-start;
    flex-direction: column;
  }
  .content {
    padding: 25px 18px;
  }
}
</style>
