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
      <div v-if="isOpen" ref="panelRef" class="cron-popover__panel" :style="panelStyle">
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick, provide } from 'vue'
import type { LocaleDefinition } from '../locale/types'
import { calcPlacement } from '../utils/positioning'
import { FloatingPanelKey, type FloatingPanelHost } from '../index'

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

const panelPosition = ref({ top: 0, left: 0, width: 0 })

const panelStyle = computed(() => ({
  position: 'fixed' as const,
  top: `${panelPosition.value.top}px`,
  left: `${panelPosition.value.left}px`,
  minWidth: `${panelPosition.value.width}px`,
}))

// Collect floating child panels (e.g. InlineSelect dropdowns) so that clicks
// inside them do not trigger the popover's click-outside close logic.
const floatingPanels = new Set<HTMLElement>()
const floatingHost: FloatingPanelHost = {
  register(el) {
    floatingPanels.add(el)
  },
  unregister(el) {
    floatingPanels.delete(el)
  },
}
provide(FloatingPanelKey, floatingHost)

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
  }
}

function open(): void {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
  nextTick(updatePosition)
}

function close(): void {
  isOpen.value = false
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
}

function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Node
  if (containerRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  for (const el of floatingPanels) {
    if (el.contains(target)) return
  }
  close()
}

// Global Escape handler so the popover closes regardless of which element
// inside the panel currently owns focus (e.g. a NumberSpinner input or the
// FieldGrid buttons). Without it, pressing Esc after the user has tabbed
// out of the trigger input would leave the panel open.
function handleEscapeKey(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  // Defer to the closest enclosing InlineSelect if its dropdown is open, so
  // each layer can react to its own Esc one in the right order.
  if (floatingPanels.size > 0) {
    const top = event.target as Node | null
    if (top) {
      for (const el of floatingPanels) {
        if (el.contains(top)) {
          // Let the dropdown's own handler run first; only close the popover
          // when the focused element is not inside any registered dropdown.
          return
        }
      }
    }
  }
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
