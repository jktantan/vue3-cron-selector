<template>
  <div ref="wrapperRef" class="cron-selector__select">
    <button
      ref="triggerEl"
      type="button"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      class="cron-selector__select-trigger"
      :class="{ 'cron-selector__select-trigger--open': isOpen }"
      :disabled="disabled"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span>{{ displayLabel }}</span>
      <ChevronIcon :direction="isOpen ? 'up' : 'down'" />
    </button>
    <Teleport to="body">
      <ul
        v-if="isOpen"
        ref="dropdownEl"
        role="listbox"
        class="cron-selector__select-dropdown"
        :class="themeClass"
        :style="[dropdownStyle, themeStyle]"
      >
        <li
          v-for="(item, index) in items"
          :key="item.value"
          role="option"
          :aria-selected="isSelected(item.value)"
          class="cron-selector__select-option"
          :class="{
            'cron-selector__select-option--selected': isSelected(item.value),
            'cron-selector__select-option--highlighted': index === highlightedIndex,
          }"
          @click="onItemClick(item.value)"
          @mouseenter="highlightedIndex = index"
        >
          {{ item.label }}
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, inject } from 'vue'
import type { FieldItem } from '../core/types'
import { calcPlacement } from '../utils/positioning'
import { FloatingPanelKey } from '../index'
import { CronThemeKey, CronThemeStyleKey } from '../theme/context'
import ChevronIcon from './icons/ChevronIcon.vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | ReadonlyArray<number>
    items: ReadonlyArray<FieldItem>
    multiple?: boolean
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    multiple: false,
    disabled: false,
    placeholder: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number | ReadonlyArray<number>]
}>()

const isOpen = ref(false)
const highlightedIndex = ref(-1)
const triggerEl = ref<HTMLButtonElement | null>(null)
const dropdownEl = ref<HTMLUListElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

// Optional: if a parent (e.g. CronPopover) provides a FloatingPanelHost, register
// our dropdown so its click-outside logic can recognize this floating element
// as part of itself instead of the outside world.
const floatingHost = inject(FloatingPanelKey, null)

// The dropdown is teleported to <body>; mirror the explicit theme modifier
// provided by CronSelector so it does not fall back to the document theme.
const resolvedTheme = inject(CronThemeKey, null)
const themeClass = computed(() =>
  resolvedTheme?.value ? `cron-selector--${resolvedTheme.value}` : '',
)
const themeStyle = inject(CronThemeStyleKey, null)

const displayLabel = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    if (props.modelValue.length === 0) return props.placeholder || '-'
    const labels = props.modelValue.map((v) => {
      const item = props.items.find((i) => i.value === v)
      return item?.label ?? String(v)
    })
    return labels.length <= 3 ? labels.join(', ') : `${labels.slice(0, 3).join(', ')}...`
  }
  const item = props.items.find((i) => i.value === props.modelValue)
  return item?.label ?? String(props.modelValue)
})

function isSelected(value: number): boolean {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(value)
  }
  return props.modelValue === value
}

function updateDropdownPosition(): void {
  if (!triggerEl.value) return
  const rect = triggerEl.value.getBoundingClientRect()
  const minWidth = Math.max(rect.width, 120)
  const panelHeight = dropdownEl.value?.offsetHeight ?? 240
  const placement = calcPlacement({
    anchorRect: rect,
    panelWidth: minWidth,
    panelHeight,
  })
  dropdownStyle.value = {
    top: `${placement.top}px`,
    left: `${placement.left}px`,
    minWidth: `${minWidth}px`,
  }
}

function toggle(): void {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

function open(): void {
  document.dispatchEvent(new CustomEvent('cron-selector:select-open'))
  isOpen.value = true
  highlightedIndex.value = 0
  nextTick(() => updateDropdownPosition())
}

function close(): void {
  isOpen.value = false
  highlightedIndex.value = -1
}

function onOtherSelectOpen(): void {
  if (isOpen.value) close()
}

function onItemClick(value: number): void {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const current = [...props.modelValue]
    const idx = current.indexOf(value)
    if (idx >= 0) {
      emit(
        'update:modelValue',
        current.filter((v) => v !== value),
      )
    } else {
      emit(
        'update:modelValue',
        [...current, value].sort((a, b) => a - b),
      )
    }
  } else {
    emit('update:modelValue', value)
    close()
  }
}

function handleKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        open()
      } else {
        highlightedIndex.value = (highlightedIndex.value + 1) % props.items.length
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        open()
      } else {
        highlightedIndex.value =
          (highlightedIndex.value - 1 + props.items.length) % props.items.length
      }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        onItemClick(props.items[highlightedIndex.value].value)
      } else {
        toggle()
      }
      break
    case 'Escape':
      event.preventDefault()
      close()
      triggerEl.value?.focus()
      break
  }
}

function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Node
  if (wrapperRef.value?.contains(target)) return
  if (dropdownEl.value?.contains(target)) return
  close()
}

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
  } else {
    document.removeEventListener('mousedown', handleClickOutside)
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
  // Register / unregister the dropdown with the floating host so an enclosing
  // popover treats clicks here as "inside" rather than triggering close.
  if (floatingHost) {
    if (val && dropdownEl.value) {
      floatingHost.register(dropdownEl.value)
    } else if (!val && dropdownEl.value) {
      floatingHost.unregister(dropdownEl.value)
    }
  }
})

onMounted(() => {
  document.addEventListener('cron-selector:select-open', onOtherSelectOpen)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('cron-selector:select-open', onOtherSelectOpen)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  if (floatingHost && dropdownEl.value) {
    floatingHost.unregister(dropdownEl.value)
  }
})
</script>
