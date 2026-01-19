<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-danger">Admin Dashboard</h2>
    </div>

    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">User Management</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'transactions' }" @click="activeTab = 'transactions'">Transactions</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">System Logs</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'debug' }" @click="activeTab = 'debug'">System Debug</button>
      </li>
    </ul>

    <div v-if="activeTab === 'users'">
      <div class="card shadow-sm">
        <div class="card-header bg-dark text-white">All Registered Users</div>
        <table class="table table-hover mb-0">
          <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Password</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="u in users" :key="u.user_id">
            <td>{{ u.user_id }}</td>
            <td>{{ u.username }}</td>
            <td v-html="u.full_name"></td>
            <td>
              <span :class="u.role === 'admin' ? 'badge bg-danger' : 'badge bg-secondary'">{{ u.role }}</span>
            </td>
            <td class="text-muted small text-truncate" style="max-width: 150px;">{{ u.password }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

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
              <td>#{{ tx.transaction_id }}</td>
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

    <div v-if="activeTab === 'logs'">
      <div class="card shadow-sm">
        <div class="card-header bg-secondary text-white">Audit Logs</div>
        <ul class="list-group list-group-flush">
          <li v-for="log in logs" :key="log.log_id" class="list-group-item">
            <span class="fw-bold">{{ log.action }}</span> - <small>{{ log.details }}</small>
            <span class="float-end text-muted">{{ new Date(log.timestamp).toLocaleString() }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="activeTab === 'debug'">
      <div class="card shadow-sm border-warning">
        <div class="card-header bg-warning text-dark">Server Diagnostics</div>
        <div class="card-body">
          <p>Fetch server environment variables.</p>
          <button @click="handleDebug" class="btn btn-dark">Run Diagnostics</button>
          <pre v-if="debugData" class="mt-3 bg-dark text-success p-3 rounded">{{ debugData }}</pre>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const activeTab = ref('users');
const users = ref([]);
const logs = ref([]);
const transactions = ref([]); // New State
const debugData = ref(null);

onMounted(async () => {
  loadData();
});

const loadData = async () => {
  try {
    // 1. Fetch Users
    const uRes = await axios.get('/api/admin/users');
    users.value = uRes.data.users;

    // 2. Fetch Logs
    const lRes = await axios.get('/api/admin/system-logs');
    logs.value = lRes.data.logs;

    // 3. Fetch Transactions (New)
    const tRes = await axios.get('/api/admin/transactions');
    transactions.value = tRes.data.transactions;

  } catch (error) {
    console.error("Access Denied?", error);
  }
};

const handleDebug = async () => {
  try {
    const res = await axios.get('/api');
    debugData.value = res.data;
  } catch (error) {
    debugData.value = "Failed to load config";
  }
};
</script>