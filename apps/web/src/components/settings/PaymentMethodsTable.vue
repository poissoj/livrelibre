<script setup lang="ts">
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faPen,
  faPlus,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { norm } from "@livrelibre/shared/utils";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import { queryKeys } from "@/lib/queryKeys";
import usePaymentMethods from "@/lib/usePaymentMethods";
import { type RouterInput, type RouterOutput, trpcClient } from "@/utils/trpc";

type PaymentMethodRow = RouterOutput["paymentMethods"][number];

const { methods } = usePaymentMethods();
const queryClient = useQueryClient();

const editingCode = ref<string | null>(null);
const editLabel = ref("");
const editActive = ref(true);
const editDefault = ref(false);

const creating = ref(false);
const newLabel = ref("");
const newIsDefault = ref(false);

watch(editActive, (active) => {
  if (!active) editDefault.value = false;
});
const newLabelInput = useTemplateRef<InstanceType<typeof AppInput>>("newLabelInput");
const newCode = computed(() =>
  norm(newLabel.value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""),
);

const invalidate = async () => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.settings.paymentMethods });
};

const { mutateAsync: updatePaymentMethod } = useMutation({
  mutationFn: (input: RouterInput["updatePaymentMethod"]) =>
    trpcClient.updatePaymentMethod.mutate(input),
  onSuccess: invalidate,
});
const { mutateAsync: deletePaymentMethod } = useMutation({
  mutationFn: (code: string) => trpcClient.deletePaymentMethod.mutate(code),
  onSuccess: invalidate,
});
const { mutateAsync: createPaymentMethod } = useMutation({
  mutationFn: (input: RouterInput["createPaymentMethod"]) =>
    trpcClient.createPaymentMethod.mutate(input),
  onSuccess: invalidate,
});
const { mutateAsync: reorderPaymentMethods } = useMutation({
  mutationFn: (input: RouterInput["reorderPaymentMethods"]) =>
    trpcClient.reorderPaymentMethods.mutate(input),
  onSuccess: invalidate,
});

const startEdit = (method: PaymentMethodRow) => {
  creating.value = false;
  editingCode.value = method.code;
  editLabel.value = method.label;
  editActive.value = method.active;
  editDefault.value = method.isDefault;
};
const cancelEdit = () => {
  editingCode.value = null;
};

const startCreate = async () => {
  editingCode.value = null;
  newLabel.value = "";
  newIsDefault.value = false;
  creating.value = true;
  await nextTick();
  newLabelInput.value?.focus();
};
const cancelCreate = () => {
  creating.value = false;
  newLabel.value = "";
  newIsDefault.value = false;
};
const saveCreate = async () => {
  if (!newCode.value) return;
  try {
    await createPaymentMethod({
      code: newCode.value,
      label: newLabel.value,
      isDefault: newIsDefault.value,
    });
    toast.success("Moyen de paiement créé.");
    cancelCreate();
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};

const move = async (index: number, delta: number) => {
  const target = index + delta;
  const codes = methods.value.map((method) => method.code);
  if (target < 0 || target >= codes.length) return;
  [codes[index], codes[target]] = [codes[target], codes[index]];
  try {
    await reorderPaymentMethods({ codes });
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};

const saveEdit = async () => {
  const code = editingCode.value;
  if (code == null) return;
  try {
    await updatePaymentMethod({
      code,
      label: editLabel.value,
      active: editActive.value,
      isDefault: editDefault.value,
    });
    toast.success("Moyen de paiement modifié.");
    cancelEdit();
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};

const removeMethod = async (code: string) => {
  try {
    await deletePaymentMethod(code);
    toast.success("Moyen de paiement supprimé.");
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};
</script>

<template>
  <div class="flex flex-1 flex-col">
    <table class="flex-1 table-fixed border-separate [border-spacing:2px_0.5rem]">
      <caption class="sr-only">
        Moyens de paiement
      </caption>
      <thead>
        <tr>
          <th scope="col" class="text-left pl-3.5">Libellé</th>
          <th scope="col" class="text-center w-24">Défaut</th>
          <th scope="col" class="text-center w-20">Actif</th>
          <th scope="col" class="text-center w-24">Ordre</th>
          <th scope="col" class="text-right w-64"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <TransitionGroup tag="tbody" move-class="transition-transform duration-500 ease-in-out">
        <tr v-for="(method, index) in methods" :key="method.code">
          <td>
            <AppInput v-if="editingCode === method.code" v-model="editLabel" type="text" required />
            <span v-else class="pl-3.5">{{ method.label }}</span>
          </td>
          <td class="text-center">
            <input
              v-if="editingCode === method.code"
              v-model="editDefault"
              type="checkbox"
              aria-label="Moyen de paiement par défaut"
              :disabled="!editActive"
              title="Le moyen de paiement doit être actif pour être défini par défaut"
            />
            <FontAwesomeIcon v-else-if="method.isDefault" :icon="faCheck" class="text-green" />
          </td>
          <td class="text-center">
            <input
              v-if="editingCode === method.code"
              v-model="editActive"
              type="checkbox"
              aria-label="Moyen de paiement actif"
            />
            <FontAwesomeIcon v-else-if="method.active" :icon="faCheck" class="text-green" />
          </td>
          <td>
            <div class="flex items-center justify-center gap-sm">
              <AppButton
                type="button"
                class="px-sm"
                aria-label="Monter"
                title="Monter"
                :disabled="index === 0"
                @click="move(index, -1)"
              >
                <FontAwesomeIcon :icon="faArrowUp" />
              </AppButton>
              <AppButton
                type="button"
                class="px-sm"
                aria-label="Descendre"
                title="Descendre"
                :disabled="index === methods.length - 1"
                @click="move(index, 1)"
              >
                <FontAwesomeIcon :icon="faArrowDown" />
              </AppButton>
            </div>
          </td>
          <td>
            <div v-if="editingCode === method.code" class="flex items-center gap-sm justify-end">
              <AppButton type="button" class="px-md" @click="saveEdit">Enregistrer</AppButton>
              <AppButton type="button" class="px-md bg-gray-medium!" @click="cancelEdit">
                <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
                Annuler
              </AppButton>
            </div>
            <div v-else class="flex items-center gap-sm justify-end">
              <AppButton type="button" class="px-md bg-gray-medium!" @click="startEdit(method)">
                <FontAwesomeIcon :icon="faPen" class="mr-sm" />
                Éditer
              </AppButton>
              <ConfirmationDialog
                title="Supprimer le moyen de paiement"
                :message="`Supprimer le moyen de paiement « ${method.label} » ?`"
                @confirm="removeMethod(method.code)"
              />
            </div>
          </td>
        </tr>
      </TransitionGroup>
      <tbody v-if="creating">
        <tr>
          <td>
            <AppInput ref="newLabelInput" v-model="newLabel" type="text" required />
          </td>
          <td class="text-center">
            <input
              v-model="newIsDefault"
              type="checkbox"
              aria-label="Moyen de paiement par défaut"
            />
          </td>
          <td class="text-center">
            <input type="checkbox" checked disabled aria-label="Moyen de paiement actif" />
          </td>
          <td></td>
          <td>
            <div class="flex items-center gap-sm justify-end">
              <AppButton type="button" class="px-md" :disabled="!newCode" @click="saveCreate">
                Enregistrer
              </AppButton>
              <AppButton type="button" class="px-md bg-gray-medium!" @click="cancelCreate">
                <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
                Annuler
              </AppButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!creating" class="mt-sm">
      <AppButton type="button" class="px-md" @click="startCreate">
        <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
        Ajouter
      </AppButton>
    </div>
  </div>
</template>
