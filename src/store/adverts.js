import { defineStore } from 'pinia';
import axiosInstance from "@/../services/axios.js";

export const useAdvertStore = defineStore('adverts', {
    state: () => ({
        advertsState: [],
        currentPageState: null,
        totalPagesState: null,
        totalItemsState: null,
        perPageState: null,
        categoriesState: [],
    }),
    getters: {
        adverts: (state) => state.advertsState,
        totalPages: (state) => state.totalPagesState,
        currentPage: (state) => state.currentPageState,
        categories: (state) => state.categoriesState,
        totalItems: (state) => state.totalItemsState,
        perPage: (state) => state.perPageState,
    },
    actions: {
        async getAdverts(params) {
            try {
                const response = await axiosInstance.get('/adverts', {params: params});
                this.advertsState = response.data.data;
                this.fillData(response.data.meta);
            } catch (error) {
                console.error('error loading adverts:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during loading adverts.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async getUserAdverts(params, userId) {
            try {
                const response = await axiosInstance.get(`/adverts/byUser/${userId}`, {params: params});
                this.advertsState = response.data.data;
                this.fillData(response.data.meta);
            } catch (error) {
                console.error('error loading adverts:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during loading adverts.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async getCategories() {
            try {
                const response = await axiosInstance.get('/categories');
                this.categoriesState = [
                    { id: null, name: 'All categories' },
                    ...response.data.data,
                ];
            } catch (error) {
                console.error('error loading adverts:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during loading adverts.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async createAdvert(params) {
            try {
                const response = await axiosInstance.post('/adverts', params);
                return response.data.data;
            } catch (error) {
                console.error('error create advert:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during create advert.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async deleteAdvert(advertId) {
            try {
                await axiosInstance.delete(`/adverts/${advertId}`);
            } catch (error) {
                console.error('error delete advert:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during delete advert.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async getAdvert(advertId) {
            try {
                const response = await axiosInstance.get(`/adverts/${advertId}`);
                return response.data.data;
            } catch (error) {
                console.error("error loading advert:", error);
                throw error;
            }
        },
        //Moderator section++
        async getModeratedAdverts(params, NonActiveMessagesOnly) {
            try {
                let response;
                if (NonActiveMessagesOnly) {
                    response = await axiosInstance.get('/moderate_adverts/inactive', {params: params});
                } else {
                    response = await axiosInstance.get('/moderate_adverts', {params: params});
                }

                this.advertsState = response.data.data;
                this.fillData(response.data.meta);
            } catch (error) {
                console.error('error loading adverts:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during loading adverts.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },

        async updateAdvert(params, advertId) {
            try {
                const response = await axiosInstance.put(`/moderate_adverts/${advertId}`, params);
                return response.data.data;
            } catch (error) {
                console.error('error update advert:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during update advert.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async deleteModeratedAdvert(advertId) {
            try {
                await axiosInstance.delete(`/moderate_adverts/${advertId}`);
            } catch (error) {
                console.error('error delete advert:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during delete advert.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },

        //Moderator section--
        fillData(data = {}) {
            this.totalPagesState = data?.last_page ?? 1;
            this.currentPageState = data?.current_page ?? 1;
            this.totalItemsState = data?.total ?? this.advertsState.length;
            this.perPageState = data?.per_page ?? this.advertsState.length;
        }
    },
});

export default useAdvertStore;