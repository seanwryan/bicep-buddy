# Bicep Buddy 💪

A Next.js prototype for testing 3 different AI fitness concepts: The Virtual Friend, The Social Glue, and The Gamified Layer.

## Features

### 🧑‍🤝‍🧑 Buddy - The Virtual Friend
1-on-1 chat with customizable AI personas:
- **Hype Man** (Default): Energetic and motivational
- **Stoic Drill Sergeant**: No-nonsense discipline coach
- **Gossipy Bestie**: Friendly and relatable fitness friend

### 👥 Squad - The Social Glue
Simulated 3-person group chat where GymBot moderates and intervenes when excuses are detected, suggesting compromise workout times.

### ⚔️ RPG - The Gamified Layer
Turn workouts into epic battles! Attack "The Sunday Scaries" boss with different exercise types and intensity levels, complete with dramatic battle commentary.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Then add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** (Dark mode aesthetic)
- **Vercel AI SDK** (`ai`, `@ai-sdk/openai`)
- **Lucide React** (Icons)
- **clsx** & **tailwind-merge** (Styling utilities)

## Project Structure

```
app/
  ├── api/
  │   └── chat/
  │       └── route.ts          # Unified AI handler
  ├── buddy/
  │   └── page.tsx              # Virtual Friend feature
  ├── squad/
  │   └── page.tsx              # Social Glue feature
  ├── rpg/
  │   └── page.tsx              # Gamified Layer feature
  ├── layout.tsx                # App shell with bottom nav
  └── page.tsx                  # Redirects to /buddy

components/
  └── BottomNav.tsx             # Bottom navigation bar
```

## Design

- **Mobile-first** responsive design
- **Dark mode** aesthetic (black/dark gray backgrounds, neon accents)
- **Bottom navigation** for easy mode switching
- Large, tappable inputs optimized for mobile
