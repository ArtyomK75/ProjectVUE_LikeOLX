import { defineStore } from 'pinia';
import axiosInstance from "@/../services/axios.js";
import VueCookies from 'vue-cookies';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        tokenState: decodeURIComponent(VueCookies.get('auth_token')) || null,
        isLoggedInState: false,
        userEmailState: '',
        userNameState: '',
        isAdminState: false,
        isModeratorState: false,
        userIdState: ''

    }),
    getters: {
        isLoggedIn: (state) => state.isLoggedInState,
        loggedUserEmail:(state) => state.userEmailState,
        loggedUserName:(state) => state.userNameState,
        userId:(state) => state.userIdState,
        isAdmin:(state) => state.isAdminState,
        isModerator:(state) => state.isModeratorState,
    },
    actions: {
        async login(credentials) {
            try {
                const response = await axiosInstance.post('/login', credentials);
                this.tokenState = response.data.token;
                this.isLoggedInState = !!this.tokenState;
                this.userEmailState = response.data.user.email;
                this.userNameState = response.data.user.name;
                this.isAdminState = response.data.user.isAdmin;
                this.isModeratorState = response.data.user.isModerator;
                this.userIdState = response.data.user.id;
                VueCookies.set('auth_token', encodeURIComponent(this.tokenState), import.meta.env.VITE_TOKEN_EXPIRATION_DAYS+'d');
                axiosInstance.defaults.headers.Authorization = `Bearer ${this.tokenState}`;
            } catch (error) {
                console.error('Login error:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during logged in.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async register(userData) {
            try {
                const response = await axiosInstance.post('/register', userData);
                console.log(response.data);
                this.tokenState = response.data.token;
                this.isLoggedInState = !!this.tokenState;
                this.userEmailState = response.data.user.email;
                this.userNameState = response.data.user.name;
                this.isAdminState = response.data.user.isAdmin;
                this.isModeratorState = response.data.user.isModerator;
                this.userIdState = response.data.user.id;
                VueCookies.set('auth_token', encodeURIComponent(this.tokenState), import.meta.env.VITE_TOKEN_EXPIRATION_DAYS+'d');
                axiosInstance.defaults.headers.Authorization = `Bearer ${this.tokenState}`;
            } catch (error) {
                console.error('Registration error:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during registration.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async logout() {
            this.tokenState = null;
            this.isLoggedInState = false;
            this.userEmailState = '';
            this.userNameState = '';
            this.isAdminState = false;
            this.isModeratorState = false;
            this.userIdState = '';
            VueCookies.remove('auth_token');
            delete axiosInstance.defaults.headers.Authorization;
        },
        initializeAuth() {
            const token = decodeURIComponent(VueCookies.get('auth_token')) || null;
            if (token) {
                this.tokenState = token;
                this.isLoggedInState = true;
                axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
                this.fetchUserProfile();
            }
        },
        async fetchUserProfile() {
            try {
                const response = await axiosInstance.get('/profile');
                console.log()
                this.userEmailState = response.data.user.email;
                this.userNameState = response.data.user.name;
                this.isAdminState = response.data.user.isAdmin;
                this.isModeratorState = response.data.user.isModerator;
                this.userIdState = response.data.user.id;
            } catch (error) {
                console.error('Error fetching user profile:', error);
                this.logout();
            }
        }
    },
});
export default useAuthStore;