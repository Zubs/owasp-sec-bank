<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Login</h3>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input v-model="username" type="text" class="form-control" required/>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" required/>
              </div>
              <button type="submit" class="btn btn-primary w-100">Sign In</button>
            </form>

            <div class="mt-3 text-center">
              <router-link to="/register">Don't have an account? Register</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');

const handleSubmit = async () => {
  try {
    await authStore.login(username.value, password.value);
    router.push('/'); // Redirect to Dashboard
  } catch (err) {
    error.value = err;
  }
};
</script>
