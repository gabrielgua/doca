<script setup lang="ts" generic="TableRow">
import { computed, ref, useTemplateRef } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { SortAscendingIcon, SortDescendingIcon, SortableIcon } from '@/theme/app-icons'

export type SortDirection = 'ascending' | 'descending'

export type ColumnAlignment = 'start' | 'end'

export interface DataTableColumn<ColumnRow> {
  key: string
  label: string
  sortValue?: (row: ColumnRow) => string | number
  alignment?: ColumnAlignment
  widthClass?: string
  isLabelHidden?: boolean
}

export interface DataTableSort {
  columnKey: string
  direction: SortDirection
}

interface BaseDataTableProps {
  rows: TableRow[]
  columns: DataTableColumn<TableRow>[]
  rowKey: (row: TableRow) => string
  caption: string
  initialSort?: DataTableSort
  expandedRowKey?: string | null
}

const props = withDefaults(defineProps<BaseDataTableProps>(), {
  initialSort: undefined,
  expandedRowKey: null,
})

defineSlots<
  {
    [cellSlotName: `cell-${string}`]: (slotProps: { row: TableRow }) => unknown
  } & {
    'row-detail'?: (slotProps: { row: TableRow }) => unknown
  }
>()

const scrollContainerElement = useTemplateRef<HTMLDivElement>('scroll-container')
const tableElement = useTemplateRef<HTMLTableElement>('table')
const containerHeightInPixels = ref<number>()

function updateContainerHeight() {
  const scrollContainer = scrollContainerElement.value
  const table = tableElement.value
  if (!scrollContainer || !table) {
    return
  }
  const horizontalScrollbarHeight = scrollContainer.offsetHeight - scrollContainer.clientHeight
  containerHeightInPixels.value = table.offsetHeight + horizontalScrollbarHeight
}

useResizeObserver([tableElement, scrollContainerElement], updateContainerHeight)

const activeSort = ref<DataTableSort | null>(props.initialSort ?? null)

const alignmentClassesByAlignment: Record<ColumnAlignment, string> = {
  start: 'text-left',
  end: 'text-right',
}

const headerButtonAlignmentClassesByAlignment: Record<ColumnAlignment, string> = {
  start: '',
  end: 'ml-auto flex-row-reverse',
}

const sortedRows = computed(() => {
  const sort = activeSort.value
  const sortColumn = props.columns.find((column) => column.key === sort?.columnKey)
  if (!sort || !sortColumn?.sortValue) {
    return props.rows
  }
  const readSortValue = sortColumn.sortValue
  const directionMultiplier = sort.direction === 'ascending' ? 1 : -1
  return [...props.rows].sort((firstRow, secondRow) => {
    const firstValue = readSortValue(firstRow)
    const secondValue = readSortValue(secondRow)
    const comparison =
      typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), 'pt-BR', { numeric: true })
    return comparison * directionMultiplier
  })
})

function readSortDirection(columnKey: string): SortDirection | null {
  return activeSort.value?.columnKey === columnKey ? activeSort.value.direction : null
}

function readAriaSort(columnKey: string) {
  const sortDirection = readSortDirection(columnKey)
  return sortDirection ?? 'none'
}

function handleSortClick(columnKey: string) {
  const currentDirection = readSortDirection(columnKey)
  activeSort.value = {
    columnKey,
    direction: currentDirection === 'ascending' ? 'descending' : 'ascending',
  }
}
</script>

<template>
  <div
    ref="scroll-container"
    class="relative overflow-x-auto overflow-y-hidden transition-all duration-500 ease-bounce motion-reduce:transition-none"
    :style="containerHeightInPixels ? { height: `${containerHeightInPixels}px` } : undefined"
  >
    <table ref="table" class="w-full min-w-3xl border-collapse text-sm">
      <caption class="sr-only">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr class="border-b border-neutral-100 dark:border-neutral-800">
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-4 py-3 text-caption font-extrabold tracking-wider text-neutral-400 uppercase first:pl-5 last:pr-5 dark:text-neutral-500"
            :class="[alignmentClassesByAlignment[column.alignment ?? 'start'], column.widthClass]"
            :aria-sort="column.sortValue ? readAriaSort(column.key) : undefined"
          >
            <span v-if="column.isLabelHidden" class="sr-only">{{ column.label }}</span>
            <button
              v-else-if="column.sortValue"
              type="button"
              class="group flex cursor-pointer items-center gap-1.5 rounded-lg uppercase transition-bouncy hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-brand-500 active:scale-95 dark:hover:text-neutral-200"
              :class="[
                headerButtonAlignmentClassesByAlignment[column.alignment ?? 'start'],
                { 'text-brand-600 dark:text-brand-400': readSortDirection(column.key) },
              ]"
              @click="handleSortClick(column.key)"
            >
              {{ column.label }}
              <Transition
                mode="out-in"
                enter-active-class="transition duration-300 ease-bounce motion-reduce:transition-none"
                enter-from-class="scale-50 opacity-0"
                leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
                leave-to-class="scale-50 opacity-0"
              >
                <BaseIcon
                  v-if="readSortDirection(column.key) === 'ascending'"
                  key="ascending"
                  :icon="SortAscendingIcon"
                  size="xs"
                />
                <BaseIcon
                  v-else-if="readSortDirection(column.key) === 'descending'"
                  key="descending"
                  :icon="SortDescendingIcon"
                  size="xs"
                />
                <BaseIcon
                  v-else
                  key="unsorted"
                  :icon="SortableIcon"
                  size="xs"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Transition>
            </button>
            <template v-else>{{ column.label }}</template>
          </th>
        </tr>
      </thead>
      <TransitionGroup
        tag="tbody"
        appear
        enter-active-class="transition-opacity duration-300 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <template v-for="row in sortedRows" :key="rowKey(row)">
          <tr
            class="group border-b border-neutral-100 transition-bouncy last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 align-middle first:pl-5 last:pr-5"
              :class="[alignmentClassesByAlignment[column.alignment ?? 'start'], column.widthClass]"
            >
              <slot :name="`cell-${column.key}`" :row="row" />
            </td>
          </tr>
          <tr
            v-if="$slots['row-detail'] && expandedRowKey === rowKey(row)"
            class="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40"
          >
            <td :colspan="columns.length" class="px-5 py-4">
              <slot name="row-detail" :row="row" />
            </td>
          </tr>
        </template>
      </TransitionGroup>
    </table>
  </div>
</template>
