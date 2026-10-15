// BUKZ config. Set CA when live. Everything on the site reads from here.
window.BUKZ = {
  NAME: 'bukz',
  TICKER: '$BUKZ',
  CA: '',                                   // the pump.fun mint, once live
  X: 'https://x.com/',                      // the shop's X account
  SITE: 'https://bukz.vercel.app',
  RELEASE: '2026-11-19T00:00:00-05:00',     // the new city opens
  FEE_PCT: 0.95,                            // creator fee share of volume used by the calculator (pump.fun tiers vary)
  GTA_PER_USD: 80000,                       // the best official cash-card rate, GTA$ per US dollar
  // the showroom. prices are in-game dollars, in the order the shop buys them.
  ITEMS: [
    { id: 'sports',   tier: 'Vehicle',  name: 'Sports car',          gta: 900000,   note: 'The first thing on the lot. Fast enough.' },
    { id: 'garage',   tier: 'Property', name: '10-car garage',       gta: 1100000,  note: 'Somewhere to keep what the fees buy.' },
    { id: 'super',    tier: 'Vehicle',  name: 'Supercar',            gta: 2100000,  note: 'The centrepiece of the showroom.' },
    { id: 'pent',     tier: 'Property', name: 'Penthouse',           gta: 1500000,  note: 'For the view. And the receipts on the wall.' },
    { id: 'heli',     tier: 'Aircraft', name: 'Helicopter',          gta: 1800000,  note: 'Over the traffic.' },
    { id: 'club',     tier: 'Business', name: 'Nightclub',           gta: 1700000,  note: 'The shop needs a front.' },
    { id: 'jet',      tier: 'Aircraft', name: 'Private jet',         gta: 1600000,  note: 'In and out of the new city.' },
    { id: 'classic',  tier: 'Vehicle',  name: 'Classic convertible', gta: 1200000,  note: 'For the sunset drive.' },
    { id: 'arcade',   tier: 'Business', name: 'Arcade',              gta: 2500000,  note: 'Where the heists get planned.' },
    { id: 'yacht',    tier: 'Vessel',   name: 'Yacht',               gta: 8000000,  note: 'The big one. Parked where everyone can see it.' },
    { id: 'hyper',    tier: 'Vehicle',  name: 'Hypercar',            gta: 3000000,  note: 'Faster than the chart.' },
    { id: 'lot',      tier: 'Milestone', name: 'A full showroom',    gta: 20000000, note: 'Ten cars, one wall of receipts.' }
  ]
};
