<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

import AppCard from "@/components/AppCard.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import RestrictedContent from "@/components/RestrictedContent.vue";
import UsersTable from "@/components/UsersTable.vue";
import { queryKeys } from "@/lib/queryKeys";
import useUser from "@/lib/useUser";
import { trpcClient } from "@/utils/trpc";

const { user: currentUser } = useUser();
const isAdmin = computed(() => currentUser.value?.role === "admin");

const {
  data: users,
  isError,
  refetch,
} = useQuery({
  queryKey: queryKeys.settings.users,
  queryFn: () => trpcClient.users.query(),
  enabled: isAdmin,
});
</script>

<template>
  <RestrictedContent role="admin">
    <div class="[margin-left:10%] [margin-right:10%] flex-1 flex flex-col gap-lg">
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
