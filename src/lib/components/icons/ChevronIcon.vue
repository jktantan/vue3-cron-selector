<template>
  <span class="cron-icon cron-icon--chevron" :class="rotationClass" aria-hidden="true">
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    direction?: 'up' | 'down' | 'left' | 'right'
  }>(),
  {
    direction: 'down',
  },
)

const rotationClass = computed(() => {
  if (props.direction === 'up') return 'cron-icon--chevron-up'
  return ''
})
</script>
