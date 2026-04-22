<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import NavBar from './components/NavBar.vue';
import axios from 'axios';

const authStore = useAuthStore();

// Restore token header on app refresh
onMounted(() => {
  if (authStore.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
  }
});
</script>

<template>
  <NavBar/>
  <router-view/>
</template>
