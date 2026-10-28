<template>
  <div class="cron-selector__field">
    <div class="cron-selector__options" role="radiogroup">
      <!-- 1. Every day -->
      <label
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeOption === 'everyDay' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="radioGroupName"
          value="everyDay"
          :checked="activeOption === 'everyDay'"
          @change="selectOption('everyDay')"
        />
        <span class="cron-selector__option-text">{{ locale.templates.day.everyDay }}</span>
      </label>

      <!-- 2. Every N day(s) starting at D of the month (step) -->
      <label
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeOption === 'dayStep' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="radioGroupName"
          value="dayStep"
          :checked="activeOption === 'dayStep'"
          @change="selectOption('dayStep')"
        />
        <template v-for="(part, index) in dayStepTemplateParts" :key="index">
          <span v-if="part.token === null" class="cron-selector__option-text">
            {{ part.text }}
          </span>
          <NumberSpinner
            v-else-if="part.token === 'step'"
            :model-value="stepValue"
            :min="1"
            :max="31"
            :disabled="activeOption !== 'dayStep'"
            @update:model-value="onStepValueUpdate"
          />
          <NumberSpinner
            v-else
            :model-value="stepStart"
            :min="1"
            :max="31"
            :disabled="activeOption !== 'dayStep'"
            @update:model-value="onStepStartUpdate"
          />
        </template>
      </label>

      <!-- 3. Specific day of week (multi-select) -->
      <label
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeOption === 'specificDow' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="radioGroupName"
          value="specificDow"
          :checked="activeOption === 'specificDow'"
          @change="selectOption('specificDow')"
        />
        <span class="cron-selector__option-text">{{ locale.templates.day.specificDayOfWeek }}</span>
      </label>
      <div v-if="activeOption === 'specificDow'" class="cron-selector__sub-content">
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
        class="cron-selector__option"
        :class="{ 'cron-selector__option--active': activeOption === 'specificDom' }"
      >
        <input
          type="radio"
          :disabled="disabled"
          :name="radioGroupName"
          value="specificDom"
          :checked="activeOption === 'specificDom'"
          @change="selectOption('specificDom')"
        />
        <span class="cron-selector__option-text">{{
          locale.templates.day.specificDayOfMonth
        }}</span>
      </label>
      <div v-if="activeOption === 'specificDom'" class="cron-selector__sub-content">
        <FieldGrid
          :items="domItems"
          :selected="domSelected"
          :cols="7"
          :disabled="disabled"
          @update:selected="onDomSelectedChange"
        />
      </div>

      <!-- Quartz-only day options (last day / last weekday / L-n / W / nth
           weekday). Standard crontab does not support these — they are hidden
           entirely in crontab mode instead of being disabled, so the UI stays
           clean and unambiguous for POSIX-style users. The selectOption
           watch still falls back to 'every day' if the user switches format
           while a Quartz-only option is active. -->
      <template v-if="!isCrontab">
        <!-- 5. On the last day of the month -->
        <label
          class="cron-selector__option"
          :class="{ 'cron-selector__option--active': activeOption === 'lastDay' }"
        >
          <input
            type="radio"
            :disabled="disabled"
            :name="radioGroupName"
            value="lastDay"
            :checked="activeOption === 'lastDay'"
            @change="selectOption('lastDay')"
          />
          <span class="cron-selector__option-text">{{ locale.templates.day.lastDayOfMonth }}</span>
        </label>

        <!-- 6. On the last business day of the month -->
        <label
          class="cron-selector__option"
          :class="{ 'cron-selector__option--active': activeOption === 'lastBusinessDay' }"
        >
          <input
            type="radio"
            :disabled="disabled"
            :name="radioGroupName"
            value="lastBusinessDay"
            :checked="activeOption === 'lastBusinessDay'"
            @change="selectOption('lastBusinessDay')"
          />
          <span class="cron-selector__option-text">{{
            locale.templates.day.lastBusinessDayOfMonth
          }}</span>
        </label>

        <!-- 7. On the last [weekday] of the month -->
        <label
          class="cron-selector__option"
          :class="{ 'cron-selector__option--active': activeOption === 'lastWeekdayOfMonth' }"
        >
          <input
            type="radio"
            :disabled="disabled"
            :name="radioGroupName"
            value="lastWeekdayOfMonth"
            :checked="activeOption === 'lastWeekdayOfMonth'"
            @change="selectOption('lastWeekdayOfMonth')"
          />
          <template v-for="(part, index) in lastWeekdayTemplateParts" :key="index">
            <span v-if="part.token === null" class="cron-selector__option-text">
              {{ part.text }}
            </span>
            <InlineSelect
              v-else
              :model-value="lastWeekdayValue"
              :items="weekdaySelectItems"
              :disabled="activeOption !== 'lastWeekdayOfMonth'"
              @update:model-value="onLastWeekdayUpdate"
            />
          </template>
        </label>

        <!-- 8. N day(s) before end of month -->
        <label
          class="cron-selector__option"
          :class="{ 'cron-selector__option--active': activeOption === 'lastDayOffset' }"
        >
          <input
            type="radio"
            :disabled="disabled"
            :name="radioGroupName"
            value="lastDayOffset"
            :checked="activeOption === 'lastDayOffset'"
            @change="selectOption('lastDayOffset')"
          />
          <template v-for="(part, index) in lastDayOffsetTemplateParts" :key="index">
            <span v-if="part.token === null" class="cron-selector__option-text">
              {{ part.text }}
            </span>
            <NumberSpinner
              v-else
              :model-value="lastDayOffsetValue"
              :min="1"
              :max="30"
              :disabled="activeOption !== 'lastDayOffset'"
              @update:model-value="onLastDayOffsetUpdate"
            />
          </template>
        </label>

        <!-- 9. Nearest weekday to the Nth -->
        <label
          class="cron-selector__option"
          :class="{ 'cron-selector__option--active': activeOption === 'nearestWeekday' }"
        >
          <input
            type="radio"
            :disabled="disabled"
            :name="radioGroupName"
            value="nearestWeekday"
            :checked="activeOption === 'nearestWeekday'"
            @change="selectOption('nearestWeekday')"
          />
          <template v-for="(part, index) in nearestWeekdayTemplateParts" :key="index">
            <span v-if="part.token === null" class="cron-selector__option-text">
              {{ part.text }}
            </span>
            <NumberSpinner
              v-else
              :model-value="nearestWeekdayDay"
              :min="1"
              :max="31"
              :disabled="activeOption !== 'nearestWeekday'"
              @update:model-value="onNearestWeekdayDayUpdate"
            />
          </template>
        </label>

        <!-- 10. On the Nth [weekday] of the month -->
        <label
          class="cron-selector__option"
          :class="{ 'cron-selector__option--active': activeOption === 'nthWeekday' }"
        >
          <input
            type="radio"
            :disabled="disabled"
            :name="radioGroupName"
            value="nthWeekday"
            :checked="activeOption === 'nthWeekday'"
            @change="selectOption('nthWeekday')"
          />
          <template v-for="(part, index) in nthWeekdayTemplateParts" :key="index">
            <span v-if="part.token === null" class="cron-selector__option-text">
              {{ part.text }}
            </span>
            <InlineSelect
              v-else-if="part.token === 'nth'"
              :model-value="nthOrdinal"
              :items="ordinalSelectItems"
              :disabled="activeOption !== 'nthWeekday'"
              @update:model-value="onNthOrdinalUpdate"
            />
            <InlineSelect
              v-else
              :model-value="nthWeekdayValue"
              :items="weekdaySelectItems"
              :disabled="activeOption !== 'nthWeekday'"
              @update:model-value="onNthWeekdayUpdate"
            />
          </template>
        </label>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useId } from 'vue'
