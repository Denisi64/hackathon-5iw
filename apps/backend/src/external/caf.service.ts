export function computeTSTLevel(quotientFamilial: number): 'tst_gratuite' | 'tst_75' | 'tst_50' | null {
  if (quotientFamilial <= 400) return 'tst_gratuite'
  if (quotientFamilial <= 600) return 'tst_75'
  if (quotientFamilial <= 800) return 'tst_50'
  return null
}
