<template>
  <div class="container mt-4">
    <div v-if="!isAdmin" class="alert alert-danger mt-5 text-center">
      <strong>Access Denied.</strong> You do not have permission to view this page.
    </div>

    <template v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-danger">Admin Dashboard</h2>
      </div>

      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
            User Management
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'transactions' }"
                  @click="activeTab = 'transactions'">
            Transactions
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
            System Logs
          </button>
        </li>
      </ul>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'">
        <div class="card shadow-sm">
          <div class="card-header bg-dark text-white">All Registered Users</div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="u in users" :key="u.user_id">
                <td class="text-muted small">{{ u.user_id }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.full_name }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <span :class="u.role === 'admin' ? 'badge bg-danger' : 'badge bg-secondary'">
                    {{ u.role }}
                  </span>
                </td>
                <td class="text-muted small">{{ new Date(u.created_at).toLocaleDateString() }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Transactions Tab -->
      <div v-if="activeTab === 'transactions'">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">Global Transaction History</div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
              <tr>
                <th>ID</th>
                <th>Sender</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="tx in transactions" :key="tx.transaction_id">
                <td class="text-muted small">#{{ tx.transaction_id }}</td>
                <td>{{ tx.sender || 'Unknown' }}</td>
                <td>{{ tx.recipient || 'Unknown' }}</td>
                <td :class="tx.amount < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'">
                  £{{ tx.amount }}
                </td>
                <td>{{ tx.description }}</td>
                <td class="text-muted small">{{ new Date(tx.timestamp).toLocaleString() }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Logs Tab -->
      <div v-if="activeTab === 'logs'">
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white">Audit Logs</div>
          <ul class="list-group list-group-flush">
            <li v-for="log in logs" :key="log.log_id" class="list-group-item">
              <span class="badge bg-info me-2">{{ log.event_type }}</span>
              <span>{{ log.description }}</span>
              <small class="float-end text-muted">{{ new Date(log.timestamp).toLocaleString() }}</small>
            </li>
            <li v-if="logs.length === 0" class="list-group-item text-muted text-center">No logs found.</li>
          </ul>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const activeTab = ref('users');
const users = ref([]);
const logs = ref([]);
const transactions = ref([]);
const error = ref('');

onMounted(async () => {
  if (!isAdmin.value) {
    router.push('/');

    return;
  }

  await loadData();
});

const loadData = async () => {
  try {
    const [
      userResponse,
      logsResponse,
      transactionsResponse
    ] = await Promise.all([
      axios.get('/api/admin/users'),
      axios.get('/api/admin/system-logs'),
      axios.get('/api/admin/transactions'),
    ]);

    users.value = userResponse.data.users;
    logs.value = logsResponse.data.logs;
    transactions.value = transactionsResponse.data.transactions;
  } catch (err) {
    error.value = err.response?.status === 403
        ? 'Access denied by server.'
        : 'Failed to load admin data.';
  }
};
</script>
