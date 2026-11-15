export type InputMaskName =
  | 'cpf'
  | 'cnpj'
  | 'cpf-or-cnpj'
  | 'phone'
  | 'cep'
  | 'date'
  | 'time'
  | 'money'
  | 'integer'
  | 'decimal'
  | 'percent'
  | 'weight'
  | 'length'
  | 'amazon-code'

export type InputMaskKeyboard = 'numeric' | 'decimal' | 'tel' | 'text'

export type CaretPlacement = 'keep-position' | 'always-at-end'

export interface InputMask {
  keyboard: InputMaskKeyboard
  caretPlacement: CaretPlacement
  placeholder?: string
  prefix?: string
  suffix?: string
  autocomplete?: string
  isSignificantCharacter: (character: string) => boolean
  formatTypedText: (typedText: string) => string
  readModelValue: (displayedText: string) => string
  formatModelValue: (modelValue: string) => string
}

const DIGIT_PATTERN = /\d/
const DIGIT_PLACEHOLDER = '#'

function isDigit(character: string): boolean {
  return DIGIT_PATTERN.test(character)
}

function keepDigits(text: string): string {
  return text.replace(/\D/g, '')
}

function applyDigitPattern(digits: string, pattern: string): string {
  let formattedText = ''
  let digitPosition = 0
  for (const patternCharacter of pattern) {
    if (digitPosition >= digits.length) {
      break
    }
    if (patternCharacter === DIGIT_PLACEHOLDER) {
      formattedText += digits[digitPosition]
      digitPosition += 1
    } else {
      formattedText += patternCharacter
    }
  }
  return formattedText
}

function countPlaceholders(pattern: string): number {
  return pattern.split('').filter((character) => character === DIGIT_PLACEHOLDER).length
}

interface DigitPatternMaskOptions {
  patterns: string[]
  keyboard?: InputMaskKeyboard
  placeholder?: string
  autocomplete?: string
}

function createDigitPatternMask({
  patterns,
  keyboard = 'numeric',
  placeholder,
  autocomplete,
}: DigitPatternMaskOptions): InputMask {
  const patternsByCapacity = [...patterns].sort(
    (firstPattern, secondPattern) =>
      countPlaceholders(firstPattern) - countPlaceholders(secondPattern),
  )
  const largestPattern = patternsByCapacity[patternsByCapacity.length - 1] ?? ''
  const largestCapacity = countPlaceholders(largestPattern)

  function formatDigits(text: string): string {
    const digits = keepDigits(text).slice(0, largestCapacity)
    const fittingPattern =
      patternsByCapacity.find((pattern) => digits.length <= countPlaceholders(pattern)) ??
      largestPattern
    return applyDigitPattern(digits, fittingPattern)
  }

  return {
    keyboard,
    caretPlacement: 'keep-position',
    placeholder: placeholder ?? largestPattern.replaceAll(DIGIT_PLACEHOLDER, '0'),
    autocomplete,
    isSignificantCharacter: isDigit,
    formatTypedText: formatDigits,
    readModelValue: keepDigits,
    formatModelValue: formatDigits,
  }
}

