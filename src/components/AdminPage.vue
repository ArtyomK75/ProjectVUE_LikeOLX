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
                @keydown.enter="fetchUsers"
            ></v-text-field>
          </template>

          <v-data-table-server
              v-model:items-per-page="pagination.itemsPerPage"
              :headers="headers"
              :items="users"
              :items-length="pagination.totalItems"
              :loading="loading"
              item-value="id"
              @update:options="fetchUsers"
              item-selectable="selectable"
          >

            <template v-slot:top>
              <v-toolbar
                  flat
              >
                <v-toolbar-title>USERS</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog
                    v-model="dialog"
                    max-width="800px"
                >
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">{{ formTitle }}</span>
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
                                v-model="editedItem.name"
                                label="Dessert name"
                            ></v-text-field>
                          </v-col>
                          <v-col
                              cols="12"
                              md="4"
                              sm="6"
                          >
                            <v-text-field
                                v-model="editedItem.email"
                                label="e-mail"
                            ></v-text-field>
                          </v-col>
                          <v-col
                              cols="12"
                              md="4"
                              sm="6"
                          >

                            <v-select
                                v-model="editedItem.role_id"
                                :items="roles"
                                item-value="id"
                                item-title="name"
                                item-text="name"
                                label="Role"
                            ></v-select>
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
                    <v-card-title class="text-h5">Are you sure you want to delete this user?</v-card-title>
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
            <template v-slot:item.actions="{ item }">
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
import {nextTick, onMounted, reactive, ref, watch} from "vue";
import { useUserStore } from "../store/users.js";

export default {
  name: "AdminPage",
  setup() {
    const userStore = useUserStore();
    const users = ref([]);
    const loading = ref(false);
    const search = ref("");

    const dialog = ref(false);
    const dialogDelete = ref(false);
    const editedIndex = ref(-1);
    const desserts = ref([]);
    const roles = ref([]);
    const formTitle = ref("New User");


    const defaultItem = reactive({
      id: '',
      name: '',
      email: '',
      role_name: 'user',
      role_id: 3,
      is_deleted: false,
    });

    const editedItem = reactive({
      ...defaultItem,
    });

    const headers = ref([
      { title: "User name", align: 'start', key: 'name', sortable: false},
      { title: "e-mail", align: 'end', key: 'email', sortable: false},
      { title: "Role", align: 'end', key: 'role_name', sortable: false},
      { title: "Deleted", align: 'end', key: 'is_deleted', sortable: false},
      { title: 'Actions', key: 'actions', sortable: false },
    ]);

    const pagination = reactive({
      page: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
    });

    const fetchUsers = async ({page, itemsPerPage}) => {
      try {
        loading.value = true;
        await userStore.getUsers({
          page: page,
          itemsPerPage: itemsPerPage,
          search: search.value,
        });
        loading.value = false;
        users.value = userStore.users;
        roles.value = userStore.roles;
        pagination.page = userStore.currentPage || 1;
        pagination.totalPages = userStore.totalPages || 1;
        pagination.totalItems = userStore.totalItems || 0;
        pagination.itemsPerPage = userStore.perPage || 10;
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    const saveUser = async (user, userId) => {
      try {
        await userStore.updateUser(user, userId);
      } catch (error) {
        console.error("Error save user:", error);
      }
    };

    const deleteUser = async (userId) => {
      try {
        await userStore.deleteUser(userId);
      } catch (error) {
        console.error("Error save user:", error);
      }
    };


    const editItem = (item) => {
      editedIndex.value = users.value.indexOf(item);
      Object.assign(editedItem, item);
      editedItem.role_id = item.role_id;
      dialog.value = true;
    };

    const deleteItem = (item) => {
      editedIndex.value = users.value.indexOf(item);
      Object.assign(editedItem, item);
      dialogDelete.value = true;
    };

    const deleteItemConfirm = () => {
      editedItem.is_deleted = 1;
      deleteUser(editedItem.id);
      updateUsersInTable(editedItem);
      closeDelete();
    };

    const updateUsersInTable = (editUser) => {
      const user = users.value.find(user => user.id === editUser.id);
      Object.assign(user, editUser);
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
      if (editedIndex.value > -1) {
        //here create new user
        //in time, may be
        //Object.assign(users.value[editedIndex.value], editedItem);
      } else {
        const user = {
            id: editedItem.id,
            name: editedItem.name,
            email: editedItem.email,
            role_id: editedItem.role_id,
        }
        editedItem.role_name = roles.value.find(role => role.id === editedItem.role_id).name;
        saveUser(user, user.id);
        updateUsersInTable(editedItem);
      }
      close();
    };

    watch(dialog, (val) => {
      if (!val) close();
    });
    watch(dialogDelete, (val) => {
      if (!val) closeDelete();
    });

    onMounted(() => {
      fetchUsers({ page: 1, itemsPerPage: 10 });
    })

    return {
      users,
      headers,
      search,
      pagination,
      loading,
      fetchUsers,
      roles,

      formTitle,
      dialog,
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