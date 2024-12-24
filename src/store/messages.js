import { defineStore } from 'pinia';
import axiosInstance from "@/../services/axios.js";

export const useMessageStore = defineStore('messages', {
    state: () => ({
        messagesState: [],
        dialogueIdState: null,
    }),
    getters: {
        messages: (state) => state.messagesState,
        dialogueId: (state) => state.dialogueIdState,
    },
    actions: {
        async getMessages(params) {
            try {
                const response = await axiosInstance.get(`/messages/${params.advertId}/${params.userId}`);
                this.dialogueIdState = response.data.data.id;
                this.messagesState = response.data.data.messages;
            } catch (error) {
                console.error('error loading messages:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during loading messages.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        async createMessage(params) {
            try {
                const response = await axiosInstance.post('/messages', params);
                return response.data.data;
            } catch (error) {
                console.error('error create message:', error);
                const errorMessage = error.response?.data?.message || 'An error occurred during create message.';
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
    },
});

export default useMessageStore;