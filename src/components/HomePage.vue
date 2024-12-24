

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="pa-3" v-if="categories.length" min-width="200px">
          <v-card-title>Categories</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item
                v-for="category in categories"
                :key="category.id"
                @click="selectCategory(category.id)"
                :class="{'selected-category': selectedCategory === category.id}"
            >
              <v-list-item-title>{{ category.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col :cols="categories.length ? '9' : '12'">

        <v-row>
          <v-text-field
            v-model="searchQuery"
            append-inner-icon="mdi-magnify"
            density="compact"
            label="Search..."
            variant="solo"
            hide-details
            single-line
            @click:append-inner="fetchAdverts"
            min-width="600px"
          ></v-text-field>
        </v-row>

        <v-row v-if="adverts.length">
          <v-col
              v-for="advert in adverts"
              :key="advert.id"
              cols="12"
              md="6"
              lg="4"
          >
            <v-card>
              <v-img :src="getImagePath(advert.image)" height="200px"></v-img>
              <v-card-title>{{ advert.title }}</v-card-title>
              <v-card-subtitle>{{ advert.price }} $</v-card-subtitle>
              <v-card-text>{{ advert.description }}</v-card-text>
              <v-card-actions>
                <v-btn @click="viewAdvert(advert.id)">more details...</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col class="text-center py-5">
            <v-alert border-s-md type="info" elevation="2">
              Adverts not found.
            </v-alert>
          </v-col>
        </v-row>

        <v-row v-if="adverts.length">
          <v-col class="d-flex justify-center">
            <v-pagination
                v-model="currentPage"
                :length="totalPages"
                @input="handlePageChange"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {ref, onMounted, watch} from "vue";
import { useAdvertStore } from "../store/adverts";
import router from "@/router/index.js";

export default {
  name: "AdvertPage",
  setup() {
    const categories = ref([]);
    const adverts = ref([]);
    const selectedCategory = ref(null);
    const searchQuery = ref("");
    const currentPage = ref(1);
    const totalPages = ref(1);
    const itemsPerPage = 20;

    const advertStore = useAdvertStore();

    const fetchCategories = async () => {
      try {
        await advertStore.getCategories();
        categories.value = advertStore.categories;
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    const fetchAdverts = async () => {
      try {
        await advertStore.getAdverts({
          category: selectedCategory.value === null ? undefined : selectedCategory.value,
          search: searchQuery.value,
          page: currentPage.value,
          itemsPerPage: itemsPerPage,
        });
        adverts.value = advertStore.adverts;

        totalPages.value = advertStore.totalPages || 1;
      } catch (error) {
        console.error("Error loading adverts:", error);
      }
    };

    const handlePageChange = (page) => {
      console.log(page);
      currentPage.value = page;
      fetchAdverts();
    };

    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId;
      currentPage.value = 1;
      fetchAdverts();
    };

    const viewAdvert = (advertId) => {
      router.push({ name: 'AdvertDetail', params: { id: advertId } });
    };

    const getImagePath = (data) => {
      if (!data) return "";
      return data;
    }
    watch(currentPage, () => {
      fetchAdverts();
    });

    onMounted(() => {
      fetchCategories();
      fetchAdverts();
    });

    return {
      categories,
      adverts,
      selectedCategory,
      searchQuery,
      currentPage,
      totalPages,
      fetchAdverts,
      handlePageChange,
      selectCategory,
      viewAdvert,
      getImagePath,
    };
  },
};
</script>

<style scoped>
.selected-category {
  background-color: #e3f2fd;
}
</style>