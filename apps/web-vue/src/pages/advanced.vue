<script setup lang="ts">
import {
  faCheckCircle,
  faDownload,
  faSpinner,
  faTimesCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import type { DilicomRowWithId } from "@livrelibre/shared/dilicomItem";
import { formatNumber, formatPrice } from "@livrelibre/shared/format";

import Button from "@/components/Button.vue";
import ButtonAnchor from "@/components/ButtonAnchor.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import Title from "@/components/Title.vue";

type FileData = { filename: string; data: DilicomRowWithId[] };

const file = ref<FileData | null>(null);
const dilicomInput = ref<HTMLInputElement | null>(null);
const isSubmitting = ref(false);
const isImporting = ref(false);

const hasFile = computed(() => (dilicomInput.value?.files?.length ?? 0) > 0);

const importFile = async () => {
  const input = dilicomInput.value;
  if (!input || input.files?.length !== 1) return;
  const selected = input.files[0];
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("dilicom", selected);
    const response = await fetch("/api/importFile", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const json = (await response.json()) as { error: string };
      toast.error(json.error);
      return;
    }
    const data = (await response.json()) as DilicomRowWithId[];
    file.value = { filename: selected.name, data };
  } finally {
    isSubmitting.value = false;
  }
};

const finalizeImport = async () => {
  if (!file.value) return;
  isImporting.value = true;
  try {
    const response = await fetch("/api/finalizeImport", {
      method: "POST",
      body: JSON.stringify(file.value.data),
    });
    if (!response.ok) {
      toast.error("Erreur lors de l'import");
      return;
    }
    const nb = file.value.data.length;
    toast.success(
      `Le fichier a été importé correctement (${String(nb)} article${nb > 1 ? "s" : ""}).`,
    );
    file.value = null;
  } finally {
    isImporting.value = false;
  }
};

const nbItems = computed(
  () => file.value?.data.reduce((nb, row) => nb + row.QTE, 0) ?? 0,
);
</script>

<template>
  <Card v-if="file" class="self-start max-h-full flex flex-col flex-1">
    <CardTitle>Import du fichier {{ file.filename }}</CardTitle>
    <CardBody class="flex flex-col">
      <table class="flex-1 border-separate [border-spacing:0.5rem]">
        <thead>
          <tr class="sticky top-0 bg-white z-10">
            <th class="text-left">EAN</th>
            <th class="text-left">Titre</th>
            <th class="text-left">Auteur·ice</th>
            <th class="text-left">Maison d'édition</th>
            <th class="text-left">Distributeur</th>
            <th class="text-right">Stock</th>
            <th class="text-right">Prix</th>
            <th class="text-right">Quantité</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in file.data" :key="i">
            <td>{{ item.EAN }}</td>
            <td>{{ item.TITRE }}</td>
            <td>{{ item.AUTEUR }}</td>
            <td>{{ item.EDITEUR }}</td>
            <td>{{ item.DISTRIBUTEUR }}</td>
            <td class="text-right">
              <span v-if="item.amount != null" class="font-number">
                {{ formatNumber(item.amount) }}
              </span>
              <template v-else>Nouveau</template>
            </td>
            <td class="text-right font-number">{{ formatPrice(item.PRIX) }}</td>
            <td class="text-right font-number">{{ formatNumber(item.QTE) }}</td>
          </tr>
        </tbody>
      </table>
    </CardBody>
    <CardFooter class="flex">
      <span class="font-bold mr-auto">
        Total: <span class="font-number">{{ formatNumber(nbItems) }}</span>
        articles
      </span>
      <Button
        type="button"
        class="mr-2 px-md !bg-[#6E6E6E]"
        @click="file = null"
      >
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Annuler
      </Button>
      <Button
        type="button"
        class="px-md"
        :disabled="isImporting"
        @click="finalizeImport"
      >
        <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
        Valider
      </Button>
    </CardFooter>
  </Card>
  <div
    v-else
    class="[margin-left:10%] [margin-right:10%] flex flex-1 flex-col gap-lg"
  >
    <Title>Avancé</Title>
    <Card>
      <CardTitle>Importer un fichier DILICOM</CardTitle>
      <form
        class="flex flex-col w-full"
        method="post"
        @submit.prevent="importFile"
      >
        <CardBody class="flex flex-col gap-sm">
          <label>
            Fichier :
            <input
              ref="dilicomInput"
              type="file"
              class="ml-2"
              accept=".csv, .slk, .xlsx"
            />
          </label>
        </CardBody>
        <CardFooter>
          <Button
            class="px-4"
            type="submit"
            :disabled="isSubmitting || !hasFile"
          >
            <FontAwesomeIcon
              :icon="isSubmitting ? faSpinner : faUpload"
              :spin="isSubmitting"
              class="mr-2"
            />
            {{ isSubmitting ? "Traitement…" : "Envoyer" }}
          </Button>
        </CardFooter>
      </form>
    </Card>
    <Card>
      <CardTitle>Export du stock</CardTitle>
      <CardBody>
        <p>Export du stock au format CSV</p>
      </CardBody>
      <CardFooter>
        <ButtonAnchor class="px-4 inline-block" href="/api/export" download>
          <FontAwesomeIcon :icon="faDownload" class="mr-2" />
          Télécharger
        </ButtonAnchor>
      </CardFooter>
    </Card>
  </div>
</template>
