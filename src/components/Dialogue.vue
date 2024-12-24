<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card v-if="(dialogueId)">
          <v-card-text>

            <v-list dense>
              <v-list-item
                  v-for="(message, i) in messages"
                  :key="i"
                  lines=""
                  :title="message.authorName"
                  :class="message.isAuthor ? 'message-author' : 'message-user'"
              >
               <v-list-item-subtitle>
                 <p :class="message.isAuthor ? 'author-message' : 'user-message'">
                  {{ message.text }}
                </p>
               </v-list-item-subtitle>
                <v-divider></v-divider>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-divider></v-divider>

        <v-card min-width="600">
          <v-card-text>
            <v-form v-model="isFormMessageValid">
              <v-textarea
                  v-model="newMessage"
                  label="Ask an author..."
                  :rules="[rules.required]"
                  outlined
              ></v-textarea>
              <v-btn
                  :disabled="!isFormMessageValid"
                  color="primary"
                  class="mt-4"
                  @click="submitMessage"
              >
                Send
              </v-btn>

            </v-form>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {ref, onMounted, watch, computed} from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { useMessageStore } from "../store/messages";

export default {
  name: "Dialogue",
  props: {
    advertId: String,
    dialogUserId: String,
    advertVisible: Boolean,
  },

  setup(props) {

    const isFormMessageValid = ref(false);

    const router = useRouter();
    const messageStore = useMessageStore();
    const authStore = useAuthStore();

    const messages = ref([]);
    const newMessage = ref("");
    const dialogueId = ref(null);

    const rules = {
      required: (value) => !!value || "Required field",
    };



    const fetchMessages = async () => {
      try {
        const params = {
          advertId: props.advertId,
          userId: (!!props.dialogUserId) ? props.dialogUserId : authStore.userId,
        }
        await messageStore.getMessages(params);
        messages.value = messageStore.messages;
        dialogueId.value = messageStore.dialogueId;
      } catch (error) {
        console.error("Error loading messages:", error);
        router.push({ name: "Home" });
      }
    };

    const submitMessage = async () => {
      let messageParams = {
        "message": newMessage.value,
        "advert_id": props.advertId,
      }
      if (dialogueId.value) {
        messageParams.dialogue_id = dialogueId.value;
      }

      try {
        const response = await messageStore.createMessage(messageParams);
        newMessage.value = "";
        await fetchMessages();
      } catch (error) {
        console.error("Error creating message:", error);
      }
    };

    onMounted(() => {
      fetchMessages();
    });

    return {
      messages,
      newMessage,
      dialogueId,
      rules,
      isFormMessageValid,
      submitMessage,
    };
  },
};
</script>

<style scoped>
.message-author {
  display: flex;
  justify-content: flex-start;
}

.message-user {
  display: flex;
  justify-content: flex-end;
}

.author-message {
  background-color: #e3f2fd;
  padding: 8px 12px;
  border-radius: 12px;
  display: block;
  max-width: 100%;
  word-wrap: break-word;
  text-align: left;
}

.user-message {
  background-color: #c8e6c9;
  padding: 8px 12px;
  border-radius: 12px;
  display: block;
  max-width: 100%;
  word-wrap: break-word;
  text-align: left;
}
</style>