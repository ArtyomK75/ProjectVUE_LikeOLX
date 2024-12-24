<script>
import { computed } from 'vue';
import { useAuthStore } from "@/store/auth.js";
import router from "@/router/index.js";

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore();

    const userName = computed(() => {
      return authStore.isLoggedIn ? `(${authStore.loggedUserName})` : '';
    });

    const getButtonNameLogInOut = computed(() => {
      return authStore.isLoggedIn ? 'Logout' : 'Login';
    });

    const goToUserPage = () => {
      if (authStore.userId) {
        router.push({ name: 'User'});
      }
    };

    authStore.initializeAuth();

    return {
      isLoggedIn: computed(() => authStore.isLoggedIn),
      isAdmin: computed(() => authStore.isAdmin),
      isModerator: computed(() => authStore.isModerator),
      userName,
      getButtonNameLogInOut,
      goToUserPage,
    };
  },
};
</script>

<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-title>
        <h3 class="text-h4 white--text">Like OLX</h3>
      </v-app-bar-title>


      <v-btn @click="$router.push({name: 'Home'})">
        Home
      </v-btn>

      <v-btn v-if="isLoggedIn && isModerator" @click="$router.push({name: 'Moderator'})">
        Moderator panel
      </v-btn>

      <v-btn v-if="isLoggedIn && isAdmin" @click="$router.push({name: 'Admin'})">
        Admin panel
      </v-btn>

      <v-spacer></v-spacer>
      <v-btn v-if="!isLoggedIn" @click="$router.push({name: 'Register'})">
        Sign in
      </v-btn>

      <v-btn @click="$router.push({name: 'LoginLogout'})">
        {{ getButtonNameLogInOut }}
      </v-btn>

      <v-btn v-if="isLoggedIn" @click="$router.push({name: 'CreateAdvert'})">
        place an ad
      </v-btn>

      <v-btn v-if="isLoggedIn" @click="goToUserPage">
        User page {{ userName }}
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<style>

</style>