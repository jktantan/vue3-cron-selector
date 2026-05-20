<template>
  <div class="cron-day-field">
    <div class="cron-day-field__options" role="radiogroup">
      <!-- 1. Every day -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'everyDay' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="everyDay"
          :checked="activeOption === 'everyDay'"
          @change="selectOption('everyDay')"
        />
        <span class="cron-day-field__option-text">{{ locale.ui.everyDay }}</span>
      </label>

      <!-- 2. Every N day(s) starting at D of the month (step) -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'dayStep' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="dayStep"
          :checked="activeOption === 'dayStep'"
          @change="selectOption('dayStep')"
        />
        <span class="cron-day-field__option-text">
          {{ locale.ui.everyNDaysStartingAt
            .replace('{step}', '')
            .replace('{start}', '') }}
        </span>
        <NumberSpinner
          :model-value="stepValue"
          :min="1"
          :max="31"
          :disabled="activeOption !== 'dayStep'"
          @update:model-value="onStepValueUpdate"
        />
        <span class="cron-day-field__inline-label">{{ locale.ui.day }}</span>
        <span class="cron-day-field__inline-label">{{ locale.ui.startingAt }}</span>
        <NumberSpinner
          :model-value="stepStart"
          :min="1"
          :max="31"
          :disabled="activeOption !== 'dayStep'"
          @update:model-value="onStepStartUpdate"
        />
      </label>

      <!-- 3. Specific day of week (multi-select) -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'specificDow' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="specificDow"
          :checked="activeOption === 'specificDow'"
          @change="selectOption('specificDow')"
        />
        <span class="cron-day-field__option-text">{{ locale.ui.specificDayOfWeek }}</span>
      </label>
      <div v-if="activeOption === 'specificDow'" class="cron-day-field__sub-content">
        <FieldGrid
          :items="weekdayItems"
          :selected="dowSelected"
          :cols="7"
          :disabled="disabled"
          @update:selected="onDowSelectedChange"
        />
      </div>

      <!-- 4. Specific day of month (multi-select) -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'specificDom' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="specificDom"
          :checked="activeOption === 'specificDom'"
          @change="selectOption('specificDom')"
        />
        <span class="cron-day-field__option-text">{{ locale.ui.specificDayOfMonth }}</span>
      </label>
      <div v-if="activeOption === 'specificDom'" class="cron-day-field__sub-content">
        <FieldGrid
          :items="domItems"
          :selected="domSelected"
          :cols="7"
          :disabled="disabled"
          @update:selected="onDomSelectedChange"
        />
      </div>

      <!-- 5. On the last day of the month -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'lastDay' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="lastDay"
          :checked="activeOption === 'lastDay'"
          @change="selectOption('lastDay')"
        />
        <span class="cron-day-field__option-text">{{ locale.ui.lastDayOfMonth }}</span>
      </label>

      <!-- 6. On the last weekday of the month -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'lastWeekday' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="lastWeekday"
          :checked="activeOption === 'lastWeekday'"
          @change="selectOption('lastWeekday')"
        />
        <span class="cron-day-field__option-text">{{ locale.ui.lastWeekdayOfMonth }}</span>
      </label>

      <!-- 7. On the last [weekday] of the month -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'lastWeekdayOfMonth' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="lastWeekdayOfMonth"
          :checked="activeOption === 'lastWeekdayOfMonth'"
          @change="selectOption('lastWeekdayOfMonth')"
        />
        <span class="cron-day-field__option-text">
          {{ locale.ui.lastSpecificWeekdayOfMonth.replace('{weekday}', '') }}
        </span>
        <InlineSelect
          :model-value="lastWeekdayValue"
          :items="weekdaySelectItems"
          :disabled="activeOption !== 'lastWeekdayOfMonth'"
          @update:model-value="onLastWeekdayUpdate"
        />
      </label>

      <!-- 8. N day(s) before end of month -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'lastDayOffset' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="lastDayOffset"
          :checked="activeOption === 'lastDayOffset'"
          @change="selectOption('lastDayOffset')"
        />
        <span class="cron-day-field__option-text">
          {{ locale.ui.daysBeforeEndOfMonth.replace('{n}', '') }}
        </span>
        <NumberSpinner
          :model-value="lastDayOffsetValue"
          :min="1"
          :max="30"
          :disabled="activeOption !== 'lastDayOffset'"
          @update:model-value="onLastDayOffsetUpdate"
        />
        <span class="cron-day-field__inline-label">{{ locale.ui.days }}</span>
      </label>

      <!-- 9. Nearest weekday to the Nth -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'nearestWeekday' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="nearestWeekday"
          :checked="activeOption === 'nearestWeekday'"
          @change="selectOption('nearestWeekday')"
        />
        <span class="cron-day-field__option-text">
          {{ locale.ui.nearestWeekdayTo.replace('{day}', '') }}
        </span>
        <NumberSpinner
          :model-value="nearestWeekdayDay"
          :min="1"
          :max="31"
          :disabled="activeOption !== 'nearestWeekday'"
          @update:model-value="onNearestWeekdayDayUpdate"
        />
      </label>

      <!-- 10. On the Nth [weekday] of the month -->
      <label
        class="cron-day-field__option"
        :class="{ 'cron-day-field__option--active': activeOption === 'nthWeekday' }"
      >
        <input
          type="radio"
          :name="radioGroupName"
          value="nthWeekday"
          :checked="activeOption === 'nthWeekday'"
          @change="selectOption('nthWeekday')"
        />
        <span class="cron-day-field__option-text">
          {{ locale.ui.nthWeekdayOfMonth.replace('{nth}', '').replace('{weekday}', '') }}
        </span>
        <InlineSelect
          :model-value="nthOrdinal"
          :items="ordinalSelectItems"
          :disabled="activeOption !== 'nthWeekday'"
          @update:model-value="onNthOrdinalUpdate"
        />
        <InlineSelect
          :model-value="nthWeekdayValue"
          :items="weekdaySelectItems"
          :disabled="activeOption !== 'nthWeekday'"
          @update:model-value="onNthWeekdayUpdate"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FieldItem, CronFormat } from '../core/types'
