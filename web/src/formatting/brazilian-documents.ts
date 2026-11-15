const CPF_LENGTH = 11
const CNPJ_LENGTH = 14

function hasOnlyRepeatedDigits(digits: string): boolean {
  return /^(\d)\1*$/.test(digits)
}

function calculateCheckDigit(digits: string, weights: number[]): number {
  const weightedSum = weights.reduce(
    (sum, weight, position) => sum + Number(digits.charAt(position)) * weight,
    0,
  )
  const remainder = weightedSum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCpf(text: string): boolean {
  const digits = text.replace(/\D/g, '')
  if (digits.length !== CPF_LENGTH || hasOnlyRepeatedDigits(digits)) {
    return false
  }
  const firstCheckDigit = calculateCheckDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondCheckDigit = calculateCheckDigit(digits, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return digits.endsWith(`${firstCheckDigit}${secondCheckDigit}`)
}

export function isValidCnpj(text: string): boolean {
  const digits = text.replace(/\D/g, '')
  if (digits.length !== CNPJ_LENGTH || hasOnlyRepeatedDigits(digits)) {
    return false
  }
  const firstCheckDigit = calculateCheckDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondCheckDigit = calculateCheckDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return digits.endsWith(`${firstCheckDigit}${secondCheckDigit}`)
}

export function isValidCpfOrCnpj(text: string): boolean {
  return isValidCpf(text) || isValidCnpj(text)
}
