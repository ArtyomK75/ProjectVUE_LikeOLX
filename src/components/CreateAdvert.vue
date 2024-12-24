<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card min-width="600px">
          <v-card-title>Создание нового объявления</v-card-title>
          <v-card-text>
            <v-form v-model="isFormValid">
              <v-text-field
                  v-model="form.title"
                  label="Title"
                  :rules="[rules.required]"
                  outlined
              ></v-text-field>

              <v-textarea
                  v-model="form.description"
                  label="Description"
                  :rules="[rules.required]"
                  outlined
              ></v-textarea>

              <v-text-field
                  v-model="form.price"
                  label="Price"
                  type="number"
                  :rules="[rules.required, rules.numeric]"
                  outlined
              ></v-text-field>

              <v-select
                  v-model="form.category"
                  :items="categories"
                  item-title="text"
                  item-value="value"
                  label="Category"
                  :rules="[rules.required]"
                  return-object
                  single-line
              ></v-select>

              <v-file-input
                  v-model="form.pictures"
                  :rules="[rules.picture]"
                  label="Images"
                  multiple
                  show-size
                  accept="image/png, image/jpeg, image/bmp"
                  outlined
              ></v-file-input>

              <v-btn
                  :disabled="!isFormValid"
                  color="primary"
                  class="mt-4"
                  @click="submitAdvert"
              >
                Send
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-snackbar v-model="snackbar" color="success">
          Your ad has been submitted for moderation
          <v-btn color="white" @click="snackbar = false">Закрыть</v-btn>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { useAdvertStore } from "../store/adverts";
import {useRouter} from "vue-router";

export default {
  name: "CreateAdvert",
  setup() {
    const advertStore = useAdvertStore();

    // Form state
    const form = reactive({
      title: "",
      description: "",
      price: null,
      category: null,
      pictures: [],
    });

    const categories = ref([]);
    const snackbar = ref(false);
    const isFormValid = ref(false);
    const router = useRouter();

    const rules = {
      required: (value) => !!value || "Required field",
      numeric: (value) => !isNaN(parseFloat(value)) || "Must be a numeric",
      picture: (value) => !value || !value.length || value[0].size < 1000000 || 'Image size should be less than 1 MB!'
    };

    const fetchCategories = async () => {
      try {
        await advertStore.getCategories();
        categories.value = advertStore.categories.map((cat) => ({
          text: cat.name,
          value: cat.id,
        }));
      } catch (error) {
        console.error("Error loading category:", error);
      }
    };

    const submitAdvert = async () => {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category_id", form.category.value);

      if (form.pictures && form.pictures.length > 0) {
        form.pictures.forEach((file) => {
          console.log(file instanceof File);
          formData.append("pictures[]", file);
        });
      }
      try {
        const response = await advertStore.createAdvert(formData);
        snackbar.value = true;
        router.push({ name: "AdvertDetail", params: { id: response.id } });
        resetForm();
      } catch (error) {
        console.error("Error creating advert:", error);
      }
    };

    const resetForm = () => {
      form.title = "";
      form.description = "";
      form.price = null;
      form.category = null;
      form.pictures = [];
    };

    onMounted(() => {
      fetchCategories();
    });

    return {
      form,
      categories,
      snackbar,
      isFormValid,
      rules,
      submitAdvert,
    };
  },
};
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>