import type { FieldItem, CronFormat, FieldDefinition } from '../core/types'
import type { UseCronSegmentReturn } from '../composables/useCronSegment'
import type { LocaleDefinition } from '../locale/types'
import { FieldWrapper } from '../core/fields'
import { getFieldValueLabel, pluralUnit } from '../locale/engine'
import { parseLocaleTemplate, compactTemplateParts } from '../locale/template'
import { DAY_OF_MONTH_FIELD, DAY_OF_WEEK_FIELD } from '../core/fields'
import FieldGrid from './FieldGrid.vue'
import NumberSpinner from './NumberSpinner.vue'
import InlineSelect from './InlineSelect.vue'

type DayOption =
  | 'everyDay'
  | 'dayStep'
  | 'specificDow'
  | 'specificDom'
  | 'lastDay'
  | 'lastBusinessDay'
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

const radioGroupName = `cron-day-option-${useId()}`

// Module-level cache so multiple CronDayField instances (and re-renders that
// produce a fresh `props.locale` reference) share the same FieldWrapper per
// (fieldId, localeCode). FieldWrapper.items is already memoized internally;
// this layer just stops us from throwing away the whole wrapper each render.
const wrapperCache = new Map<string, FieldWrapper>()
function getWrapper(
  fieldId: 'dayOfMonth' | 'dayOfWeek',
  definition: FieldDefinition,
  locale: LocaleDefinition,
): FieldWrapper {
  const key = `${fieldId}|${locale.code}`
  const hit = wrapperCache.get(key)
  if (hit) return hit
  const wrapper = new FieldWrapper(definition, (value: number) =>
    getFieldValueLabel(fieldId, value, locale),
  )
  wrapperCache.set(key, wrapper)
  return wrapper
}

