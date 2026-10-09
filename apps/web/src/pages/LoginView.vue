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
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import { APP_NAME } from "@/lib/config";
import { getErrorMessage, getRestErrorMessage } from "@/utils/errors";
import { isUser } from "@/utils/guards";
import { useTRPCUtils } from "@/utils/query";

const router = useRouter();
const route = useRoute();
const utils = useTRPCUtils();

// Chemin interne uniquement, pour éviter une redirection ouverte.
const redirectTarget = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")
    ? redirect
    : "/";
});

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref("");

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
      const parsed: unknown = await res.json();
      if (!isUser(parsed)) {
        errorMsg.value = getRestErrorMessage(parsed, "Impossible de vous connecter.");
        return;
      }
      utils.setData("user", undefined, parsed);
      await router.push(redirectTarget.value);
    } else {
      const body: unknown = await res.json().catch(() => null);
      errorMsg.value = getRestErrorMessage(body, "Impossible de vous connecter.");
    }
  } catch (error) {
    errorMsg.value = getErrorMessage(error, "Impossible de vous connecter.");
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
        <p v-if="errorMsg" role="alert" class="[color:#721c24] mb-sm">
          <FontAwesomeIcon :icon="faExclamationCircle" class="mr-sm" />
          {{ errorMsg }}
        </p>
        <div class="mb-5 [color:#666] [font-size:14px]">
          <label for="username" class="uppercase font-medium">Identifiant</label>
          <AppInput
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            autofocus
            required
          />
        </div>
        <div class="mb-5 [color:#666] [font-size:14px]">
          <div class="flex">
            <label for="password" class="uppercase font-medium"> Mot de passe </label>
            <button
              type="button"
              class="ml-auto"
              :aria-pressed="showPassword"
              aria-controls="password"
              @click="showPassword = !showPassword"
            >
              <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" class="mr-1" />
              {{ showPassword ? "Masquer" : "Afficher" }}
            </button>
          </div>
          <AppInput
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
        </div>
        <AppButton type="submit" :disabled="isSubmitting">
          <FontAwesomeIcon
            :icon="isSubmitting ? faSpinner : faSignInAlt"
            :spin="isSubmitting"
            class="mr-2"
          />
          Connexion
        </AppButton>
      </form>
    </section>
  </div>
</template>
