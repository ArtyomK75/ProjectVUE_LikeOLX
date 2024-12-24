import { defineStore } from 'pinia';
import axiosInstance from "@/../services/axios.js";

export const useUserStore = defineStore('userss', {
    state: () => ({
        usersState: [],
        rolesState: [],
        currentPageState: null,
        totalPagesState: null,
        totalItemsState: null,
        perPageState: null,
        categoriesState: [],
    }),
    getters: {
        users: (state) => state.usersState,
        roles: (state) => state.rolesState,
        totalPages: (state) => state.totalPagesState,
        currentPage: (state) => state.currentPageState,
        totalItems: (state) => state.totalItemsState,
        perPage: (state) => state.perPageState,
    },
    actions: {
        async getUsers(params) {
            try {
                const response = await axiosInstance.get('/admin_panel', {params: params});
                this.usersState = response.data.data;
                this.rolesState = response.data.roles;
                this.fillData(response.data.meta);

            } catch (error) {
                console.error('error loading users:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during loading users.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async updateUser(params, userId) {
            try {
                await axiosInstance.put(`/admin_panel/${userId}`, params);

            } catch (error) {
                console.error('error update user:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during update user.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async deleteUser(userId) {
            try {
                await axiosInstance.delete(`/admin_panel/${userId}`);
            } catch (error) {
                console.error('error delete user:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during delete user.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        fillData(data = {}) {
            this.totalPagesState = data?.last_page ?? 1;
            this.currentPageState = data?.current_page ?? 1;
            this.totalItemsState = data?.total ?? this.usersState.length;
            this.perPageState = data?.per_page ?? this.usersState.length;

        }
    },
});

export default useUserStore;