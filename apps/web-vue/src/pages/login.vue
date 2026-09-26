<script setup lang="ts">
import {
  faExclamationCircle,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { useRouter } from "vue-router";

import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import { APP_NAME } from "@/lib/config";
import { useTRPCUtils } from "@/utils/query";
import type { RouterOutput } from "@/utils/trpc";

const router = useRouter();
const utils = useTRPCUtils();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref("");

const translateErrorMessage = (msg: string) =>
  msg === "Invalid credentials" ? "Identifiants invalides" : msg;

const onSubmit = async () => {
  isSubmitting.value = true;
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });
    if (res.ok) {
      const user = (await res.json()) as RouterOutput["user"];
      utils.setData("user", undefined, user);
      await router.push("/");
    } else {
      const { error } = (await res.json()) as { error: string };
      errorMsg.value = translateErrorMessage(error);
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="h-full w-full relative">
    <div class="bg-primary w-full h-1/2 absolute top-0" />
    <section class="flex flex-col justify-center items-center h-full relative">
      <h1 class="font-['Niconne'] [font-size:52px] text-white mb-4">
        {{ APP_NAME }}
      </h1>
      <form
        class="p-10 flex flex-col bg-white [box-shadow:0px_29px_147.5px_102.5px_hsla(0,0%,0%,0.05),0px_29px_95px_0px_hsla(0,0%,0%,0.16)]"
        @submit.prevent="onSubmit"
      >
        <h2
          class="[border-bottom:1px_solid_#ddd] pb-5 mb-5 uppercase text-center font-medium [font-size:26px]"
        >
          <FontAwesomeIcon :icon="faUser" class="mr-2" />
          Connexion
        </h2>
        <p v-if="errorMsg" class="[color:#721c24] mb-sm">
          <FontAwesomeIcon :icon="faExclamationCircle" class="mr-sm" />
          {{ errorMsg }}
        </p>
        <div class="mb-5 [color:#666] [font-size:14px]">
          <label for="username" class="uppercase font-medium"
            >Identifiant</label
          >
          <Input
            id="username"
            v-model="username"
            type="text"
            autofocus
            required
          />
        </div>
        <div class="mb-5 [color:#666] [font-size:14px]">
          <div class="flex">
            <label for="password" class="uppercase font-medium">
              Mot de passe
            </label>
            <button
              type="button"
              class="ml-auto"
              @click="showPassword = !showPassword"
            >
              <FontAwesomeIcon
                :icon="showPassword ? faEyeSlash : faEye"
                class="mr-1"
              />
              {{ showPassword ? "Masquer" : "Afficher" }}
            </button>
          </div>
          <Input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="off"
            required
          />
        </div>
        <Button type="submit" :disabled="isSubmitting">
          <FontAwesomeIcon
            :icon="isSubmitting ? faSpinner : faSignInAlt"
            :spin="isSubmitting"
            class="mr-2"
          />
          Connexion
        </Button>
      </form>
    </section>
  </div>
</template>
