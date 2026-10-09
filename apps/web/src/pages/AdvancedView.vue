<script setup lang="ts">
import {
  faCheckCircle,
  faDownload,
  faSpinner,
  faTimesCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { DilicomRowWithId } from "@livrelibre/shared/dilicomItem";
import { formatNumber, formatPrice } from "@livrelibre/shared/format";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import ButtonAnchor from "@/components/ButtonAnchor.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import { getErrorMessage, getRestErrorMessage } from "@/utils/errors";
import { isDilicomRows } from "@/utils/guards";

type FileData = { filename: string; data: DilicomRowWithId[] };

const file = ref<FileData | null>(null);
const selectedFile = ref<File | null>(null);
const isSubmitting = ref(false);
const isImporting = ref(false);

const hasFile = computed(() => selectedFile.value !== null);

const onFileChange = (event: Event) => {
  if (event.target instanceof HTMLInputElement) {
    selectedFile.value = event.target.files?.[0] ?? null;
  }
};

const resetImport = () => {
  file.value = null;
  selectedFile.value = null;
};

const importFile = async () => {
  const selected = selectedFile.value;
  if (!selected) return;
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("dilicom", selected);
    const response = await fetch("/api/importFile", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      toast.error(getRestErrorMessage(body, "Erreur lors de l'import du fichier."));
      return;
    }
    const parsed: unknown = await response.json();
    if (!isDilicomRows(parsed)) {
      toast.error("Réponse du serveur invalide.");
      return;
    }
    file.value = { filename: selected.name, data: parsed };
  } catch (error) {
    toast.error(getErrorMessage(error));
  } finally {
    isSubmitting.value = false;
  }
};

const nbItems = computed(() => file.value?.data.reduce((nb, row) => nb + row.QTE, 0) ?? 0);

const finalizeImport = async () => {
  if (!file.value) return;
  isImporting.value = true;
  try {
    const response = await fetch("/api/finalizeImport", {
      method: "POST",
      body: JSON.stringify(file.value.data),
    });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      toast.error(getRestErrorMessage(body, "Erreur lors de l'import."));
      return;
    }
    const nb = nbItems.value;
    toast.success(
      `Le fichier a été importé correctement (${String(nb)} article${nb > 1 ? "s" : ""}).`,
    );
    resetImport();
  } catch (error) {
    toast.error(getErrorMessage(error));
  } finally {
    isImporting.value = false;
  }
};
</script>

<template>
  <h1 class="sr-only">Avancé</h1>
  <AppCard v-if="file" class="self-start max-h-full flex flex-col flex-1">
    <CardTitle>Import du fichier {{ file.filename }}</CardTitle>
    <CardBody class="flex flex-col">
      <table class="flex-1 border-separate [border-spacing:0.5rem]">
        <caption class="sr-only">
          Aperçu de l'import
        </caption>
        <thead>
          <tr class="sticky top-0 bg-white z-10">
            <th scope="col" class="text-left">EAN</th>
            <th scope="col" class="text-left">Titre</th>
            <th scope="col" class="text-left">Auteur·ice</th>
            <th scope="col" class="text-left">Maison d'édition</th>
            <th scope="col" class="text-left">Distributeur</th>
            <th scope="col" class="text-right">Stock</th>
            <th scope="col" class="text-right">Prix</th>
            <th scope="col" class="text-right">Quantité</th>
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
      <AppButton type="button" class="mr-2 px-md !bg-gray-medium" @click="resetImport">
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Annuler
      </AppButton>
      <AppButton type="button" class="px-md" :disabled="isImporting" @click="finalizeImport">
        <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
        Valider
      </AppButton>
    </CardFooter>
  </AppCard>
  <div v-else class="[margin-left:10%] [margin-right:10%] flex flex-1 flex-col gap-lg">
    <AppCard>
      <CardTitle>Importer un fichier DILICOM</CardTitle>
      <form class="flex flex-col w-full" method="post" @submit.prevent="importFile">
        <CardBody class="flex flex-col gap-sm">
          <label>
            Fichier :
            <input type="file" class="ml-2" accept=".csv, .slk, .xlsx" @change="onFileChange" />
          </label>
        </CardBody>
        <CardFooter>
          <AppButton class="px-4" type="submit" :disabled="isSubmitting || !hasFile">
            <FontAwesomeIcon
              :icon="isSubmitting ? faSpinner : faUpload"
              :spin="isSubmitting"
              class="mr-2"
            />
            {{ isSubmitting ? "Traitement…" : "Envoyer" }}
          </AppButton>
        </CardFooter>
      </form>
    </AppCard>
    <AppCard>
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
    </AppCard>
  </div>
</template>
