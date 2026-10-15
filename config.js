// BUKZ config. Set CA, X and WALLET when live. Everything on the site reads from here.
window.BUKZ = {
  NAME: 'bukz',
  TICKER: '$BUKZ',
  CA: '',                                   // the pump.fun mint, once live
  X: 'https://x.com/',                      // the shop's X account, e.g. https://x.com/bukzshop
  WALLET: '',                               // the shop's SOL wallet, shown on orders once set (optional)
  SITE: 'https://bukz.vercel.app',
  RELEASE: '2026-11-19T00:00:00-05:00',     // the new city opens
  FEE_PCT: 0.95,                            // creator fee share of volume used by the calculator (pump.fun tiers vary)
  SHOP_FEE_PCT: 10,                         // the shop's fee on paid orders, % of the card price
  DROP_CARD: 'heist',                       // the card the shop gifts with fee money
  // the shelf: the official cash card lineup. usd = store price, gta = in-game dollars it gives.
  CARDS: [
    { id: 'pocket', name: 'Pocket',  usd: 2.99,  gta: 100000,  line: 'A tank of gas and a haircut.' },
    { id: 'stack',  name: 'Stack',   usd: 4.99,  gta: 200000,  line: 'A used car, no questions.' },
    { id: 'bag',    name: 'Bag',     usd: 9.99,  gta: 500000,  line: 'An apartment with a view of the chart.' },
    { id: 'duffel', name: 'Duffel',  usd: 19.99, gta: 1250000, line: 'A sports car and the garage for it.' },
    { id: 'vault',  name: 'Vault',   usd: 49.99, gta: 3500000, line: 'A supercar, a penthouse, a helicopter.' },
    { id: 'heist',  name: 'Heist',   usd: 99.99, gta: 8000000, line: 'The yacht. The one the shop gifts with fees.' }
  ],
  PLATFORMS: ['PC', 'PlayStation', 'Xbox']
};
