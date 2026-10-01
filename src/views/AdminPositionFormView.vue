<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params.id));

const title = ref("");
const department = ref("");
const location = ref("");
const employmentType = ref("");
const description = ref("");
const responsibilities = ref("");
const requirements = ref("");
const active = ref(true);
const loading = ref(false);
const saving = ref(false);
const error = ref("");

const departments = [
  "Engineering",
  "Design",
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
];
const employmentTypes = ["Full-time", "Part-time", "Internship", "Contract"];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function loadPosition() {
  if (!isEdit.value) return;
  loading.value = true;

  const { data, error: e } = await supabase
    .from("job_positions")
    .select("*")
    .eq("id", route.params.id)
    .single();

  if (e) error.value = "Failed to load the position.";
  else {
    title.value = data.title || "";
    department.value = data.department || "";
    location.value = data.location || "";
    employmentType.value = data.employment_type || "";
    description.value = data.description || "";
    responsibilities.value = data.responsibilities || "";
    requirements.value = data.requirements || "";
    active.value = data.active !== false;
  }
  loading.value = false;
}

async function save() {
  error.value = "";

  if (
    !title.value.trim() ||
    !department.value ||
    !location.value.trim() ||
    !employmentType.value ||
    !description.value.trim() ||
    !responsibilities.value.trim() ||
    !requirements.value.trim()
  ) {
    error.value = "Please complete all required fields.";
    return;
  }

  saving.value = true;

  const payload = {
    title: title.value.trim(),
    slug: slugify(title.value),
    department: department.value,
    location: location.value.trim(),
    employment_type: employmentType.value,
    description: description.value.trim(),
    responsibilities: responsibilities.value.trim(),
    requirements: requirements.value.trim(),
    active: active.value,
  };

  const result = isEdit.value
    ? await supabase
        .from("job_positions")
        .update(payload)
        .eq("id", route.params.id)
    : await supabase.from("job_positions").insert(payload);

  if (result.error) {
    console.error(result.error);
    error.value =
      result.error.code === "23505"
        ? "A position with this title already exists."
        : "Failed to save the position.";
    saving.value = false;
    return;
  }

  router.push("/admin/open-positions");
}

async function logout() {
  await supabase.auth.signOut();
  router.replace("/admin/login");
}

onMounted(loadPosition);
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
          <h1>{{ isEdit ? "Edit Position" : "Add Position" }}</h1>
          <p>
            {{
              isEdit
                ? "Update the job position details."
                : "Create a new job position to be displayed on the career website."
            }}
          </p>
        </div>
        <div class="admin"><span class="avatar">A</span><span>Admin</span></div>
      </header>

      <section class="content">
        <div v-if="loading" class="state">Loading position...</div>

        <form v-else class="form" @submit.prevent="save">
          <div class="grid">
            <label
              >Job Title *
              <input v-model="title" placeholder="e.g. Frontend Developer" />
            </label>

            <label
              >Department *
              <select v-model="department">
                <option value="">Select department</option>
                <option v-for="item in departments" :key="item">
                  {{ item }}
                </option>
              </select>
            </label>

            <label
              >Location *
              <input
                v-model="location"
                placeholder="e.g. Kuala Lumpur / Hybrid"
              />
            </label>

            <label
              >Employment Type *
              <select v-model="employmentType">
                <option value="">Select employment type</option>
                <option v-for="item in employmentTypes" :key="item">
                  {{ item }}
                </option>
              </select>
            </label>
          </div>

          <label
            >About the Role *
            <textarea
              v-model="description"
              rows="4"
              placeholder="Describe the job position..."
            ></textarea>
          </label>

          <label
            >Responsibilities *
            <textarea
              v-model="responsibilities"
              rows="6"
              placeholder="Enter each responsibility on a new line..."
            ></textarea>
          </label>

          <label
            >Requirements *
            <textarea
              v-model="requirements"
              rows="6"
              placeholder="Enter each requirement on a new line..."
            ></textarea>
          </label>

          <label v-if="isEdit" class="checkbox">
            <input v-model="active" type="checkbox" /> Position is active
          </label>

          <p v-if="error" class="error">{{ error }}</p>

          <div class="form-actions">
            <button
              type="button"
              class="cancel"
              @click="router.push('/admin/open-positions')"
            >
              Cancel
            </button>
            <button type="submit" class="save" :disabled="saving">
              {{
                saving ? "Saving..." : isEdit ? "Save Changes" : "Add Position"
              }}
            </button>
          </div>
        </form>
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
}
.header h1 {
  margin: 0;
  font-size: 34px;
}
.header p {
  margin: 7px 0 0;
  color: #64766f;
}
.admin {
  display: flex;
  align-items: center;
  gap: 10px;
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
.form {
  max-width: 1050px;
  margin: auto;
  background: #fff;
  border: 1px solid #e0e4e0;
  border-radius: 14px;
  padding: 34px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 22px;
  color: #263b34;
  font-size: 14px;
  font-weight: 700;
}
input,
select,
textarea {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #cfd7d2;
  border-radius: 6px;
  background: white;
  color: #14231e;
  font: inherit;
  font-weight: 400;
  outline: none;
}
textarea {
  resize: vertical;
  line-height: 1.5;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #19845f;
  box-shadow: 0 0 0 3px rgba(25, 132, 95, 0.1);
}
.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 9px;
}
.checkbox input {
  width: auto;
}
.error {
  padding: 12px;
  background: #fff0f0;
  color: #b42318;
  border-radius: 6px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.cancel,
.save {
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.cancel {
  background: white;
  border: 1px solid #ccd5d0;
}
.save {
  border: 0;
  background: #17815f;
  color: white;
}
.save:disabled {
  opacity: 0.6;
}
.state {
  padding: 70px;
  text-align: center;
}
@media (max-width: 800px) {
  .sidebar {
    width: 210px;
  }
  .header,
  .content {
    padding-left: 25px;
    padding-right: 25px;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 650px) {
  .admin-page {
    display: block;
  }
  .sidebar {
    width: 100%;
    min-height: auto;
  }
  .header {
    align-items: flex-start;
    gap: 20px;
    flex-direction: column;
  }
}
</style>
