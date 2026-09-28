<script setup lang="ts">
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <div
    class="p-sm [border:1px_solid_#bee5eb] [color:#0c5460] [background-color:#d1ecf1] self-start"
  >
    <p class="mb-sm">
      <FontAwesomeIcon :icon="faInfoCircle" class="mr-sm" />
      Aucun résultat.
    </p>
  </div>
</template>
