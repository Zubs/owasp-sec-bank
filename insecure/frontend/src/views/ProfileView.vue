<template>
  <div class="container mt-5">
    <div class="row">

      <div class="col-md-4 mb-4">
        <div class="card shadow">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Profile Picture</h5>
          </div>
          <div class="card-body text-center">
            <img :src="avatarUrl" class="rounded-circle img-thumbnail mb-3"
                 style="width: 150px; height: 150px; object-fit: cover;" alt="Avatar">

            <form @submit.prevent="handleAvatarUpload">
              <div class="mb-3">
                <label class="form-label text-start d-block">Import from URL</label>
                <input v-model="avatarInput" type="text" class="form-control" placeholder="http://example.com/me.png"
                       required>
              </div>
              <button type="submit" class="btn btn-outline-primary w-100" :disabled="loading">
                {{ loading ? 'Fetching...' : 'Fetch & Save' }}
              </button>
            </form>

            <div v-if="avatarMessage" class="alert mt-2 p-1"
                 :class="avatarStatus === 'success' ? 'alert-success' : 'alert-danger'">
              <small>{{ avatarMessage }}</small>
            </div>

            <div v-if="ssrfPreview" class="mt-3 text-start">
              <label class="badge bg-danger">Server Response Preview:</label>
              <pre class="bg-light border p-2 mt-1"
                   style="max-height: 150px; overflow: auto; font-size: 0.75rem;">{{ ssrfPreview }}</pre>
            </div>

          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">Edit Profile</h5>
          </div>
          <div class="card-body">

            <div v-if="profileMessage" class="alert"
                 :class="profileStatus === 'success' ? 'alert-success' : 'alert-danger'">
              {{ profileMessage }}
            </div>

            <form @submit.prevent="handleUpdateProfile">
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input v-model="form.full_name" type="text" class="form-control">
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control">
              </div>

              <div class="mb-3">
                <label class="form-label">Username</label>
                <input v-model="form.username" type="text" class="form-control">
              </div>

              <hr>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="form.password" type="password" class="form-control"
                       placeholder="Leave blank to keep current">
              </div>

              <button type="submit" class="btn btn-primary">Update Details</button>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const loading = ref(false);

// Avatar State
const avatarUrl = ref('https://via.placeholder.com/150');
const avatarInput = ref('');
const avatarMessage = ref('');
const avatarStatus = ref('');
const ssrfPreview = ref('');

// Profile State
const form = reactive({
  full_name: '',
  email: '',
  username: '',
  password: ''
});
const profileMessage = ref('');
const profileStatus = ref('');

onMounted(async () => {
  try {
    const res = await axios.get(`/api/user/${authStore.user.user_id}`);
    const u = res.data.user;

    form.full_name = u.full_name;
    form.email = u.email;
    form.username = u.username;

    const potentialAvatar = `/uploads/${authStore.user.user_id}.png`;
    try {
      await axios.head(potentialAvatar);
      avatarUrl.value = potentialAvatar;
    } catch (e) {
      console.error(e);
    }
  } catch (error) {
    console.error(error);
  }
});

const handleAvatarUpload = async () => {
  loading.value = true;
  avatarMessage.value = '';
  ssrfPreview.value = '';

  try {
    const res = await axios.post('/api/user/avatar', { imageUrl: avatarInput.value });

    avatarStatus.value = 'success';
    avatarMessage.value = 'Avatar updated!';

    // The backend saves it as <id>.png. We force a reload of the image by adding a timestamp
    avatarUrl.value = res.data.url + '?t=' + new Date().getTime();

    if (res.data.preview) {}
  } catch (error) {
    avatarStatus.value = 'error';
    avatarMessage.value = 'Failed to fetch image.';
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleUpdateProfile = async () => {
  try {
    await axios.put(`/api/user/${authStore.user.user_id}`, form);

    profileStatus.value = 'success';
    profileMessage.value = 'Profile updated successfully.';

    authStore.user.full_name = form.full_name;
    authStore.user.username = form.username;
  } catch (error) {
    profileStatus.value = 'error';
    profileMessage.value = error.response?.data?.message || 'Update failed';
  }
};
</script>
