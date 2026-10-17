<script setup lang="ts">
import { faPen, faPlus, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { nextTick, ref, useTemplateRef } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import { queryKeys } from "@/lib/queryKeys";
import { type RouterOutput, trpcClient } from "@/utils/trpc";

type Role = "admin" | "cashier";
type ManagedUser = RouterOutput["users"][number];

const props = defineProps<{ users: ManagedUser[]; currentUserId?: number | undefined }>();

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  cashier: "Caissier⋅ère",
};

const queryClient = useQueryClient();

const editingId = ref<number | null>(null);
const editName = ref("");
const editRole = ref<Role>("cashier");
const editPassword = ref("");

const creating = ref(false);
const newName = ref("");
const newPassword = ref("");
const newRole = ref<Role>("cashier");
const newNameInput = useTemplateRef<InstanceType<typeof AppInput>>("newNameInput");

const { mutateAsync: createUser } = useMutation({
  mutationFn: (input: { name: string; password: string; role: Role }) =>
    trpcClient.createUser.mutate(input),
});
const { mutateAsync: updateUser } = useMutation({
  mutationFn: (input: { id: number; name: string; role: Role }) =>
    trpcClient.updateUser.mutate(input),
});
const { mutateAsync: resetUserPassword } = useMutation({
  mutationFn: (input: { id: number; password: string }) =>
    trpcClient.resetUserPassword.mutate(input),
});
const { mutateAsync: deleteUser } = useMutation({
  mutationFn: (id: number) => trpcClient.deleteUser.mutate(id),
});

const invalidateUsers = async () => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.settings.users });
};

const startCreate = async () => {
  editingId.value = null;
  newName.value = "";
  newPassword.value = "";
  newRole.value = "cashier";
  creating.value = true;
  await nextTick();
  newNameInput.value?.focus();
};
const cancelCreate = () => {
  creating.value = false;
  newName.value = "";
  newPassword.value = "";
  newRole.value = "cashier";
};
const saveCreate = async () => {
  if (!newName.value || !newPassword.value) return;
  try {
    await createUser({ name: newName.value, password: newPassword.value, role: newRole.value });
    toast.success("L'utilisateur a été créé.");
    cancelCreate();
    await invalidateUsers();
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};

const startEdit = (target: ManagedUser) => {
  creating.value = false;
  editingId.value = target.id;
  editName.value = target.name;
  editRole.value = target.role;
  editPassword.value = "";
};
const cancelEdit = () => {
  editingId.value = null;
  editPassword.value = "";
};
const saveEdit = async () => {
  const id = editingId.value;
  if (id == null) return;
  try {
    await updateUser({ id, name: editName.value, role: editRole.value });
    if (editPassword.value) {
      await resetUserPassword({ id, password: editPassword.value });
    }
    toast.success("L'utilisateur a été modifié.");
    cancelEdit();
    await invalidateUsers();
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};
const removeUser = async (id: number) => {
  try {
    await deleteUser(id);
    toast.success("L'utilisateur a été supprimé.");
    await invalidateUsers();
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};
</script>

<template>
  <div class="flex flex-1 flex-col">
    <table class="flex-1 table-fixed border-separate border-spacing-2">
      <caption class="sr-only">
        Liste des utilisateurs
      </caption>
      <thead>
        <tr class="sticky top-0 bg-white z-10">
          <th scope="col" class="text-left">Identifiant</th>
          <th scope="col" class="text-left w-48 pl-3.5">Rôle</th>
          <th scope="col" class="text-right w-72"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody class="leading-7">
        <tr v-for="u in props.users" :key="u.id">
          <td class="align-top">
            <AppInput
              v-if="editingId === u.id"
              v-model="editName"
              type="text"
              required
              @keydown.enter.prevent="saveEdit"
            />
            <span v-else class="pl-3.5">{{ u.name }}</span>
          </td>
          <td class="align-top">
            <AppSelect v-if="editingId === u.id" v-model="editRole">
              <option value="admin">Administrateur</option>
              <option value="cashier">Caissier⋅ère</option>
            </AppSelect>
            <span v-else class="pl-3.5">{{ ROLE_LABELS[u.role] }}</span>
          </td>
          <td class="align-top">
            <div v-if="editingId === u.id" class="flex flex-col items-end gap-sm pb-1">
              <AppInput
                v-model="editPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Nouveau mot de passe (facultatif)"
                minlength="8"
                @keydown.enter.prevent="saveEdit"
              />
              <div class="flex gap-sm">
                <AppButton type="button" class="px-md" @click="saveEdit">Enregistrer</AppButton>
                <AppButton type="button" class="px-md bg-gray-medium!" @click="cancelEdit">
                  <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
                  Annuler
                </AppButton>
              </div>
            </div>
            <div v-else class="flex items-center gap-sm">
              <AppButton type="button" class="px-md bg-gray-medium!" @click="startEdit(u)">
                <FontAwesomeIcon :icon="faPen" class="mr-sm" />
                Éditer
              </AppButton>
              <ConfirmationDialog
                v-if="u.id !== props.currentUserId"
                title="Supprimer l'utilisateur"
                :message="`Supprimer l'utilisateur « ${u.name} » ?`"
                @confirm="removeUser(u.id)"
              />
            </div>
          </td>
        </tr>
        <tr v-if="creating">
          <td class="align-top">
            <AppInput
              ref="newNameInput"
              v-model="newName"
              type="text"
              required
              @keydown.enter.prevent="saveCreate"
            />
          </td>
          <td class="align-top">
            <AppSelect v-model="newRole">
              <option value="admin">Administrateur</option>
              <option value="cashier">Caissier⋅ère</option>
            </AppSelect>
          </td>
          <td class="align-top">
            <div class="flex flex-col items-end gap-sm pb-1">
              <AppInput
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Mot de passe"
                minlength="8"
                required
                @keydown.enter.prevent="saveCreate"
              />
              <div class="flex gap-sm">
                <AppButton
                  type="button"
                  class="px-md"
                  :disabled="!newName || !newPassword"
                  @click="saveCreate"
                >
                  Enregistrer
                </AppButton>
                <AppButton type="button" class="px-md bg-gray-medium!" @click="cancelCreate">
                  <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
                  Annuler
                </AppButton>
              </div>
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
