export type Grind = 'Whole Bean' | 'Espresso' | 'Filter' | 'French Press'
export type Weight = '250g' | '1kg'

export type CartLine = {
  slug: string
  name: string
  price: number
  qty: number
  grind: Grind
  weight: Weight
  subscribe: boolean
}

const WEIGHT_MULTIPLIER: Record<Weight, number> = { '250g': 1, '1kg': 3.4 }
const SUBSCRIPTION_DISCOUNT = 0.9

export function lineKey(line: CartLine): string {
  return `${line.slug}|${line.grind}|${line.weight}|${line.subscribe ? 'sub' : 'once'}`
}

export function linePrice(line: CartLine): number {
  const unit =
    line.price * WEIGHT_MULTIPLIER[line.weight] * (line.subscribe ? SUBSCRIPTION_DISCOUNT : 1)
  return unit * line.qty
}

export function subtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + linePrice(line), 0)
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`
}
