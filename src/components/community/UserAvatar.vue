<script setup lang="ts">
import { computed } from 'vue';
import type { CommunityUser } from '@/data/community';

const props = defineProps<{
  user: CommunityUser;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>();

const sizeClass = computed(() => {
  const map = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-2xl',
  };
  return map[props.size || 'md'];
});
</script>

<template>
  <div
    class="rounded-full flex items-center justify-center flex-shrink-0 select-none text-white font-semibold"
    :class="[user.isAccount && user.avatarColor ? '' : 'bg-gradient-to-br', user.isAccount && user.avatarColor ? '' : user.avatarBg, sizeClass]"
    :style="user.isAccount && user.avatarColor ? { backgroundColor: user.avatarColor } : undefined"
    :title="user.name"
  >
    <span>{{ user.avatar }}</span>
  </div>
</template>
