<script setup lang="ts">
const props = defineProps<{
  name: string;
  color: string;
  size?: 'sm' | 'md';
}>();
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-medium"
    :class="props.size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'"
    :style="{ background: props.color + '14', color: props.color }"
  >
    #{{ props.name }}
  </span>
</template>
