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
import { formatTVA } from "@livrelibre/shared/format";
import { type TVA, TVAValues } from "@livrelibre/shared/item";
import { norm } from "@livrelibre/shared/utils";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import { queryKeys } from "@/lib/queryKeys";
import useItemTypes from "@/lib/useItemTypes";
import { type RouterInput, type RouterOutput, trpcClient } from "@/utils/trpc";

type ItemTypeRow = RouterOutput["itemTypes"][number];

const { types } = useItemTypes();
const queryClient = useQueryClient();

const editingCode = ref<string | null>(null);
const editLabel = ref("");
const editTva = ref<TVA>("20");
const editActive = ref(true);
const editDefault = ref(false);

const creating = ref(false);
const newLabel = ref("");
const newTva = ref<TVA>("20");
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
  await queryClient.invalidateQueries({ queryKey: queryKeys.settings.itemTypes });
};

const { mutateAsync: updateItemType } = useMutation({
  mutationFn: (input: RouterInput["updateItemType"]) => trpcClient.updateItemType.mutate(input),
  onSuccess: invalidate,
});
const { mutateAsync: deleteItemType } = useMutation({
  mutationFn: (code: string) => trpcClient.deleteItemType.mutate(code),
  onSuccess: invalidate,
});
const { mutateAsync: createItemType } = useMutation({
  mutationFn: (input: RouterInput["createItemType"]) => trpcClient.createItemType.mutate(input),
  onSuccess: invalidate,
});
const { mutateAsync: reorderItemTypes } = useMutation({
  mutationFn: (input: RouterInput["reorderItemTypes"]) => trpcClient.reorderItemTypes.mutate(input),
  onSuccess: invalidate,
});

const startEdit = (type: ItemTypeRow) => {
  creating.value = false;
  editingCode.value = type.code;
  editLabel.value = type.label;
  editTva.value = type.tva;
  editActive.value = type.active;
  editDefault.value = type.isDefault;
};
const cancelEdit = () => {
  editingCode.value = null;
};

const startCreate = async () => {
  editingCode.value = null;
  newLabel.value = "";
  newTva.value = "20";
  newIsDefault.value = false;
  creating.value = true;
  await nextTick();
  newLabelInput.value?.focus();
};
const cancelCreate = () => {
  creating.value = false;
  newLabel.value = "";
  newTva.value = "20";
  newIsDefault.value = false;
};
const saveCreate = async () => {
  if (!newCode.value) return;
  try {
    await createItemType({
      code: newCode.value,
      label: newLabel.value,
      tva: newTva.value,
      isDefault: newIsDefault.value,
    });
    toast.success("Type d'article créé.");
    cancelCreate();
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};

const move = async (index: number, delta: number) => {
  const target = index + delta;
  const codes = types.value.map((type) => type.code);
  if (target < 0 || target >= codes.length) return;
  [codes[index], codes[target]] = [codes[target], codes[index]];
  try {
    await reorderItemTypes({ codes });
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};

const saveEdit = async () => {
  const code = editingCode.value;
  if (code == null) return;
  try {
    await updateItemType({
      code,
      label: editLabel.value,
      tva: editTva.value,
      active: editActive.value,
      isDefault: editDefault.value,
    });
    toast.success("Type d'article modifié.");
    cancelEdit();
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};

const removeType = async (code: string) => {
  try {
    await deleteItemType(code);
    toast.success("Type d'article supprimé.");
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};
</script>

<template>
  <div class="flex flex-1 flex-col">
    <table class="flex-1 table-fixed border-separate [border-spacing:2px_0.5rem]">
      <caption class="sr-only">
        Types d'article
      </caption>
      <thead>
        <tr class="sticky top-0 bg-white z-10">
          <th scope="col" class="text-left w-40">Code</th>
          <th scope="col" class="text-left pl-3.5">Libellé</th>
          <th scope="col" class="text-center w-24">TVA</th>
          <th scope="col" class="text-center w-24">Défaut</th>
          <th scope="col" class="text-center w-20">Actif</th>
          <th scope="col" class="text-center w-24">Ordre</th>
          <th scope="col" class="text-right w-64"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <TransitionGroup tag="tbody" move-class="transition-transform duration-500 ease-in-out">
        <tr v-for="(type, index) in types" :key="type.code">
          <td class="font-number">{{ type.code }}</td>
          <td>
            <AppInput v-if="editingCode === type.code" v-model="editLabel" type="text" required />
            <span v-else class="pl-3.5">{{ type.label }}</span>
          </td>
          <td class="text-center">
            <AppSelect v-if="editingCode === type.code" v-model="editTva" class="font-number">
              <option v-for="value in TVAValues" :key="value" :value="value">
                {{ formatTVA(value) }}
              </option>
            </AppSelect>
            <span v-else class="font-number">{{ formatTVA(type.tva) }}</span>
          </td>
          <td class="text-center">
            <input
              v-if="editingCode === type.code"
              v-model="editDefault"
              type="checkbox"
              aria-label="Type par défaut"
              :disabled="!editActive"
              title="Le type doit être actif pour être défini par défaut"
            />
            <FontAwesomeIcon v-else-if="type.isDefault" :icon="faCheck" class="text-green" />
          </td>
          <td class="text-center">
            <input
              v-if="editingCode === type.code"
              v-model="editActive"
              type="checkbox"
              aria-label="Type actif"
            />
            <FontAwesomeIcon v-else-if="type.active" :icon="faCheck" class="text-green" />
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
                :disabled="index === types.length - 1"
                @click="move(index, 1)"
              >
                <FontAwesomeIcon :icon="faArrowDown" />
              </AppButton>
            </div>
          </td>
          <td>
            <div v-if="editingCode === type.code" class="flex items-center gap-sm justify-end">
              <AppButton type="button" class="px-md" @click="saveEdit">Enregistrer</AppButton>
              <AppButton type="button" class="px-md bg-gray-medium!" @click="cancelEdit">
                <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
                Annuler
              </AppButton>
            </div>
            <div v-else class="flex items-center gap-sm justify-end">
              <AppButton type="button" class="px-md bg-gray-medium!" @click="startEdit(type)">
                <FontAwesomeIcon :icon="faPen" class="mr-sm" />
                Éditer
              </AppButton>
              <ConfirmationDialog
                title="Supprimer le type d'article"
                :message="`Supprimer le type « ${type.label} » ?`"
                @confirm="removeType(type.code)"
              />
            </div>
          </td>
        </tr>
      </TransitionGroup>
      <tbody v-if="creating">
        <tr>
          <td class="font-number">{{ newCode || "—" }}</td>
          <td class="">
            <AppInput ref="newLabelInput" v-model="newLabel" type="text" required />
          </td>
          <td class="text-center">
            <AppSelect v-model="newTva" class="font-number">
              <option v-for="value in TVAValues" :key="value" :value="value">
                {{ formatTVA(value) }}
              </option>
            </AppSelect>
          </td>
          <td class="text-center">
            <input v-model="newIsDefault" type="checkbox" aria-label="Type par défaut" />
          </td>
          <td class="text-center">
            <input type="checkbox" checked disabled aria-label="Type actif" />
          </td>
          <td class=""></td>
          <td class="">
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
