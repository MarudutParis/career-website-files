<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

async function login() {
  error.value = "";

  if (!email.value.trim() || !password.value) {
    error.value = "Please enter your email and password.";
    return;
  }

  isLoading.value = true;

  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });

    if (loginError) {
      console.error("Login error:", loginError);
      error.value = "Invalid email or password.";
      return;
    }

    await router.replace("/admin/applicants");
  } catch (err) {
    console.error("Unexpected login error:", err);
    error.value = "Something went wrong. Please try again.";
  } finally {
    isLoading.value = false;
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

    <main class="login-wrapper">
      <section class="login-card">
        <p class="eyebrow">ADMIN</p>

        <h1>Admin Login</h1>

        <p class="subtitle">Sign in to access the admin panel.</p>

        <form @submit.prevent="login">
          <label>
            Email
            <input
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              autocomplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              v-model="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
          </label>

          <p v-if="error" class="error">
            {{ error }}
          </p>

          <button class="button" type="submit" :disabled="isLoading">
            {{ isLoading ? "Logging in..." : "Log in" }}
          </button>
        </form>

        <router-link to="/" class="back"> ← Back to home </router-link>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f6f2;
  color: #14231e;
}

.nav {
  max-width: 1075px;
  margin: 0 auto;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #deded8;
}

.brand {
  color: #14231e;
  text-decoration: none;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.22em;
}

nav {
  display: flex;
  gap: 32px;
}

nav a {
  color: #355047;
  text-decoration: none;
  font-size: 15px;
}

nav a:hover,
.back:hover {
  color: #286b5b;
}

.login-wrapper {
  min-height: calc(100vh - 92px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 110px 24px 80px;
}

.login-card {
  width: 100%;
  max-width: 500px;
  padding: 52px 54px 46px;
  background: #fbfaf7;
  border: 1px solid #deded8;
  border-radius: 10px;
  box-shadow: 0 18px 45px rgba(20, 35, 30, 0.06);
}

.eyebrow {
  margin: 0 0 14px;
  color: #286b5b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-align: center;
}

h1 {
  margin: 0;
  color: #14231e;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 46px;
  font-weight: 500;
  line-height: 1.1;
  text-align: center;
}

.subtitle {
  margin: 14px 0 38px;
  color: #66766f;
  font-size: 15px;
  line-height: 1.6;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #24362f;
  font-size: 14px;
  font-weight: 600;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 15px;
  border: 1px solid #cfd4cf;
  border-radius: 5px;
  background: #fff;
  color: #14231e;
  font: inherit;
  outline: none;
}

input::placeholder {
  color: #9aa39f;
}

input:focus {
  border-color: #286b5b;
  box-shadow: 0 0 0 3px rgba(40, 107, 91, 0.1);
}

.button {
  margin-top: 2px;
  width: 100%;
  padding: 14px 18px;
  border: 0;
  border-radius: 3px;
  background: #286b5b;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.button:hover {
  background: #215b4d;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: -4px 0 0;
  color: #b42318;
  font-size: 13px;
  line-height: 1.5;
}

.back {
  display: block;
  margin-top: 28px;
  color: #286b5b;
  text-decoration: none;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 700px) {
  .nav {
    margin: 0 24px;
  }

  nav {
    gap: 16px;
  }

  nav a {
    font-size: 13px;
  }

  .login-wrapper {
    padding-top: 60px;
  }

  .login-card {
    padding: 40px 28px;
  }

  h1 {
    font-size: 38px;
  }
}
</style>
