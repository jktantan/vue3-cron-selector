<template>
  <div class="cron-selector__field">
    <div class="cron-selector__options" role="radiogroup">
      <!-- 1. Every one (any) -->
      <label
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeType === 'any' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="`cron-field-${fieldId}`"
          value="any"
          :checked="activeType === 'any'"
          @change="onTypeChange('any')"
        />
        <span class="cron-selector__option-text">{{ fieldOptionLabel('everyOne') }}</span>
      </label>

      <!-- 2. Step (every N units starting at N) -->
      <label
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeType === 'step' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="`cron-field-${fieldId}`"
          value="step"
          :checked="activeType === 'step'"
          @change="onTypeChange('step')"
        />
        <span class="cron-selector__option-text">{{ fieldOptionLabel('step') }}</span>
        <template v-for="(part, index) in stepTemplateParts" :key="index">
          <NumberSpinner
            v-if="part.token === 'step'"
            :model-value="stepValue"
            :min="1"
            :max="field.max - field.min"
            :disabled="activeType !== 'step'"
            @update:model-value="onStepValueUpdate"
          />
          <NumberSpinner
            v-else-if="part.token === 'base'"
            :model-value="stepBaseNum"
            :min="field.min"
            :max="field.max"
            :disabled="activeType !== 'step'"
            @update:model-value="onStepBaseUpdate"
          />
          <span v-else-if="part.token === null" class="cron-selector__option-text">
            {{ part.text }}
          </span>
        </template>
      </label>

      <!-- 3. Specific values (multi-select grid) -->
      <label
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeType === 'value' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="`cron-field-${fieldId}`"
          value="value"
          :checked="activeType === 'value'"
          @change="onTypeChange('value')"
        />
        <span class="cron-selector__option-text">{{ fieldOptionLabel('specific') }}</span>
      </label>
      <div v-if="activeType === 'value'" class="cron-selector__sub-content">
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
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeType === 'range' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="`cron-field-${fieldId}`"
          value="range"
          :checked="activeType === 'range'"
          @change="onTypeChange('range')"
        />
        <span class="cron-selector__option-text">{{ fieldOptionLabel('range') }}</span>
        <template v-for="(part, index) in rangeTemplateParts" :key="index">
          <span v-if="part.token === null" class="cron-selector__option-text">
            {{ part.text }}
          </span>
          <NumberSpinner
            v-else-if="part.token === 'from'"
            :model-value="rangeFrom"
            :min="field.min"
            :max="field.max"
            :disabled="activeType !== 'range'"
            @update:model-value="onRangeFromUpdate"
          />
          <NumberSpinner
            v-else
            :model-value="rangeTo"
            :min="field.min"
            :max="field.max"
            :disabled="activeType !== 'range'"
            @update:model-value="onRangeToUpdate"
          />
        </template>
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
import { getFieldValueLabel, pluralUnit } from '../locale/engine'
import { parseLocaleTemplate, compactTemplateParts } from '../locale/template'
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

const fieldLabel = computed(() => props.locale.fields.labels[props.fieldId] ?? props.fieldId)

// Reuse a single FieldWrapper per (field, locale) pair. FieldWrapper.items is
// already memoized internally, but constructing a new wrapper every time
// `props.locale` becomes a new object reference wastes garbage. locale.code is
// the only stable identity we can key on.
const wrapper = computed(() => {
  const labelFn = (value: number): string => getFieldValueLabel(props.fieldId, value, props.locale)
  return new FieldWrapper(props.field, labelFn)
})

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

// Step and range rows are locale templates: `{step}` / `{base}` / `{from}` /
// `{to}` become spinners, while `{unit}` is folded into the surrounding text
// with the plural form that `Intl.PluralRules` selects for the count.
const stepTemplateParts = computed(() =>
  compactTemplateParts(
    parseLocaleTemplate(props.locale.templates.step, {
      unit: pluralUnit(props.fieldId, stepValue.value, props.locale),
    }),
  ),
)

const rangeTemplateParts = computed(() =>
  compactTemplateParts(
    parseLocaleTemplate(props.locale.templates.range, {
      unit: pluralUnit(props.fieldId, rangeTo.value, props.locale),
    }),
  ),
)

function fieldOptionLabel(key: 'everyOne' | 'step' | 'specific' | 'range'): string {
  return props.locale.ui.fieldOptions[props.fieldId]?.[key] ?? fieldLabel.value
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