function groupThousands(integerDigits: string): string {
  return integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function removeLeadingZeros(integerDigits: string): string {
  const trimmedDigits = integerDigits.replace(/^0+(?=\d)/, '')
  return trimmedDigits
}

interface DecimalMaskOptions {
  fractionDigits: number
  prefix?: string
  suffix?: string
  placeholder?: string
}

function createDecimalMask({
  fractionDigits,
  prefix,
  suffix,
  placeholder,
}: DecimalMaskOptions): InputMask {
  function formatTypedText(typedText: string): string {
    const cleanedText = typedText.replace(/[^\d,]/g, '')
    const commaPosition = cleanedText.indexOf(',')
    const typedIntegerPart =
      commaPosition === -1 ? cleanedText : cleanedText.slice(0, commaPosition)
    const integerDigits = removeLeadingZeros(keepDigits(typedIntegerPart))
    if (commaPosition === -1 || fractionDigits === 0) {
      return groupThousands(integerDigits)
    }
    const fractionPart = keepDigits(cleanedText.slice(commaPosition + 1)).slice(0, fractionDigits)
    return `${groupThousands(integerDigits || '0')},${fractionPart}`
  }

  function readModelValue(displayedText: string): string {
    const plainNumber = displayedText.replaceAll('.', '').replace(',', '.').replace(/\.$/, '')
    return plainNumber
  }

  function formatModelValue(modelValue: string): string {
    if (!modelValue) {
      return ''
    }
    const [integerPart = '', fractionPart] = modelValue.split('.')
    return formatTypedText(
      fractionPart === undefined ? integerPart : `${integerPart},${fractionPart}`,
    )
  }

  return {
    keyboard: fractionDigits > 0 ? 'decimal' : 'numeric',
    caretPlacement: 'keep-position',
    placeholder: placeholder ?? (fractionDigits > 0 ? `0,${'0'.repeat(fractionDigits)}` : '0'),
    prefix,
    suffix,
    isSignificantCharacter: (character) => isDigit(character) || character === ',',
    formatTypedText,
    readModelValue,
    formatModelValue,
  }
}

const CENTS_PER_REAL = 100

function formatCents(centsDigits: string): string {
  const significantDigits = removeLeadingZeros(centsDigits)
  if (!significantDigits || /^0+$/.test(significantDigits)) {
    return ''
  }
  const paddedDigits = significantDigits.padStart(3, '0')
  const integerDigits = paddedDigits.slice(0, -2)
  const fractionDigits = paddedDigits.slice(-2)
  return `${groupThousands(integerDigits)},${fractionDigits}`
}

const moneyMask: InputMask = {
  keyboard: 'numeric',
  caretPlacement: 'always-at-end',
  placeholder: '0,00',
  prefix: 'R$',
  isSignificantCharacter: isDigit,
  formatTypedText: (typedText) => formatCents(keepDigits(typedText)),
  readModelValue: (displayedText) => {
    const centsDigits = keepDigits(displayedText)
    return centsDigits ? (Number(centsDigits) / CENTS_PER_REAL).toFixed(2) : ''
  },
  formatModelValue: (modelValue) => {
    if (!modelValue || Number.isNaN(Number(modelValue))) {
      return ''
    }
    if (Number(modelValue) === 0) {
      return '0,00'
    }
    return formatCents(String(Math.round(Number(modelValue) * CENTS_PER_REAL)))
  },
}

function isRealCalendarDate(day: number, month: number, year: number): boolean {
  const candidateDate = new Date(year, month - 1, day)
  return (
    candidateDate.getFullYear() === year &&
    candidateDate.getMonth() === month - 1 &&
    candidateDate.getDate() === day
  )
}

const DATE_DIGIT_COUNT = 8

const dateDigitMask = createDigitPatternMask({
  patterns: ['##/##/####'],
  placeholder: 'dd/mm/aaaa',
})

const dateMask: InputMask = {
  ...dateDigitMask,
  readModelValue: (displayedText) => {
    const digits = keepDigits(displayedText)
    if (digits.length !== DATE_DIGIT_COUNT) {
      return ''
    }
    const day = Number(digits.slice(0, 2))
    const month = Number(digits.slice(2, 4))
    const year = Number(digits.slice(4))
    if (!isRealCalendarDate(day, month, year)) {
      return ''
    }
    return `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
  },
  formatModelValue: (modelValue) => {
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(modelValue)
    return isoMatch ? `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}` : ''
  },
}

const TIME_DIGIT_COUNT = 4
const LAST_HOUR = 23
const LAST_MINUTE = 59

const timeDigitMask = createDigitPatternMask({ patterns: ['##:##'], placeholder: '00:00' })

const timeMask: InputMask = {
  ...timeDigitMask,
  readModelValue: (displayedText) => {
    const digits = keepDigits(displayedText)
    if (digits.length !== TIME_DIGIT_COUNT) {
      return ''
    }
    const hours = Number(digits.slice(0, 2))
    const minutes = Number(digits.slice(2))
    return hours <= LAST_HOUR && minutes <= LAST_MINUTE
      ? `${digits.slice(0, 2)}:${digits.slice(2)}`
      : ''
  },
  formatModelValue: (modelValue) => timeDigitMask.formatModelValue(modelValue),
}

const AMAZON_CODE_LENGTH = 10

function keepAmazonCodeCharacters(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, AMAZON_CODE_LENGTH)
}

const amazonCodeMask: InputMask = {
  keyboard: 'text',
  caretPlacement: 'keep-position',
  placeholder: 'X000000000',
  isSignificantCharacter: (character) => /[A-Za-z0-9]/.test(character),
  formatTypedText: keepAmazonCodeCharacters,
  readModelValue: keepAmazonCodeCharacters,
  formatModelValue: keepAmazonCodeCharacters,
}

export const INPUT_MASKS: Record<InputMaskName, InputMask> = {
  cpf: createDigitPatternMask({ patterns: ['###.###.###-##'] }),
  cnpj: createDigitPatternMask({ patterns: ['##.###.###/####-##'] }),
  'cpf-or-cnpj': createDigitPatternMask({
    patterns: ['###.###.###-##', '##.###.###/####-##'],
    placeholder: 'CPF ou CNPJ',
  }),
  phone: createDigitPatternMask({
    patterns: ['(##) ####-####', '(##) #####-####'],
    keyboard: 'tel',
    placeholder: '(00) 00000-0000',
    autocomplete: 'tel-national',
  }),
  cep: createDigitPatternMask({ patterns: ['#####-###'], autocomplete: 'postal-code' }),
  date: dateMask,
  time: timeMask,
  money: moneyMask,
  integer: createDecimalMask({ fractionDigits: 0 }),
  decimal: createDecimalMask({ fractionDigits: 2 }),
  percent: createDecimalMask({ fractionDigits: 2, suffix: '%' }),
  weight: createDecimalMask({ fractionDigits: 3, suffix: 'kg' }),
  length: createDecimalMask({ fractionDigits: 1, suffix: 'cm' }),
  'amazon-code': amazonCodeMask,
}

export function countSignificantCharacters(
  text: string,
  endPosition: number,
  isSignificantCharacter: (character: string) => boolean,
): number {
  return text
    .slice(0, endPosition)
    .split('')
    .filter((character) => isSignificantCharacter(character)).length
}

export function findPositionAfterSignificantCharacters(
  text: string,
  significantCount: number,
  isSignificantCharacter: (character: string) => boolean,
): number {
  if (significantCount === 0) {
    return 0
  }
  let countedCharacters = 0
  for (let position = 0; position < text.length; position += 1) {
    if (isSignificantCharacter(text.charAt(position))) {
      countedCharacters += 1
      if (countedCharacters === significantCount) {
        return position + 1
      }
    }
  }
  return text.length
}

export function keepSignificantCharacters(
  text: string,
  isSignificantCharacter: (character: string) => boolean,
): string {
  return text
    .split('')
    .filter((character) => isSignificantCharacter(character))
    .join('')
}
