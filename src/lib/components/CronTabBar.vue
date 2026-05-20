<template>
  <div class="cron-tabs" role="tablist">
    <button
      v-for="(fieldId, index) in fields"
      :key="fieldId"
      role="tab"
      class="cron-tabs__tab"
      :class="{ 'cron-tabs__tab--active': fieldId === activeField }"
      :aria-selected="fieldId === activeField"
      :tabindex="fieldId === activeField ? 0 : -1"
      :disabled="disabled"
      @click="emit('update:activeField', fieldId)"
      @keydown="onKeydown($event, index)"
    >
      {{ tabLabel(fieldId) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { LocaleDefinition } from '../locale/types'

const props = withDefaults(
  defineProps<{
    fields: ReadonlyArray<string>
    activeField: string
    locale: LocaleDefinition
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:activeField': [fieldId: string]
}>()

function tabLabel(fieldId: string): string {
  return props.locale.tabLabels?.[fieldId] ?? props.locale.fieldLabels[fieldId] ?? fieldId
}

function onKeydown(event: KeyboardEvent, index: number): void {
  let nextIndex = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    nextIndex = (index + 1) % props.fields.length
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    nextIndex = (index - 1 + props.fields.length) % props.fields.length
  } else if (event.key === 'Home') {
    event.preventDefault()
    nextIndex = 0
  } else if (event.key === 'End') {
    event.preventDefault()
    nextIndex = props.fields.length - 1
  } else {
    return
  }
  emit('update:activeField', props.fields[nextIndex])
  const tablist = (event.currentTarget as HTMLElement).parentElement
  const buttons = tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  buttons?.[nextIndex]?.focus()
}
</script>
