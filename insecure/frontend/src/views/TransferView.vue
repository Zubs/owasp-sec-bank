<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-success text-white">
            <h4 class="mb-0">Transfer Funds</h4>
          </div>
          <div class="card-body">

            <div v-if="message" :class="`alert alert-${status === 'success' ? 'success' : 'danger'}`">
              {{ message }}
            </div>

            <form @submit.prevent="handleLookup" class="mb-4">
              <label class="form-label">Recipient Account Number</label>
              <div class="input-group">
                <input v-model="searchAccount" type="text" class="form-control" placeholder="e.g. 12345678" required>
                <button class="btn btn-outline-secondary" type="submit">Lookup</button>
              </div>
            </form>

            <div v-if="recipient" class="alert alert-info d-flex align-items-center">
              <div class="me-3 fs-3">👤</div>
              <div>
                <strong>Sending to:</strong> {{ recipient.full_name }}<br>
                <small>Sort Code: {{ recipient.sort_code }}</small>
              </div>
            </div>

            <form v-if="recipient" @submit.prevent="handleTransfer">
              <div class="mb-3">
                <label class="form-label">Amount (£)</label>
                <input v-model="amount" type="number" step="0.01" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <input v-model="description" type="text" class="form-control" placeholder="Payment for..." required>
              </div>

              <button type="submit" class="btn btn-success w-100 btn-lg">Confirm Transfer</button>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const searchAccount = ref('');
const recipient = ref(null);
const amount = ref(0);
const description = ref('');
const message = ref('');
const status = ref('');

const handleLookup = async () => {
  message.value = '';
  recipient.value = null;
  try {
    const res = await axios.post('/api/account/lookup', { account_number: searchAccount.value });
    recipient.value = res.data.recipient;
  } catch (error) {
    status.value = 'error';
    message.value = error.response?.data?.message || 'Account not found';
  }
};

const handleTransfer = async () => {
  try {
    const myAccRes = await axios.get(`/api/account/user/${authStore.user.user_id}`);
    const myAccountId = myAccRes.data.account.account_id;

    const payload = {
      from_account_id: myAccountId,
      to_account_id: recipient.value.account_id,
      amount: amount.value,
      description: description.value
    };

    await axios.post('/api/transactions/transfer', payload);

    status.value = 'success';
    message.value = 'Transfer successful!';
    setTimeout(() => router.push('/'), 1500);

  } catch (error) {
    status.value = 'error';
    message.value = error.response?.data?.message || 'Transfer failed';
  }
};
</script>
