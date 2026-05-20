<template>
  <div ref="containerRef" class="cron-popover">
    <input
      ref="inputRef"
      type="text"
      class="cron-popover__input"
      :class="{ 'cron-popover__input--error': !isValid }"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="locale.ui.placeholder"
      :aria-label="locale.ui.cronExpression"
      @input="onManualInput"
      @focus="open"
      @keydown.escape="close"
    />
    <span v-if="!isValid && showError" class="cron-popover__error">{{ error }}</span>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="cron-popover__panel"
        :style="panelStyle"
        @mousedown.stop
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import type { LocaleDefinition } from '../locale/types'
import { calcPlacement } from '../utils/positioning'

const props = withDefaults(
  defineProps<{
    modelValue: string
    isValid: boolean
    error: string | null
    disabled?: boolean
    locale: LocaleDefinition
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'manual-input': [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const showError = ref(false)

const panelPosition = ref({ top: 0, left: 0, width: 0, flipUp: false })

const panelStyle = computed(() => ({
  position: 'fixed' as const,
  top: `${panelPosition.value.top}px`,
  left: `${panelPosition.value.left}px`,
  minWidth: `${panelPosition.value.width}px`,
}))

function updatePosition(): void {
  if (!inputRef.value) return
  const rect = inputRef.value.getBoundingClientRect()
  const minWidth = Math.max(rect.width, 480)
  const panelHeight = panelRef.value?.offsetHeight ?? 320
  const placement = calcPlacement({
    anchorRect: rect,
    panelWidth: minWidth,
    panelHeight,
  })
  panelPosition.value = {
    top: placement.top,
    left: placement.left,
    width: minWidth,
    flipUp: placement.flipUp,
  }
}

function open(): void {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
  nextTick(updatePosition)
}

function close(): void {
  isOpen.value = false
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
}

function handleClickOutside(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (containerRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  if (target.closest?.('.cron-inline-select__dropdown')) return
  close()
}

function onManualInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  emit('manual-input', value)
  showError.value = true
}

watch(
  () => props.modelValue,
  () => {
    if (isOpen.value) {
      nextTick(updatePosition)
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>