const domWrapper = computed(() => getWrapper('dayOfMonth', DAY_OF_MONTH_FIELD, props.locale))

const dowWrapper = computed(() => getWrapper('dayOfWeek', DAY_OF_WEEK_FIELD, props.locale))

const domItems = computed<ReadonlyArray<FieldItem>>(() => domWrapper.value.items)
const weekdayItems = computed<ReadonlyArray<FieldItem>>(() => dowWrapper.value.items)

const weekdaySelectItems = computed<ReadonlyArray<FieldItem>>(() =>
  props.locale.weekdays.map((label, idx) => ({ value: idx, label })),
)

const ordinalSelectItems = computed<ReadonlyArray<FieldItem>>(() =>
  props.locale.ordinals.map((label, idx) => ({ value: idx + 1, label })),
)

const domSelected = computed<ReadonlyArray<number>>(() => [...props.domSegment.selected.value])
const dowSelected = computed<ReadonlyArray<number>>(() => [...props.dowSegment.selected.value])

// Each option's copy is a locale template; the components render its literal
// text inline and put the spinners/selects where the placeholders sit, so the
// word order stays correct in every language.
const dayStepTemplateParts = computed(() =>
  compactTemplateParts(
    parseLocaleTemplate(props.locale.templates.day.everyNStartingAt, {
      unit: pluralUnit('dayOfMonth', stepValue.value, props.locale),
    }),
  ),
)
const lastWeekdayTemplateParts = computed(() =>
  compactTemplateParts(parseLocaleTemplate(props.locale.templates.day.lastWeekdayOfMonth)),
)
const lastDayOffsetTemplateParts = computed(() =>
  compactTemplateParts(
    parseLocaleTemplate(props.locale.templates.day.daysBeforeEndOfMonth, {
      unit: pluralUnit('dayOfMonth', lastDayOffsetValue.value, props.locale),
    }),
  ),
)
const nearestWeekdayTemplateParts = computed(() =>
  compactTemplateParts(parseLocaleTemplate(props.locale.templates.day.nearestWeekdayTo)),
)
const nthWeekdayTemplateParts = computed(() =>
  compactTemplateParts(parseLocaleTemplate(props.locale.templates.day.nthWeekdayOfMonth)),
)

function detectActiveOption(): DayOption {
  const domSeg = props.domSegment.segment.value
  const dowSeg = props.dowSegment.segment.value

  if (domSeg.type === 'lastDay' && domSeg.offset > 0) return 'lastDayOffset'
  if (domSeg.type === 'lastDay') return 'lastDay'
  if (domSeg.type === 'lastBusinessDay') return 'lastBusinessDay'
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

const isCrontab = computed(() => props.format === 'crontab')

// Quartz-only day options are not representable in crontab (parser rejects them).
// Hide them in crontab mode so the user cannot trigger a silent no-op, and
// fall back to "every day" if the current expression somehow depends on them.
const QUARTZ_ONLY_OPTIONS: ReadonlySet<DayOption> = new Set<DayOption>([
  'lastDay',
  'lastBusinessDay',
  'lastWeekdayOfMonth',
  'lastDayOffset',
  'nearestWeekday',
  'nthWeekday',
])

watch(isCrontab, (val) => {
  if (!val) return
  if (QUARTZ_ONLY_OPTIONS.has(activeOption.value)) {
    selectOption('everyDay')
  }
})

watch([() => props.domSegment.segment.value, () => props.dowSegment.segment.value], () => {
  if (isSelecting) return
  activeOption.value = detectActiveOption()
})

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
      case 'lastBusinessDay':
        props.domSegment.setType('lastBusinessDay')
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
