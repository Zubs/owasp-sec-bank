import { defineStore}  from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        setAuth(data) {
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        },
        async login(username, password) {
            try {
                const response = await axios.post('/api/auth/login', { username, password });

                // Update State
                this.setAuth(response.data);

                return true;
            } catch (error) {
                throw error.response?.data?.message || 'Login failed';
            }
        },
        async register(formData) {
            try {
                // Backend returns token immediately on register
                const response = await axios.post('/api/auth/register', formData);

                this.setAuth(response.data);

                return true;
            } catch (error) {
                throw error.response?.data?.error || 'Registration failed';
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
