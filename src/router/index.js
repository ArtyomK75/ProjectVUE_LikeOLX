import {createRouter, createWebHistory} from 'vue-router';
import useAuthStore  from "@/store/auth.js";
import HomePage from '../components/HomePage.vue';
import AdminPage from '../components/AdminPage.vue';
import ModeratorPage from '../components/ModeratorPage.vue';
import NotFoundPage from '../components/NotFoundPage.vue';
import UserPage from '../components/UserPage.vue';
import AdvertDetail from "@/components/AdvertDetail.vue";
import Register from "@/components/Register.vue";
import LoginLogout from "@/components/LoginLogout.vue";
import CreateAdvert from "@/components/CreateAdvert.vue";


export const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminPage,
        meta: { requiresAuth: true, isAdmin: true }
    },
    {
        path: '/moderator',
        name: 'Moderator',
        component: ModeratorPage,
        meta: { requiresAuth: true, isModerator: true }
    },
    {
        path: "/advert/:id",
        name: "AdvertDetail",
        component: AdvertDetail,
        props: true,
    },

    {
        path: "/advert/:id/:dialogUserId",
        name: "AdvertDetailUserDialog",
        component: AdvertDetail,
        props: true,
    },

    {
        path: "/advert/create",
        name: "CreateAdvert",
        component: CreateAdvert,
        meta: { requiresAuth: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    {
        path: '/login',
        name: 'LoginLogout',
        component: LoginLogout,
    },
    {
        path: '/notFound',
        name: 'NotFound',
        component: NotFoundPage
    },
    {
        path: '/user',
        name: 'User',
        component: UserPage,
        meta: { requiresAuth: true }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {

    const authStore = useAuthStore();

    const isAuthenticated = authStore.isLoggedIn;
    const isAdmin = authStore.isAdmin;
    const isModerator = authStore.isModerator;

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            next({name: 'LoginLogout'});
        } else if (to.matched.some(record => record.meta.isAdmin) && !isAdmin) {
            next({name: 'NotFound'});
        } else if (to.matched.some(record => record.meta.isModerator) && !isModerator) {
            next({name: 'NotFound'});
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;