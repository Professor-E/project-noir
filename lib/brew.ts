export type BrewMethod = {
  id: string
  name: string
  dose: string
  ratio: string
  time: string
  steps: { at: string; text: string }[]
}

export const BREW_METHODS: BrewMethod[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    dose: '18g',
    ratio: '1:2',
    time: '28s',
    steps: [
      { at: '0:00', text: 'Distribute and tamp level. No channels, no shortcuts.' },
      { at: '0:06', text: 'First drops should fall dark and slow, like honey off a spoon.' },
      { at: '0:28', text: 'Cut at 36g out. The crema should hold a spoon mark for three seconds.' },
    ],
  },
  {
    id: 'pour-over',
    name: 'Pour Over',
    dose: '22g',
    ratio: '1:16',
    time: '3:15',
    steps: [
      { at: '0:00', text: 'Bloom with 60g of water at 94°C. Swirl once, then wait.' },
      { at: '0:45', text: 'Pour in slow concentric circles to 200g. Keep the bed flat.' },
      { at: '1:45', text: 'Final pour to 352g. Let the bed draw down undisturbed.' },
      { at: '3:15', text: 'Drawdown complete. The bed should be level, not cratered.' },
    ],
  },
  {
    id: 'french-press',
    name: 'French Press',
    dose: '30g',
    ratio: '1:15',
    time: '8:00',
    steps: [
      { at: '0:00', text: 'Coarse grind. Add all 450g of water at 96°C in one pour.' },
      { at: '4:00', text: 'Break the crust and skim the foam away with two spoons.' },
      { at: '8:00', text: 'Press slowly to just below the surface. Decant immediately.' },
    ],
  },
]
