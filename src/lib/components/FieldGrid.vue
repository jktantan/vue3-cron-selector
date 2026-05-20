<template>
  <div class="cron-grid" :style="gridStyle">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="cron-grid__cell"
      :class="{
        'cron-grid__cell--selected': isSelected(item.value),
        'cron-grid__cell--disabled': disabled,
      }"
      :disabled="disabled"
      :aria-pressed="isSelected(item.value)"
      :title="item.label"
      @click="toggleValue(item.value, $event)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FieldItem } from '../core/types'

const props = withDefaults(
  defineProps<{
    items: ReadonlyArray<FieldItem>
    selected: ReadonlyArray<number>
    cols?: number
    disabled?: boolean
  }>(),
  {
    cols: 10,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:selected': [values: ReadonlyArray<number>]
}>()

const lastClickedIndex = ref(-1)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
}))

function isSelected(value: number): boolean {
  return props.selected.includes(value)
}

function toggleValue(value: number, event: MouseEvent): void {
  const currentIndex = props.items.findIndex((i) => i.value === value)

  if (event.shiftKey && lastClickedIndex.value >= 0) {
    const from = Math.min(lastClickedIndex.value, currentIndex)
    const to = Math.max(lastClickedIndex.value, currentIndex)
    const rangeValues = props.items.slice(from, to + 1).map((i) => i.value)
    const merged = new Set([...props.selected, ...rangeValues])
    emit(
      'update:selected',
      [...merged].sort((a, b) => a - b),
    )
  } else if (isSelected(value)) {
    emit(
      'update:selected',
      props.selected.filter((v) => v !== value),
    )
  } else {
    emit(
      'update:selected',
      [...props.selected, value].sort((a, b) => a - b),
    )
  }

  lastClickedIndex.value = currentIndex
}
</script>
