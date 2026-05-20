<template>
  <span class="cron-number-spinner">
    <button
      type="button"
      class="cron-number-spinner__btn"
      :disabled="disabled || modelValue <= min"
      tabindex="-1"
      @click="decrement"
    >
      &minus;
    </button>
    <input
      ref="inputEl"
      type="text"
      inputmode="numeric"
      class="cron-number-spinner__input"
      :value="modelValue"
      :disabled="disabled"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter="commitInput"
      @keydown.up.prevent="increment"
      @keydown.down.prevent="decrement"
    />
    <button
      type="button"
      class="cron-number-spinner__btn"
      :disabled="disabled || modelValue >= max"
      tabindex="-1"
      @click="increment"
    >
      +
    </button>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
  }>(),
  {
    min: 0,
    max: 99,
    step: 1,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const inputEl = ref<HTMLInputElement | null>(null)

function clamp(value: number): number {
  return Math.min(props.max, Math.max(props.min, value))
}

function decrement(): void {
  emit('update:modelValue', clamp(props.modelValue - props.step))
}

function increment(): void {
  emit('update:modelValue', clamp(props.modelValue + props.step))
}

function onFocus(): void {
  inputEl.value?.select()
}

function commitInput(): void {
  inputEl.value?.blur()
}

function onBlur(event: FocusEvent): void {
  const raw = (event.target as HTMLInputElement).value.trim()
  const parsed = parseInt(raw, 10)
  if (isNaN(parsed)) {
    (event.target as HTMLInputElement).value = String(props.modelValue)
    return
  }
  const clamped = clamp(parsed)
  if (clamped !== props.modelValue) {
    emit('update:modelValue', clamped)
  }
  (event.target as HTMLInputElement).value = String(clamped)
}
</script>
