<template>
  <div class="cron-day-field">
    <div class="cron-day-field__options" role="radiogroup">
      <!-- 1. Every one (any) -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeType === 'any' }"
      >
        <input
          type="radio"
          :name="`cron-field-${fieldId}`"
          value="any"
          :checked="activeType === 'any'"
          @change="onTypeChange('any')"
        />
        <span class="cron-day-field__option-text">{{ fieldOptionLabel('everyOne') }}</span>
      </label>

      <!-- 2. Step (every N units starting at N) -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeType === 'step' }"
      >
        <input
          type="radio"
          :name="`cron-field-${fieldId}`"
          value="step"
          :checked="activeType === 'step'"
          @change="onTypeChange('step')"
        />
        <span class="cron-day-field__option-text">{{ fieldOptionLabel('step') }}</span>
        <NumberSpinner
          :model-value="stepValue"
          :min="1"
          :max="field.max - field.min"
          :disabled="activeType !== 'step'"
          @update:model-value="onStepValueUpdate"
        />
        <span class="cron-day-field__inline-label">{{ fieldLabel }}{{ locale.ui.from }}</span>
        <NumberSpinner
          :model-value="stepBaseNum"
          :min="field.min"
          :max="field.max"
          :disabled="activeType !== 'step'"
          @update:model-value="onStepBaseUpdate"
        />
        <span class="cron-day-field__inline-label">{{ fieldLabel }}{{ locale.ui.startingAt }}</span>
      </label>

      <!-- 3. Specific values (multi-select grid) -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeType === 'value' }"
      >
        <input
          type="radio"
          :name="`cron-field-${fieldId}`"
          value="value"
          :checked="activeType === 'value'"
          @change="onTypeChange('value')"
        />
        <span class="cron-day-field__option-text">{{ fieldOptionLabel('specific') }}</span>
      </label>
      <div v-if="activeType === 'value'" class="cron-day-field__sub-content">
        <FieldGrid
          :items="fieldItems"
          :selected="selectedValues"
          :cols="cols"
          :disabled="disabled"
          @update:selected="onSelectedChange"
        />
      </div>

      <!-- 4. Range (from N to N) -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeType === 'range' }"
      >
        <input
          type="radio"
          :name="`cron-field-${fieldId}`"
          value="range"
          :checked="activeType === 'range'"
          @change="onTypeChange('range')"
        />
        <span class="cron-day-field__option-text">{{ fieldOptionLabel('range') }}</span>
        <NumberSpinner
          :model-value="rangeFrom"
          :min="field.min"
          :max="field.max"
          :disabled="activeType !== 'range'"
          @update:model-value="onRangeFromUpdate"
        />
        <span class="cron-day-field__inline-label">{{ locale.ui.to }}</span>
        <NumberSpinner
          :model-value="rangeTo"
          :min="field.min"
          :max="field.max"
          :disabled="activeType !== 'range'"
          @update:model-value="onRangeToUpdate"
        />
        <span class="cron-day-field__inline-label">{{ fieldLabel }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FieldDefinition, FieldItem, SegmentType } from '../core/types'
import type { UseCronSegmentReturn } from '../composables/useCronSegment'
import type { LocaleDefinition } from '../locale/types'
import { FieldWrapper } from '../core/fields'
import { getFieldValueLabel } from '../locale/engine'
import FieldGrid from './FieldGrid.vue'
import NumberSpinner from './NumberSpinner.vue'

const props = withDefaults(
  defineProps<{
    fieldId: string
    field: FieldDefinition
    segment: UseCronSegmentReturn
    locale: LocaleDefinition
    disabled?: boolean
    cols?: number
  }>(),
  {
    disabled: false,
    cols: 10,
  },
)

const fieldLabel = computed(() => props.locale.fieldLabels[props.fieldId] ?? props.fieldId)

const wrapper = computed(
  () =>
    new FieldWrapper(props.field, (value: number) =>
      getFieldValueLabel(props.fieldId, value, props.locale),
    ),
)

const fieldItems = computed<ReadonlyArray<FieldItem>>(() => wrapper.value.items)

const activeType = ref<SegmentType>(
  props.segment.segment.value.type === 'combined' ? 'value' : props.segment.segment.value.type,
)

let isSelecting = false

watch(
  () => props.segment.segment.value.type,
  (newType) => {
    if (isSelecting) return
    activeType.value = newType === 'combined' ? 'value' : newType
  },
)

const selectedValues = computed<ReadonlyArray<number>>(() => [...props.segment.selected.value])

const rangeFrom = computed(() => {
  const seg = props.segment.segment.value
  return seg.type === 'range' ? seg.from : props.field.min
})

const rangeTo = computed(() => {
  const seg = props.segment.segment.value
  return seg.type === 'range' ? seg.to : Math.min(props.field.min + 4, props.field.max)
})

const stepValue = computed(() => {
  const seg = props.segment.segment.value
  return seg.type === 'step' ? seg.step : 5
})

const stepBase = computed(() => {
  const seg = props.segment.segment.value
  return seg.type === 'step' ? String(seg.base) : '*'
})

const stepBaseNum = computed(() => {
  const seg = props.segment.segment.value
  if (seg.type === 'step' && seg.base !== '*') return seg.base
  return props.field.min
})

function fieldOptionLabel(key: 'everyOne' | 'step' | 'specific' | 'range'): string {
  const options = props.locale.ui.fieldOptions?.[props.fieldId]
  if (options) return options[key]
  const fallback: Record<string, string> = {
    everyOne: `${props.locale.ui.every} ${fieldLabel.value}`,
    step: props.locale.ui.every,
    specific: props.locale.segmentTypes.value ?? 'Specific',
    range: props.locale.ui.from,
  }
  return fallback[key]
}

function onTypeChange(type: SegmentType): void {
  isSelecting = true
  try {
    activeType.value = type
    props.segment.setType(type)
  } finally {
    isSelecting = false
  }
}

function onSelectedChange(values: ReadonlyArray<number>): void {
  props.segment.setSelected(values)
}

function onRangeFromUpdate(value: number): void {
  props.segment.setRange(value, Math.max(value, rangeTo.value))
}

function onRangeToUpdate(value: number): void {
  props.segment.setRange(Math.min(rangeFrom.value, value), value)
}

function onStepValueUpdate(value: number): void {
  const base = stepBase.value === '*' ? ('*' as const) : parseInt(stepBase.value, 10)
  props.segment.setStep(base, value)
}

function onStepBaseUpdate(value: number): void {
  props.segment.setStep(value, stepValue.value)
}
</script>
