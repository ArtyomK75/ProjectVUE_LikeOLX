<template>
  <section class="vh-100">
    <div class="container h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-lg-12 col-xl-11">
          <div class="card text-black" style="border-radius: 25px;">
            <div class="card-body p-md-5">
              <div class="row justify-content-center">
                <div class="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                  <p class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
                  <form class="mx-1 mx-md-4" @submit.prevent="register">
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                      <div data-mdb-input-init class="form-outline flex-fill mb-0">
                        <input
                            type="text"
                            id="userName"
                            class="form-control"
                            v-model="form.userName"
                        />
                        <label class="form-label" for="userName">User name</label>
                        <p class="small fw-bold text-danger">{{ userNameError }}</p>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                      <div data-mdb-input-init class="form-outline flex-fill mb-0">
                        <input
                            type="email"
                            id="email"
                            class="form-control"
                            v-model="form.email"
                        />
                        <label class="form-label" for="email">Your Email</label>
                        <p class="small fw-bold text-danger">{{ emailError }}</p>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                      <div data-mdb-input-init class="form-outline flex-fill mb-0">
                        <input
                            type="password"
                            id="password"
                            class="form-control"
                            v-model="form.password"
                        />
                        <label class="form-label" for="password">Password</label>
                        <p class="small fw-bold text-danger">{{ passwordError }}</p>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-key fa-lg me-3 fa-fw"></i>
                      <div data-mdb-input-init class="form-outline flex-fill mb-0">
                        <input
                            type="password"
                            id="confirmPassword"
                            class="form-control"
                            v-model="form.confirmPassword"
                        />
                        <label class="form-label" for="confirmPassword">Repeat your password</label>
                        <p class="small fw-bold text-danger">{{ repeatPasswordError }}</p>
                      </div>
                    </div>
                    <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                      <button type="submit" class="btn btn-primary btn-lg">Sign up</button>
                    </div>
                  </form>
                </div>
                <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                  <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                      class="img-fluid"
                      alt="Sample image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, watch } from "vue";
import { useAuthStore } from "../store/auth";
import router from "@/router/index.js";

export default {
  name: "Register",
  setup() {
    const form = ref({
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const emailError = ref("");
    const passwordError = ref("");
    const repeatPasswordError = ref("");
    const userNameError = ref("");

    const validateUserName = (userName) => /^[A-Za-z0-9_.]+$/.test(userName);
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePassword = (password) => password.length >= 6;
    const validateConfirmPassword = () =>
        form.value.password === form.value.confirmPassword;

    watch(
        () => form.value.userName,
        (value) => {
          userNameError.value = validateUserName(value) ? "" : "Invalid user name";
        }
    );

    watch(
        () => form.value.email,
        (value) => {
          emailError.value = validateEmail(value) ? "" : "Invalid email";
        }
    );

    watch(
        () => form.value.password,
        (value) => {
          passwordError.value = validatePassword(value)
              ? ""
              : "Password must be at least 6 characters";
        }
    );

    watch(
        () => form.value.confirmPassword,
        () => {
          repeatPasswordError.value = validateConfirmPassword()
              ? ""
              : "Passwords do not match";
        }
    );

    const register = async () => {
      if (
          !validateUserName(form.value.userName) ||
          !validateEmail(form.value.email) ||
          !validatePassword(form.value.password) ||
          !validateConfirmPassword()
      ) {
        alert("Please correct the errors highlighted in red.");
        return;
      }

      const authStore = useAuthStore();
      try {
        await authStore.register({
          name: form.value.userName,
          email: form.value.email,
          password: form.value.password,
          password_confirmation: form.value.confirmPassword,
        });
        this.$router.push({ name: "Home" });
      } catch (error) {
        alert("Registration failed. Please try again.");
        console.error(error);
      }
    };

    return {
      form,
      emailError,
      passwordError,
      repeatPasswordError,
      userNameError,
      register,
    };
  },
};
</script>
