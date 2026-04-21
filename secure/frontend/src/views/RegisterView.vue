<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Open Account</h3>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input v-model="form.full_name" type="text" class="form-control" required/>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control" required/>
              </div>
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input v-model="form.username" type="text" class="form-control" required/>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="form.password" type="password" class="form-control" required/>
              </div>
              <button type="submit" class="btn btn-success w-100">Register & Login</button>
            </form>

            <div class="mt-3 text-center">
              <router-link to="/login">Already have an account? Login</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  username: '',
  password: '',
  full_name: '',
  email: ''
});
const error = ref('');

const handleSubmit = async () => {
  try {
    await authStore.register(form);
    router.push('/'); // Redirect to Dashboard
  } catch (err) {
    error.value = typeof err === 'string' ? err : 'Registration failed';
  }
};
</script>
