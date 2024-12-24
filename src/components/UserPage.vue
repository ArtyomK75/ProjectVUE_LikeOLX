<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-data-table-server
              v-model:items-per-page="pagination.itemsPerPage"
              :headers="headers"
              :items="adverts"
              :items-length="pagination.totalItems"
              :loading="loading"
              :expanded.sync="expanded"
              item-value="id"
              show-expand
              @update:options="fetchAdverts"
              @click="deleteItem(item)"
          >
            <template v-slot:top>
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
                  size="small"
                  @click="deleteItem(item)"
              >
                mdi-delete
              </v-icon>


            </template>

            <template v-slot:expanded-row="{ item }">
              <tbody v-if="item.dialogues">
              <tr
                  v-for="dialogue in item.dialogues"
                  :key="dialogue.user_id"
                  class="expanded-row"
                  :class="{ 'unread': dialogue.is_not_read }"
                  @click="openDialogue(dialogue.advert_id, dialogue.user_id)"
              >
                <td
                class="table-cell"
                >
                  Author of dialogue: {{ dialogue.user_name }}
                </td>
                <td
                    class="table-cell"
                >
                  Has unread messages: {{ dialogue.is_not_read ? "Yes" : "No" }}
                </td>
              </tr>
              </tbody>
            </template>

          </v-data-table-server>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import {computed, nextTick, reactive, ref, watch} from "vue";
import { useAdvertStore } from "../store/adverts.js";
import { useAuthStore } from "../store/auth.js";
import { cloneDeep } from 'lodash';
import {mdi} from "vuetify/iconsets/mdi";
import router from "@/router/index.js";

export default {
  name: "UserPage",
  methods: {
    mdi() {
      return mdi
    }
  },
  setup() {
    const advertStore = useAdvertStore();
    const authStore = useAuthStore();
    const adverts = ref([]);
    const expanded = ref([]);
    const loading = ref(false);

    const headers = ref([
      { title: "Title", align: 'start', key: 'title', sortable: false},
      { title: "Price", align: 'end', key: 'price', sortable: false},
      { title: "Is active status", align: 'end', key: 'is_active', sortable: false},
      { title: "Count dialogues", align: 'end', key: 'dialogues.length', sortable: false},
      { title: "Actions", align: 'end', key: 'actions', sortable: false},
    ]);

    const pagination = reactive({
      page: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
    });

    const defaultItem = reactive({
      id: '',
      title: '',
      is_deleted: 0,
    });

    const editedItem = reactive({
      ...defaultItem,
    });
    const dialogDelete = ref(false);
    const editedIndex = ref(-1);

    const fetchAdverts = async ({page, itemsPerPage}) => {
      try {
        loading.value = true;
        await advertStore.getUserAdverts({
          page: page,
          itemsPerPage: itemsPerPage,
        }, authStore.userId);
        loading.value = false;
        adverts.value = cloneDeep(advertStore.adverts);
        pagination.page = advertStore.currentPage || 1;
        pagination.totalPages = advertStore.totalPages || 1;
        pagination.totalItems = advertStore.totalItems || 0;
        pagination.itemsPerPage = advertStore.perPage || 10;
      } catch (error) {
        console.error("Error loading adverts:", error);
      }
    };

    const deleteAdvert = async (advertId) => {
      try {
        console.log('deleted');
        await advertStore.deleteAdvert(advertId);
      } catch (error) {
        console.error("Error delete advert:", error);
      }
    };

    const isActiveIcon = computed(() => (item) => {
      return item.is_active ? 'mdi-check' : 'mdi-close';
    });

    const toggleExpand = (id) => {
      const expanded = adverts.value.find((advert) => advert.id === id);
      expanded.isExpanded = !expanded.isExpanded;
    };

    const openDialogue = (advertId, userId) => {
      router.push({ name: "AdvertDetailUserDialog", params: { id: advertId , dialogUserId: userId} });
    };


    const openItem = (item) => {
      router.push({ name: 'AdvertDetail', params: { id: item.id } });
    };

    const deleteItem = (item) => {
      editedIndex.value = adverts.value.indexOf(item);
      Object.assign(editedItem, item);
      dialogDelete.value = true;
    };

    const deleteItemConfirm = () => {
      editedItem.is_deleted = 1;
      adverts.value = adverts.value.filter(item => item.id !== editedItem.id);
      deleteAdvert(editedItem.id);
      closeDelete();
    };


    const closeDelete = () => {
      dialogDelete.value = false;
      nextTick(() => {
        Object.assign(editedItem, defaultItem);
        editedIndex.value = -1;
      });
    };


    watch(
        () => authStore.userId,
        (newUserId) => {
          if (newUserId) {
            fetchAdverts({ page: 1, itemsPerPage: 10 });
          }
        },
        { immediate: true }
    );
    return {
      adverts,
      headers,
      expanded,
      pagination,
      loading,
      isActiveIcon,
      openItem,
      toggleExpand,
      openDialogue,
      fetchAdverts,
      deleteItemConfirm,
      dialogDelete,
      closeDelete,
      deleteItem,
    };
  },
};
</script>

<style scoped>

.expanded-row.unread {
  background-color: #f5f5f5;
  -webkit-text-stroke-width: medium;
}

.expanded-row:hover {
  cursor: pointer;
  background-color: lightgray;
}


.expanded-row td {
  padding-top: 15px;
  padding-bottom: 15px;
}
 .expanded-row td:first-child {
   padding-left: 60px;
 }


.table-cell {
  padding-left: 15px;
}
</style>