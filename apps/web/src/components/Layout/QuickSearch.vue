<script setup lang="ts">
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { getErrorMessage } from "@/utils/errors";
import { trpcClient } from "@/utils/trpc";

const router = useRouter();
const queryClient = useQueryClient();
const isLoading = ref(false);
const search = ref("");

const submit = async () => {
  const value = search.value;
  if (value.length === 0) {
    return;
  }
  if (/^\d{10,}$/.test(value)) {
    isLoading.value = true;
    try {
      const result = await queryClient.query({
        queryKey: ["isbnSearch", value],
        queryFn: () => trpcClient.isbnSearch.query(value),
      });
      if (result.count === 0) {
        toast.info("Aucun article trouvé pour cet ISBN");
        return;
      }
      await router.push(`/item/${String(result.items[0].id)}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      isLoading.value = false;
    }
    return;
  }
  await router.push(`/quicksearch?search=${encodeURIComponent(value)}`);
};
</script>

<template>
  <form role="search" class="flex p-sm [width:27rem] relative" @submit.prevent="submit">
    <label for="quicksearch" class="sr-only">Rechercher un article</label>
    <input
      id="quicksearch"
      v-model="search"
      type="search"
      class="flex-1 [padding:5px_10px] rounded bg-white/80 pr-7 focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none [--tw-ring-color:#AAA]"
      placeholder="ISBN, titre, auteur·ice"
      name="search"
    />
    <button
      type="submit"
      class="text-black absolute top-2 bottom-2 right-1 px-2"
      aria-label="Rechercher"
      :disabled="isLoading"
    >
      <FontAwesomeIcon :icon="isLoading ? faSpinner : faSearch" :spin="isLoading" class="mx-1" />
    </button>
  </form>
</template>
