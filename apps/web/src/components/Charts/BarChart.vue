<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";

type Bar = { label: string; value: number; title?: string };

const props = withDefaults(
  defineProps<{
    items: Bar[];
    height?: number;
    color?: string;
    caption?: string;
    labelInterval?: number;
  }>(),
  { height: 300, color: "steelblue", caption: "", labelInterval: 0 },
);

const labelsEl = useTemplateRef<HTMLDivElement>("labelsEl");
const containerWidth = ref(0);

let observer: ResizeObserver | undefined;

onMounted(() => {
  const el = labelsEl.value;
  if (!el) return;
  observer = new ResizeObserver((entries) => {
    containerWidth.value = entries[0].contentRect.width;
  });
  observer.observe(el);
});

onBeforeUnmount(() => observer?.disconnect());

const max = computed(() => Math.max(1, ...props.items.map((item) => item.value)));

const barHeight = (value: number) => `${String((value / max.value) * 100)}%`;

/** Largeur approximative d'un caractère en `text-xs` (12px, police système). */
const CHAR_WIDTH = 6.5;
/** Marge minimale entre deux libellés avant qu'ils ne se chevauchent. */
const LABEL_MIN_GAP = 8;

const maxLabelWidth = computed(
  () => Math.max(0, ...props.items.map((item) => item.label.length)) * CHAR_WIDTH,
);

/** Saut d'étiquettes : on n'en garde qu'autant que la largeur le permet. */
const autoInterval = computed(() => {
  const count = props.items.length;
  if (containerWidth.value <= 0 || count === 0) return 1;
  const pitch = maxLabelWidth.value + LABEL_MIN_GAP;
  return Math.max(1, Math.ceil((count * pitch) / containerWidth.value));
});

const labelInterval = computed(() =>
  props.labelInterval > 0 ? props.labelInterval : autoInterval.value,
);
</script>

<template>
  <figure class="w-full m-0">
    <div
      class="flex items-end gap-1 w-full pt-4 border-b border-gray-medium"
      :style="{ height: `${String(height)}px` }"
    >
      <div
        v-for="item in items"
        :key="item.label"
        class="flex-1 flex flex-col justify-end items-center h-full"
        :title="item.title"
      >
        <div
          class="w-full relative"
          :style="{ height: barHeight(item.value), backgroundColor: color }"
        >
          <span
            v-if="item.value !== 0"
            class="absolute left-1/2 bottom-full -translate-x-1/2 mb-0.5 text-xs leading-none whitespace-nowrap"
          >
            {{ item.value }}
          </span>
        </div>
      </div>
    </div>
    <div ref="labelsEl" class="relative w-full h-4 mt-1">
      <span
        v-for="(item, index) in items"
        v-show="index % labelInterval === 0"
        :key="item.label"
        class="absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs leading-none text-gray-medium"
        :style="{ left: `${String(((index + 0.5) / items.length) * 100)}%` }"
      >
        {{ item.label }}
      </span>
    </div>
    <figcaption class="sr-only">
      <table>
        <caption v-if="caption">
          {{
            caption
          }}
        </caption>
        <tbody>
          <tr v-for="item in items" :key="item.label">
            <th scope="row">{{ item.label }}</th>
            <td>{{ item.value }}</td>
          </tr>
        </tbody>
      </table>
    </figcaption>
  </figure>
</template>
