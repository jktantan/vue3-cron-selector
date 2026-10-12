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
import { computed, ref, watch } from 'vue'
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

// When the selection becomes empty (e.g. user cleared everything via a reset
// button or the parent replaced the selection), drop the shift-click anchor
// so the next shift+click does not drag-select an unintended range from a
// stale index.
watch(
  () => props.selected,
  (next) => {
    if (next.length === 0) {
      lastClickedIndex.value = -1
    }
  },
)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
}))

function isSelected(value: number): boolean {
  return props.selected.includes(value)
}

function toggleValue(value: number, event: MouseEvent): void {
  const currentIndex = props.items.findIndex((i) => i.value === value)

  if (event.shiftKey && lastClickedIndex.value >= 0 && currentIndex >= 0) {
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

  // Track the click position when it lands on a known item. Guard against
  // currentIndex === -1 (value not in items) so a stray stale anchor does not
  // point at a phantom index for the next shift-click.
  if (currentIndex >= 0) {
    lastClickedIndex.value = currentIndex
  } else {
    lastClickedIndex.value = -1
  }
}
</script>
