export const usePasswordStrength = (password: MaybeRefOrGetter<string>) => {
  const strength = computed(() => {
    const p = toValue(password)
    if (!p) return { score: 0, label: '', color: '' }
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++

    const map: Record<number, { label: string; color: string }> = {
      0: { label: '', color: '' },
      1: { label: 'Weak', color: 'bg-destructive' },
      2: { label: 'Fair', color: 'bg-accent' },
      3: { label: 'Good', color: 'bg-secondary' },
      4: { label: 'Strong', color: 'bg-secondary' },
    }
    return { score, ...map[score] }
  })

  return strength
}
