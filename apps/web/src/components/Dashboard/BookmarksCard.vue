<script setup lang="ts">
import { RouterLink } from "vue-router";

import AddToCartButton from "@/components/AddToCartButton.vue";
import AppCard from "@/components/AppCard.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { useTRPCQuery } from "@/utils/query";

import BookmarksSkeleton from "./BookmarksSkeleton.vue";

const { data: bookmarks, isPending, isError, refetch } = useTRPCQuery("bookmarks", undefined);
</script>

<template>
  <AppCard class="flex-1 max-h-full overflow-hidden flex flex-col [min-width:24rem]">
    <CardTitle>Favoris</CardTitle>
    <CardBody>
      <ErrorMessage v-if="isError" :on-retry="refetch" />
      <BookmarksSkeleton v-else-if="isPending" />
      <ul v-else class="flex-1">
        <li
          v-for="bookmark in bookmarks ?? []"
          :key="bookmark.id"
          class="flex text-primary-dark hover:bg-gray-light pl-sm pr-xs"
        >
          <span class="flex flex-1 items-center text-primary-darkest">
            <RouterLink :to="`/item/${String(bookmark.id)}`">
              {{ bookmark.title }}
            </RouterLink>
          </span>
          <AddToCartButton :item="bookmark" />
        </li>
      </ul>
    </CardBody>
  </AppCard>
</template>