import type { UseCronSegmentReturn } from '../composables/useCronSegment'
import type { LocaleDefinition } from '../locale/types'
import { FieldWrapper } from '../core/fields'
import { getFieldValueLabel } from '../locale/engine'
import { DAY_OF_MONTH_FIELD, DAY_OF_WEEK_FIELD } from '../core/fields'
import FieldGrid from './FieldGrid.vue'
import NumberSpinner from './NumberSpinner.vue'
import InlineSelect from './InlineSelect.vue'

let instanceCounter = 0

type DayOption =
  | 'everyDay'
  | 'dayStep'
  | 'specificDow'
  | 'specificDom'
  | 'lastDay'
  | 'lastWeekday'
  | 'lastWeekdayOfMonth'
  | 'lastDayOffset'
  | 'nearestWeekday'
  | 'nthWeekday'

const props = withDefaults(
  defineProps<{
    domSegment: UseCronSegmentReturn
    dowSegment: UseCronSegmentReturn
    format: CronFormat
    locale: LocaleDefinition
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const radioGroupName = `cron-day-option-${++instanceCounter}`

const domWrapper = computed(
  () =>
    new FieldWrapper(DAY_OF_MONTH_FIELD, (value: number) =>
      getFieldValueLabel('dayOfMonth', value, props.locale),
    ),
)

const dowWrapper = computed(
  () =>
    new FieldWrapper(DAY_OF_WEEK_FIELD, (value: number) =>
      getFieldValueLabel('dayOfWeek', value, props.locale),
    ),
)

const domItems = computed<ReadonlyArray<FieldItem>>(() => domWrapper.value.items)
const weekdayItems = computed<ReadonlyArray<FieldItem>>(() => dowWrapper.value.items)

const weekdaySelectItems = computed<ReadonlyArray<FieldItem>>(() =>
  props.locale.weekdays.map((label, idx) => ({ value: idx, label })),
)

const ordinalSelectItems = computed<ReadonlyArray<FieldItem>>(() =>
  props.locale.ui.ordinals.map((label, idx) => ({ value: idx + 1, label })),
)

const domSelected = computed<ReadonlyArray<number>>(() => [...props.domSegment.selected.value])
const dowSelected = computed<ReadonlyArray<number>>(() => [...props.dowSegment.selected.value])

function detectActiveOption(): DayOption {
  const domSeg = props.domSegment.segment.value
  const dowSeg = props.dowSegment.segment.value

  if (domSeg.type === 'lastDay' && domSeg.offset > 0) return 'lastDayOffset'
  if (domSeg.type === 'lastDay') return 'lastDay'
  if (domSeg.type === 'lastWeekday') return 'lastWeekday'
  if (domSeg.type === 'nearestWeekday') return 'nearestWeekday'
  if (dowSeg.type === 'lastWeekdayOfMonth') return 'lastWeekdayOfMonth'
  if (dowSeg.type === 'nthWeekday') return 'nthWeekday'

  if (domSeg.type === 'step') return 'dayStep'

  if (
    dowSeg.type !== 'any' &&
    dowSeg.type !== 'noSpecific' &&
    (domSeg.type === 'any' || domSeg.type === 'noSpecific')
  ) {
    return 'specificDow'
  }

  if (
    domSeg.type !== 'any' &&
    domSeg.type !== 'noSpecific' &&
    (dowSeg.type === 'any' || dowSeg.type === 'noSpecific')
  ) {
    return 'specificDom'
  }

  return 'everyDay'
}

const activeOption = ref<DayOption>(detectActiveOption())

let isSelecting = false

watch(
  [() => props.domSegment.segment.value, () => props.dowSegment.segment.value],
  () => {
    if (isSelecting) return
    activeOption.value = detectActiveOption()
  },
)

const stepValue = computed(() => {
  const seg = props.domSegment.segment.value
  return seg.type === 'step' ? seg.step : 1
})

const stepStart = computed(() => {
  const seg = props.domSegment.segment.value
  if (seg.type === 'step' && seg.base !== '*') return seg.base
  return 1
})

const lastDayOffsetValue = computed(() => {
  const seg = props.domSegment.segment.value
  return seg.type === 'lastDay' ? seg.offset : 1
})

const nearestWeekdayDay = computed(() => {
  const seg = props.domSegment.segment.value
  return seg.type === 'nearestWeekday' ? seg.day : 1
})

const lastWeekdayValue = computed(() => {
  const seg = props.dowSegment.segment.value
  return seg.type === 'lastWeekdayOfMonth' ? seg.weekday : 0
})

const nthOrdinal = computed(() => {
  const seg = props.dowSegment.segment.value
  return seg.type === 'nthWeekday' ? seg.nth : 1
})

const nthWeekdayValue = computed(() => {
  const seg = props.dowSegment.segment.value
  return seg.type === 'nthWeekday' ? seg.weekday : 0
})

function isDomSelectable(type: string): boolean {
  return type === 'value' || type === 'range' || type === 'combined'
}

function isDowSelectable(type: string): boolean {
  return type === 'value' || type === 'range' || type === 'combined'
}

function setDomNoSpecific(): void {
  props.domSegment.setType(props.format === 'quartz' ? 'noSpecific' : 'any')
}

function setDowNoSpecific(): void {
  props.dowSegment.setType(props.format === 'quartz' ? 'noSpecific' : 'any')
}

function selectOption(option: DayOption): void {
  isSelecting = true
  try {
    activeOption.value = option

    switch (option) {
      case 'everyDay':
        props.domSegment.setType('any')
        setDowNoSpecific()
        break
      case 'dayStep':
        props.domSegment.setStep(stepStart.value, stepValue.value)
        setDowNoSpecific()
        break
      case 'specificDow':
        setDomNoSpecific()
        if (!isDowSelectable(props.dowSegment.segment.value.type)) {
          props.dowSegment.setSelected([1, 2, 3, 4, 5])
        }
        break
      case 'specificDom':
        if (!isDomSelectable(props.domSegment.segment.value.type)) {
          props.domSegment.setSelected([1])
        }
        setDowNoSpecific()
        break
      case 'lastDay':
        props.domSegment.setType('lastDay')
        setDowNoSpecific()
        break
      case 'lastWeekday':
        props.domSegment.setType('lastWeekday')
        setDowNoSpecific()
        break
      case 'lastWeekdayOfMonth':
        setDomNoSpecific()
        props.dowSegment.setType('lastWeekdayOfMonth')
        break
      case 'lastDayOffset':
        props.domSegment.setCron(`L-${lastDayOffsetValue.value}`)
        setDowNoSpecific()
        break
      case 'nearestWeekday':
        props.domSegment.setCron(`${nearestWeekdayDay.value}W`)
        setDowNoSpecific()
        break
      case 'nthWeekday':
        setDomNoSpecific()
        props.dowSegment.setCron(`${nthWeekdayValue.value}#${nthOrdinal.value}`)
        break
    }
  } finally {
    isSelecting = false
  }
}

function onStepValueUpdate(value: number): void {
  props.domSegment.setStep(stepStart.value, value)
}

function onStepStartUpdate(value: number): void {
  props.domSegment.setStep(value, stepValue.value)
}

function onDowSelectedChange(values: ReadonlyArray<number>): void {
  props.dowSegment.setSelected(values)
}

function onDomSelectedChange(values: ReadonlyArray<number>): void {
  props.domSegment.setSelected(values)
}

function onLastDayOffsetUpdate(value: number): void {
  props.domSegment.setCron(`L-${value}`)
}

function onNearestWeekdayDayUpdate(value: number): void {
  props.domSegment.setCron(`${value}W`)
}

function onLastWeekdayUpdate(value: number | ReadonlyArray<number>): void {
  const v = Array.isArray(value) ? value[0] : value
  props.dowSegment.setCron(`${v}L`)
}

function onNthOrdinalUpdate(value: number | ReadonlyArray<number>): void {
  const v = Array.isArray(value) ? value[0] : value
  props.dowSegment.setCron(`${nthWeekdayValue.value}#${v}`)
}

function onNthWeekdayUpdate(value: number | ReadonlyArray<number>): void {
  const v = Array.isArray(value) ? value[0] : value
  props.dowSegment.setCron(`${v}#${nthOrdinal.value}`)
}
</script>
