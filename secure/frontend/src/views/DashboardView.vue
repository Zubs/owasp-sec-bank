<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm border-primary h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">My Account</h5>
          </div>
          <div class="card-body" v-if="account">
            <h2 class="card-title display-6">£{{ account.balance }}</h2>
            <p class="text-muted mb-1">Available Balance</p>
            <hr>
            <div class="d-flex justify-content-between">
              <span>Account No:</span>
              <strong>{{ account.account_number }}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span>Sort Code:</span>
              <strong>{{ account.sort_code }}</strong>
            </div>
          </div>
          <div class="card-body text-center" v-else>
            <div class="spinner-border text-primary" role="status"></div>
            <p>Loading account details...</p>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card shadow-sm mb-4">
          <div class="card-body d-flex justify-content-around align-items-center">
            <router-link to="/transfer" class="btn btn-lg btn-success px-4">
              💸 Make a Transfer
            </router-link>
            <router-link to="/profile" class="btn btn-lg btn-outline-dark px-4">
              👤 Edit Profile
            </router-link>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0">Recent Transactions</h5>
          </div>
          <ul class="list-group list-group-flush" v-if="transactions.length > 0">
            <li v-for="tx in transactions" :key="tx.transaction_id"
                class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <span class="fw-bold">{{ tx.description }}</span>
                <br>
                <small class="text-muted">{{ new Date(tx.timestamp).toLocaleString() }}</small>
              </div>
              <span :class="tx.to_account_id === account?.account_id ? 'text-success' : 'text-danger'">
                {{ tx.to_account_id === account?.account_id ? '+' : '-' }}£{{ tx.amount }}
              </span>
            </li>
          </ul>
          <div class="card-body text-muted text-center" v-else>
            No recent transactions found.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const account = ref(null);
const transactions = ref([]);

onMounted(async () => {
  if (authStore.user?.user_id) {
    try {
      const accRes = await axios.get(`/api/account/user/${authStore.user.user_id}`);
      account.value = accRes.data.account;

      const txRes = await axios.get(`/api/transactions/history/${account.value.account_id}`);
      transactions.value = txRes.data.transactions;

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  }
});
</script>
