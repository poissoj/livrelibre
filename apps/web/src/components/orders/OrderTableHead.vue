<script setup lang="ts">
import SortButton from "./SortButton.vue";

defineProps<{ group?: boolean }>();
</script>

<template>
  <thead>
    <tr class="sticky top-0 bg-white shadow-b shadow-black">
      <th scope="col" class="text-left pl-2">
        <SortButton label="Date" by="date" />
      </th>
      <th scope="col" class="text-left pl-1">
        <SortButton label="Nom" by="name" />
      </th>
      <th scope="col"><span class="sr-only">Payé</span></th>
      <th scope="col" class="text-left pl-1">Article</th>
      <th scope="col" class="text-left px-1">
        <template v-if="group">Distributeur</template>
        <SortButton v-else label="Distributeur" by="distributor" />
      </th>
      <th scope="col" class="text-center px-1">
        <template v-if="group">État</template>
        <SortButton v-else label="État" by="status" />
      </th>
      <th scope="col" class="text-center px-1">Prévenu⋅e</th>
      <th scope="col" class="text-center px-1">Payé</th>
      <th scope="col" class="text-center">
        <span class="sr-only">Actions</span>
      </th>
    </tr>
  </thead>
</template>
