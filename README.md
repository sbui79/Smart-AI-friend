# Smart-AI-Friend

AI-powered virtual companion app with deep simulation and creative tools.

## Phase 1: Core Foundation (Ages 15+ MVP)

Single-creature Tamagotchi-style game with basic AI chat.

## How to Play

- **Hatch** an egg on the Home tab and give your friend a name.
- **Care** for it on the Pet tab: Feed, Play, Clean, Pet, Train, and Gift each shift its stats.
- **Stats decay** while it's awake (6am–10pm): hunger 15/hr, happiness 12/hr, energy 10/hr,
  cleanliness 8/hr. Overnight it sleeps, restores energy, and can only be petted.
- **Health** drains while any stat is critical (below 20) and recovers while all stats are healthy.
- **Evolution**: egg (4h) → baby (24h) → child (48h) → teen (72h) → adult, gated on care quality ≥ 70.
- **Neglect**: 96 hours continuously critical and your friend dies.
- **Reminders**: when you leave the app, a notification is scheduled for when your friend will next
  need you, and for when it's ready to evolve.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test
```

## Tech Stack

- React Native + Expo
- TypeScript
- Zustand (state management)
- SQLite (local storage)
- Jest + React Native Testing Library
