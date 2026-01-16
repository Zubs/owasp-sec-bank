import { defineStore}  from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),
    actions: {
        async login(username, password) {
            try {
                const response = await axios.post('/api/auth/login', { username, password });

                // Update State
                this.token = response.data.token;
                this.user = response.data.user;

                // Persist to LocalStorage
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                // Set default header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

                return true;
            } catch (error) {
                throw error.response.data.message || 'Login failed';
            }
        },
        logout() {
            if (this.token) {
                axios.post('/api/auth/logout', {}, {
                    headers: { Authorization: `Bearer ${this.token}` }
                }).catch(err => console.error(err));
            }

            // Clear State
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
        }
    }
});
