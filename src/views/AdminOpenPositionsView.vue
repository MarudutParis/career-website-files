<script setup>
import { jobs } from "../data/jobs";
</script>

<template>
  <div class="admin-page">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <strong>CAREER</strong>
        <span>ADMIN PORTAL</span>
      </div>
      <nav class="admin-nav">
        <router-link to="/admin/open-positions" class="active"
          >Open Positions</router-link
        >
        <router-link to="/admin/applicants">Applicants</router-link>
      </nav>
      <router-link to="/" class="back-website">← Back to Website</router-link>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div>
          <h1>Open Positions</h1>
          <p>Manage job positions on the career website.</p>
        </div>
        <div class="admin-user">
          <div class="avatar">A</div>
          <span>Admin</span>
        </div>
      </header>

      <section class="positions">
        <article v-for="job in jobs" :key="job.slug" class="position-card">
          <div class="position-info">
            <h2>{{ job.title }}</h2>
            <p class="department">{{ job.department || "Career Position" }}</p>
            <p class="description">{{ job.description }}</p>
          </div>
          <div class="position-actions">
            <span class="status">Active</span>
            <router-link :to="`/careers/${job.slug}`" class="view-job">
              View Position
            </router-link>
          </div>
        </article>

        <div v-if="jobs.length === 0" class="empty">
          No open positions available.
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  background: #f7f8f6;
  color: #1f2933;
}
.admin-sidebar {
  width: 240px;
  min-height: 100vh;
  padding: 32px 20px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.admin-brand {
  display: flex;
  flex-direction: column;
  margin-bottom: 45px;
}
.admin-brand strong {
  font-size: 22px;
  letter-spacing: 1px;
}
.admin-brand span {
  margin-top: 5px;
  font-size: 11px;
  color: #78917f;
  letter-spacing: 1.5px;
}
.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.admin-nav a {
  padding: 13px 15px;
  border-radius: 9px;
  color: #52605a;
  text-decoration: none;
  font-size: 14px;
  transition: 0.2s;
}
.admin-nav a:hover,
.admin-nav a.active {
  background: #eaf5ee;
  color: #23834c;
}
.back-website {
  margin-top: auto;
  padding: 12px 15px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
}
.admin-main {
  flex: 1;
  min-width: 0;
}
.admin-header {
  padding: 32px 42px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.admin-header h1 {
  margin: 0;
  font-size: 30px;
}
.admin-header p {
  margin: 7px 0 0;
  color: #7b8580;
}
.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #23834c;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 600;
}
.positions {
  padding: 35px 42px;
  display: grid;
  gap: 16px;
}
.position-card {
  background: #fff;
  border: 1px solid #e4e8e5;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  gap: 30px;
  box-sizing: border-box;
}
.position-info {
  flex: 1;
}
.position-card h2 {
  margin: 0 0 7px;
  font-size: 19px;
}
.department {
  margin: 0 0 12px;
  color: #23834c;
  font-size: 13px;
}
.description {
  margin: 0;
  max-width: 700px;
  color: #737c77;
  line-height: 1.6;
  font-size: 14px;
}
.position-actions {
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
}
.status {
  background: #eaf5ee;
  color: #23834c;
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.view-job {
  color: #23834c;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}
.view-job:hover {
  text-decoration: underline;
}
.empty {
  padding: 50px;
  text-align: center;
  background: #fff;
  border: 1px solid #e4e8e5;
  border-radius: 12px;
  color: #7b8580;
}
@media (max-width: 800px) {
  .admin-sidebar {
    width: 190px;
  }
  .admin-header {
    padding: 25px;
  }
  .positions {
    padding: 25px;
  }
  .position-card {
    flex-direction: column;
  }
  .position-actions {
    align-items: flex-start;
  }
}
</style>
