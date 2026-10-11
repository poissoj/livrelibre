<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormRow from "@/components/FormRow.vue";
import RestrictedContent from "@/components/RestrictedContent.vue";
import UsersTable from "@/components/UsersTable.vue";
import { useTitle } from "@/lib/useTitle";
import useUser from "@/lib/useUser";
import { trpcClient } from "@/utils/trpc";

type Role = "admin" | "cashier";

useTitle("Utilisateurs");

const { user: currentUser } = useUser();
const queryClient = useQueryClient();

const {
  data: users,
  isError,
  refetch,
} = useQuery({
  queryKey: ["users"],
  queryFn: () => trpcClient.users.query(),
});

const newName = ref("");
const newPassword = ref("");
const newRole = ref<Role>("cashier");
const { mutateAsync: createUser, isPending: creating } = useMutation({
  mutationFn: (input: { name: string; password: string; role: Role }) =>
    trpcClient.createUser.mutate(input),
});

const onCreate = async () => {
  try {
    await createUser({ name: newName.value, password: newPassword.value, role: newRole.value });
    newName.value = "";
    newPassword.value = "";
    newRole.value = "cashier";
    toast.success("L'utilisateur a été créé.");
    await queryClient.invalidateQueries({ queryKey: ["users"] });
  } catch {
    // Erreur déjà signalée par le gestionnaire global.
  }
};
</script>

<template>
  <RestrictedContent role="admin">
    <div class="ml-[10%] mr-[10%] flex-1 flex flex-col gap-lg">
      <AppCard>
        <CardTitle>Nouvel utilisateur</CardTitle>
        <form @submit.prevent="onCreate">
          <CardBody class="flex-col gap-sm">
            <FormRow label="Identifiant">
              <AppInput v-model="newName" type="text" autocomplete="off" required />
            </FormRow>
            <FormRow label="Mot de passe">
              <AppInput
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                minlength="8"
                required
              />
            </FormRow>
            <FormRow label="Rôle">
              <AppSelect v-model="newRole">
                <option value="admin">Administrateur</option>
                <option value="cashier">Caissier⋅ère</option>
              </AppSelect>
            </FormRow>
          </CardBody>
          <CardFooter>
            <AppButton type="submit" class="px-md" :disabled="creating">
              <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
              Ajouter
            </AppButton>
          </CardFooter>
        </form>
      </AppCard>
      <AppCard class="max-h-full overflow-hidden flex flex-col">
        <CardTitle :level="1">Utilisateurs</CardTitle>
        <CardBody>
          <ErrorMessage v-if="isError" :on-retry="refetch" />
          <UsersTable v-else :users="users ?? []" :current-user-id="currentUser?.id" />
        </CardBody>
      </AppCard>
    </div>
  </RestrictedContent>
</template>
