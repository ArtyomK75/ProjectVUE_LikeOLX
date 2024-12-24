<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card v-if="advert" min-width="800">
          <v-card-title>{{ advert.title }}</v-card-title>
          <v-card-subtitle>
            Category: {{ advert.category }}
          </v-card-subtitle>
          <v-card-text>
            <p><strong>Description:</strong> {{ advert.description }}</p>
            <p><strong>Price:</strong> {{ advert.price }} $</p>
          </v-card-text>
          <v-carousel height="600"
                      show-arrows="hover"
                      hide-delimiter-background
                      v-if="advert.pictures && advert.pictures.length > 0"
          >
            <v-carousel-item v-for="(picture, i) in advert.pictures"
                             :key="i"
                             :src="picture.url"
                             cover
            >
            </v-carousel-item>
          </v-carousel>

          <v-card-actions>
            <v-btn @click="goBack">Back</v-btn>
          </v-card-actions>
        </v-card>

        <dialogue :advertId="advertId" :dialogUserId="dialogUserId" :advertVisible="advertVisible"></dialogue>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {ref, onMounted, computed} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdvertStore } from "../store/adverts";
import { useMessageStore } from "../store/messages";
import Dialogue from "./Dialogue.vue";

export default {
  name: "AdvertDetail",
  components: {
    Dialogue,
  },
  setup() {

    const isFormMessageValid = ref(false);

    const route = useRoute();
    const router = useRouter();
    const advertStore = useAdvertStore();
    const messageStore = useMessageStore();

    const advert = ref(null);
    const newMessage = ref("");
    const advertId = ref(route.params.id);
    const dialogUserId = ref(route.params.dialogUserId);




    const fetchAdvert = async () => {
      try {
        advert.value = await advertStore.getAdvert(advertId.value);
      } catch (error) {
        console.error("Error loading advert:", error);
        router.push({ name: "Home" });
      }
    };

    const goBack = () => {
      router.back();
    };

    const submitMessage = async () => {
      const messageParams = {
        "message": newMessage.value,
        "advert_id": advert.value.id,
      }
      try {
        const response = await messageStore.createMessage(messageParams);
        newMessage.value = "";
      } catch (error) {
        console.error("Error creating message:", error);
      }
    };

    onMounted(() => {
      fetchAdvert();
    });

    return {
      advert,
      advertId,
      dialogUserId,
      advertVisible: computed(() => (!!advert)),
      newMessage,
      isFormMessageValid,
      goBack,
      submitMessage,
    };
  },
};
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>
