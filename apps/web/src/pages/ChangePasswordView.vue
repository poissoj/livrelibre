<script setup lang="ts">
import { faEye, faEyeSlash, faKey, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation } from "@tanstack/vue-query";
import { ref } from "vue";

import AppAlert from "@/components/AppAlert.vue";
import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import type { AlertMessage } from "@/components/form";
import { getErrorMessage } from "@/utils/errors";
import { trpcClient } from "@/utils/trpc";

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const alert = ref<AlertMessage | null>(null);

const { mutateAsync: changePassword, isPending } = useMutation({
  mutationFn: (input: { currentPassword: string; newPassword: string }) =>
    trpcClient.changePassword.mutate(input),
  meta: { errorToast: false },
});

const onSubmit = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert.value = {
      type: "error",
      message: "Les deux mots de passe ne correspondent pas.",
    };
    return;
  }
  alert.value = null;
  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    alert.value = {
      type: "success",
      message: "Le mot de passe a été modifié.",
    };
  } catch (error) {
    alert.value = { type: "error", message: getErrorMessage(error) };
  }
};
</script>

<template>
  <div class="ml-[10%] mr-[10%] flex-1">
    <AppCard class="max-h-full flex flex-col">
      <CardTitle :level="1">Changer mon mot de passe</CardTitle>
      <form class="flex-1 flex flex-col h-0" @submit.prevent="onSubmit">
        <CardBody class="flex-col gap-5">
          <div>
            <div class="flex">
              <label for="current-password" class="font-medium"> Mot de passe actuel </label>
              <button
                type="button"
                class="ml-auto"
                :aria-pressed="showCurrent"
                aria-controls="current-password"
                @click="showCurrent = !showCurrent"
              >
                <FontAwesomeIcon :icon="showCurrent ? faEyeSlash : faEye" class="mr-1" />
                {{ showCurrent ? "Masquer" : "Afficher" }}
              </button>
            </div>
            <AppInput
              id="current-password"
              v-model="currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              autocomplete="current-password"
              required
            />
          </div>
          <div>
            <div class="flex">
              <label for="new-password" class="font-medium"> Nouveau mot de passe </label>
              <button
                type="button"
                class="ml-auto"
                :aria-pressed="showNew"
                aria-controls="new-password"
                @click="showNew = !showNew"
              >
                <FontAwesomeIcon :icon="showNew ? faEyeSlash : faEye" class="mr-1" />
                {{ showNew ? "Masquer" : "Afficher" }}
              </button>
            </div>
            <AppInput
              id="new-password"
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </div>
          <div>
            <div class="flex">
              <label for="confirm-password" class="font-medium">
                Confirmer le nouveau mot de passe
              </label>
              <button
                type="button"
                class="ml-auto"
                :aria-pressed="showConfirm"
                aria-controls="confirm-password"
                @click="showConfirm = !showConfirm"
              >
                <FontAwesomeIcon :icon="showConfirm ? faEyeSlash : faEye" class="mr-1" />
                {{ showConfirm ? "Masquer" : "Afficher" }}
              </button>
            </div>
            <AppInput
              id="confirm-password"
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              required
            />
          </div>
        </CardBody>
        <CardFooter>
          <div class="flex justify-end mb-sm">
            <AppButton type="submit" class="px-md" :disabled="isPending">
              <FontAwesomeIcon
                :icon="isPending ? faSpinner : faKey"
                :spin="isPending"
                class="mr-sm"
              />
              Modifier
            </AppButton>
          </div>
          <AppAlert v-if="alert" :type="alert.type" @dismiss="alert = null">
            {{ alert.message }}
          </AppAlert>
        </CardFooter>
      </form>
    </AppCard>
  </div>
</template>
