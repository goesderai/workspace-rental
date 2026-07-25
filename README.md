# Plan your workspace — monis.rent

An interactive workspace planner for [monis.rent](https://www.monis.rent), who rent office
equipment by the week to people working out of Bali. You draw up a desk setup on an isometric
plan, pick how long you need it, and rent it.

**Live:** <https://workspace-rental-zeta.vercel.app>

Try a shared setup:
[a three-monitor desk in Canggu](https://workspace-rental-zeta.vercel.app/?s=d:desk-electrical_mc:monitor-27_ml:monitor-24_mr:monitor-24_c:chair-ergonomic_s:keyboard-mx_dl:desk-lamp_dr:mug_fl:plant-monstera_r:rug-jute&t=12)

## What it does

- Pick one of two adjustable desks; everything else positions itself relative to whichever
  desk you chose.
- Add displays, desk kit, lighting, greenery, a rug, and the Bali extras monis.rent really
  rents alongside the office gear — a scooter, a surfboard, an espresso machine.
- The plan updates as you go, either by clicking a catalog card or dragging it onto a slot.
- Hovering anything draws an architect's callout naming it, its real dimensions in
  centimetres, and its weekly rate.
- Choose a rental term. Longer terms lower the weekly rate, and the running total, deposit
  and delivery date follow.
- Review the setup and place a (mock) order.

## Two decisions worth calling out

**It is priced as a rental, not a shop.** monis.rent charges by the week, so the week is the
unit everywhere, and committing to a longer term lowers the rate. The brief's sketch showed
no pricing at all; without a term and a deposit the tool reads as a toy configurator rather
than something you would actually book.

**Every setup is a URL.** The whole plan encodes into a readable query string, so any setup
can be copied, sent, and reopened exactly. The page reads it on the server, so a shared link
paints its setup on the first frame instead of flashing an empty room. Checkout reads the
same payload, which is why it holds no client state of its own.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 37 unit tests
npm run build
```

`/art` is a reference sheet that draws every asset on the same 20cm grid. It exists because
drift in camera angle, stroke weight or light direction between assets is invisible one at a
time and obvious side by side — it caught several problems during the build.

## How it fits together

```
src/lib/iso.ts        isometric projection in centimetres, one global light direction
src/lib/slots.ts      named anchors, derived from the active desk's footprint
src/lib/state.ts      reducer over slot -> item id
src/lib/pricing.ts    weekly rate, term discount, deposit, delivery date
src/lib/urlState.ts   setup <-> query string
src/data/catalog.ts   the rentable items
src/components/items/ the artwork, all drawn through shared primitives
```

The logic that matters is plain functions with no React in sight, which is what the tests
cover. The artwork is hand-authored inline SVG rather than product photography: monis.rent's
catalog shots are lit and angled individually, so they composite into a collage rather than a
scene, and SVG keeps every item on one grid under one light.

Anchors are computed from the chosen desk rather than fixed, so swapping a 140cm desk for a
180cm one carries the monitors, lamp and keyboard with it instead of leaving them floating.

## Honest notes

- **Prices.** Where monis.rent publishes a weekly rate, it is used exactly — the $5 electric
  desk, $6 ergonomic chair, $6 24" monitor and $13 27" 4K monitor that they advertise together
  as a $24/week setup. Everything else is marked `estimated` in `catalog.ts` and priced in line
  with those. A test pins the published rates so they cannot drift silently.
- **Ordering is a mock.** `POST /api/rent` recomputes the quote server-side and returns a
  reference. There is no payment, and nothing is stored.
- **Mobile layout** is built mobile-first and has no horizontal overflow, but the development
  environment could not open a true phone-width viewport, so it is worth a look on a real
  device before this goes in front of anyone.

## Deployment

Deployed on Vercel:

```bash
npx vercel --prod
```
