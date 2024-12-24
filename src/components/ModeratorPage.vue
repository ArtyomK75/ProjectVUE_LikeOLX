<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">

          <template v-slot:text>
            <v-text-field
                v-model="search"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
                @keydown.enter="fetchAdverts"
                min-width="800px"
            ></v-text-field>
          </template>

          <v-data-table-server
              v-model:items-per-page="pagination.itemsPerPage"
              :headers="headers"
              :items="adverts"
              :items-length="pagination.totalItems"
              :loading="loading"
              item-value="id"
              @update:options="fetchAdverts"
              item-selectable="selectable"
          >

            <template v-slot:top>
              <v-toolbar
                  flat
              >
                <v-toolbar-title>ADVERTS</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-spacer>
                  <v-switch
                      v-model="NonActiveMessagesOnly"
                      color="primary"
                      label="Non active messages"
                      hide-details
                      inset
                  ></v-switch>
                </v-spacer>
                <v-dialog
                    v-model="dialog"
                    max-width="800px"
                >
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">Edit advert</span>
                    </v-card-title>

                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col
                              cols="12"
                              md="4"
                              sm="6"
                          >
                            <v-text-field
                                v-model="editedItem.title"
                                label="Title"
                            ></v-text-field>
                          </v-col>
                          <v-col
                              cols="12"
                              md="4"
                              sm="6"
                          >
                            <v-textarea
                                v-model="editedItem.description"
                                label="Description"
                            ></v-textarea>
                          </v-col>
                          <v-col
                              cols="12"
                              md="4"
                              sm="6"
                          >
                            <v-text-field
                                v-model="editedItem.price"
                                label="price"
                                type="number"
                            ></v-text-field>
                          </v-col>
                          <v-col
                              cols="12"
                              md="4"
                              sm="6"
                          >
                            <v-checkbox
                                v-model="editedItem.is_active"
                                color="primary"
                                label="Is active"
                                value="1"
                                hide-details
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="close"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="save"
                      >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="700px">
                  <v-card>
                    <v-card-title class="text-h5">Are you sure you want to delete this advert?</v-card-title>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
                      <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
            </template>

            <template v-slot:item.is_active="{ item }">
              <v-icon :color="item.is_active ? 'green' : 'red'">{{ isActiveIcon(item) }}</v-icon>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-icon
                  class="me-2"
                  size="small"
                  @click="openItem(item)"
              >
                mdi-eye
              </v-icon>

              <v-icon
                  class="me-2"
                  size="small"
                  @click="editItem(item)"
              >
                mdi-pencil
              </v-icon>

              <v-icon
                  size="small"
                  @click="deleteItem(item)"
              >
                mdi-delete
              </v-icon>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import {computed, nextTick, onMounted, reactive, ref, watch} from "vue";
import { useAdvertStore } from "../store/adverts.js";
import router from "@/router/index.js";

export default {
  name: "AdminPage",
  setup() {
    const advertStore = useAdvertStore();
    const adverts = ref([]);
    const loading = ref(false);
    const search = ref("");

    const dialog = ref(false);
    const dialogDelete = ref(false);
    const editedIndex = ref(-1);
    const NonActiveMessagesOnly = ref(true);


    const defaultItem = reactive({
      id: '',
      title: '',
      description: '',
      price: 0,
      is_active: 0,
      is_deleted: 0,
    });

    const editedItem = reactive({
      ...defaultItem,
    });

    const headers = ref([
      { title: "Title", align: 'start', key: 'title', sortable: false},
      { title: "Price", align: 'end', key: 'price', sortable: false},
      { title: "Is active status", align: 'center', key: 'is_active', sortable: false},
      { title: "Actions", align: 'center', key: 'actions', sortable: false},
    ]);

    const pagination = reactive({
      page: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
    });

    const isActiveIcon = computed(() => (item) => {
      return item.is_active ? 'mdi-check' : 'mdi-close';
    });


    const fetchAdverts = async ({page, itemsPerPage}) => {
      try {
        loading.value = true;
        await advertStore.getModeratedAdverts({
          page: page,
          itemsPerPage: itemsPerPage,
          search: search.value,
        }, NonActiveMessagesOnly.value);
        loading.value = false;
        adverts.value = advertStore.adverts;
        pagination.page = advertStore.currentPage || 1;
        pagination.totalPages = advertStore.totalPages || 1;
        pagination.totalItems = advertStore.totalItems || 0;
        pagination.itemsPerPage = advertStore.perPage || 10;
      } catch (error) {
        console.error("Error loading adverts:", error);
      }
    };

    const saveAdvert = async (advert, advertId) => {
      try {
        await advertStore.updateAdvert(advert, advertId);
      } catch (error) {
        console.error("Error save advert:", error);
      }
    };

    const deleteAdvert = async (advertId) => {
      try {
        await advertStore.deleteModeratedAdvert(advertId);
      } catch (error) {
        console.error("Error delete advert:", error);
      }
    };

    const openItem = (item) => {
      router.push({ name: 'AdvertDetail', params: { id: item.id } });
    };

    const editItem = (item) => {
      editedIndex.value = adverts.value.indexOf(item);
      Object.assign(editedItem, item);
      dialog.value = true;
    };

    const deleteItem = (item) => {
      editedIndex.value = adverts.value.indexOf(item);
      Object.assign(editedItem, item);
      dialogDelete.value = true;
    };

    const deleteItemConfirm = () => {
      editedItem.is_deleted = 1;
      deleteAdvert(editedItem.id);
      updateAdvertsInTable(editedItem);
      closeDelete();
    };

    const updateAdvertsInTable = (editAdvert) => {
      const advert = adverts.value.find(advert => advert.id === editAdvert.id);
      if (editAdvert.is_deleted
          || (NonActiveMessagesOnly.value &&  editAdvert.is_active)) {
        adverts.value = adverts.value.filter(advert => advert.id !== editAdvert.id);
        return;
      }
      if (advert) {
        Object.assign(advert, editAdvert);
        advert.is_active = editAdvert.is_active ? 1 : 0;
      }
    }

    const close = () => {
      dialog.value = false;
      nextTick(() => {
        Object.assign(editedItem, defaultItem);
        editedIndex.value = -1;
      });
    };

    const closeDelete = () => {
      dialogDelete.value = false;
      nextTick(() => {
        Object.assign(editedItem, defaultItem);
        editedIndex.value = -1;
      });
    };

    const save = () => {
        const advert = {
          id: editedItem.id,
          title: editedItem.title,
          description: editedItem.description,
          price: editedItem.price,
          is_active: editedItem.is_active,
        };
        saveAdvert(advert, advert.id);
        updateAdvertsInTable(editedItem);
        close();
    };

    watch(NonActiveMessagesOnly, () => {
      fetchAdverts({ page: 1, itemsPerPage: 10 });
    });

    watch(dialog, (val) => {
      if (!val) close();
    });
    watch(dialogDelete, (val) => {
      if (!val) closeDelete();
    });

    onMounted(() => {
      fetchAdverts({ page: 1, itemsPerPage: 10 });
    })

    return {
      adverts,
      headers,
      search,
      pagination,
      loading,
      fetchAdverts,
      openItem,
      isActiveIcon,
      dialog,
      NonActiveMessagesOnly,
      dialogDelete,
      editedItem,
      editedIndex,
      editItem,
      deleteItem,
      deleteItemConfirm,
      close,
      closeDelete,
      save,

    };
  },
};
</script>

<style scoped>

</style>