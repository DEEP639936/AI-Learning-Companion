# Mentora AI — Deploy to GitHub + Vercel Guide

## 🚀 30-Second Summary

1. Get a **Nvidia DeepSeek API key** (free) → https://build.nvidia.com
2. Push project to **GitHub**
3. Import on **Vercel** → Set env vars → Deploy
4. Done! Your app is live worldwide.

---

## 📋 Step-by-Step: Full Deployment

### Step 1: Get Your AI API Key

#### Option A: Nvidia DeepSeek R1 (RECOMMENDED ✅)
1. Go to **https://build.nvidia.com**
2. Search for **"DeepSeek-R1"**
3. Click **"Get API Key"** (you get 1,000 free credits)
4. Copy the key (starts with `nvapi-...`)

This key works with Nvidia's hosted DeepSeek R1 model — one of the smartest open-source AI models available.

#### Option B: Groq (ALTERNATIVE — faster but slightly less smart)
1. Go to **https://console.groq.com**
2. Sign up → Create API key (starts with `gsk_...`)
3. Free tier: 30 requests/min, 14,400 requests/day

---

### Step 2: Push to GitHub

```bash
cd mentora-ai    # your project folder

# Initialize git (if not already)
git init
git add .
git commit -m "Mentora AI — Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mentora-ai.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy on Vercel

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"New Project"** → Import your `mentora-ai` repo
3. Framework auto-detected: **Next.js** ✅
4. Click **"Environment Variables"** and add:

| Variable | Value | Required? |
|----------|-------|-----------|
| `OPENAI_API_KEY` | `nvapi-your-nvidia-key-here` | ✅ YES |
| `OPENAI_BASE_URL` | `nvidia://` | ✅ YES |
| `OPENAI_MODEL` | `deepseek-ai/deepseek-r1` | ✅ YES |
| `DATABASE_URL` | *(see Step 4 below)* | Optional |

5. Click **"Deploy"** → Wait ~2 minutes
6. Your app is live at `https://mentora-ai.vercel.app` 🎉

---

### Step 4: Database Setup (Optional)

**Without a database**: All 8 AI features work perfectly. The only thing that won't work is the spaced-repetition flashcard review (which requires saving progress to a database).

**With a database (recommended)**:

#### Supabase (Free, recommended)
1. Go to **https://supabase.com** → Create project
2. Copy the **connection string** (under Settings → Database)
3. Update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`
4. Set `DATABASE_URL` in Vercel env vars to the Supabase connection string
5. Run locally: `npx prisma db push`
6. Redeploy on Vercel

---

## 🔧 Supported AI Providers

The app supports ANY OpenAI-compatible API. Just change `OPENAI_BASE_URL` and `OPENAI_MODEL`:

| Provider | OPENAI_BASE_URL | OPENAI_MODEL | Cost | Speed |
|----------|----------------|--------------|------|-------|
| **Nvidia DeepSeek R1** | `nvidia://` | `deepseek-ai/deepseek-r1` | Free credits | Medium |
| **Nvidia DeepSeek V3** | `nvidia://` | `deepseek-ai/deepseek-v3` | Free credits | Fast |
| **Groq Llama 3.3** | `groq://` | `llama-3.3-70b-versatile` | Free tier | ⚡ Very fast |
| **OpenAI GPT-4o Mini** | `openai://` | `gpt-4o-mini` | ~$0.15/1M tokens | Fast |
| **Together AI** | `https://api.together.xyz/v1` | `meta-llama/Llama-3-8b-chat-hf` | Free credits | Fast |

The `nvidia://`, `groq://`, and `openai://` shortcuts are auto-expanded to the full URLs.

---

## 🆚 Nvidia DeepSeek vs Groq — Which Is Better?

### Nvidia DeepSeek R1 ✅ (Recommended for Mentora AI)

| Aspect | Nvidia DeepSeek R1 | Groq (Llama 3.3 70B) |
|--------|-------------------|----------------------|
| **Intelligence** | ⭐⭐⭐⭐⭐ Best reasoning | ⭐⭐⭐⭐ Very good |
| **Speed** | ⭐⭐⭐ Medium (~5-15s) | ⭐⭐⭐⭐⭐ Very fast (~1-3s) |
| **Free tier** | 1,000 credits (~1,000 requests) | 30 req/min, 14,400/day |
| **Study features** | Better explanations, deeper reasoning | Good but less nuanced |
| **Code generation** | Excellent | Good |
| **Cost after free** | ~$0.15/1M tokens | ~$0.59/1M tokens |
| **Best for** | Study apps, explanations, deep reasoning | Real-time chat, quick answers |

### My Recommendation for Mentora AI:

**Use Nvidia DeepSeek R1** because:
1. **Better reasoning** — It's a reasoning model (thinks step-by-step), which is perfect for study explanations, MCQ generation, and code explanations
2. **Better study content** — Creates more educational, detailed explanations
3. **Free credits** — 1,000 free requests to start
4. **Cheaper after free tier** — $0.15/1M tokens vs Groq's $0.59/1M tokens

**Use Groq only if** you need blinding speed (sub-second responses) and don't mind slightly less intelligent responses.

**Pro tip**: You can set up BOTH and switch between them by just changing the env vars!

---

## 📁 Project Structure

```
mentora-ai/
├── src/
│   ├── app/
│   │   ├── api/              # 8 AI feature routes + health check
│   │   │   ├── chat/         # AI Chat (multi-mode)
│   │   │   ├── mcq/          # MCQ Quiz generator
│   │   │   ├── summarize/    # Text/URL summarizer
│   │   │   ├── mindmap/      # Mind map generator
│   │   │   ├── code-explain/ # Code explainer/generator
│   │   │   ├── flashcards/   # Flashcard generator + review
│   │   │   ├── study-planner/# Study plan generator
│   │   │   ├── fetch-url/    # URL content analyzer
│   │   │   └── progress/     # Progress dashboard data
│   │   ├── page.tsx          # Main app (all features in one page)
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Royal Amethyst theme
│   ├── components/
│   │   ├── features/         # 9 feature components
│   │   ├── shared/           # Sidebar, Logo, Auth, etc.
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── ai-client.ts      # ← KEY FILE (auto-detects AI backend)
│   │   ├── db.ts             # Prisma client (optional)
│   │   ├── cors.ts           # CORS utilities
│   │   ├── prompts.ts        # AI system prompts
│   │   └── utils.ts          # Utility functions
│   └── store/
│       └── app-store.ts      # Zustand state management
├── prisma/
│   └── schema.prisma         # Database schema
├── .env.example              # Template for env vars
├── vercel.json               # Vercel deployment config
├── next.config.ts            # Next.js config + CORS
├── DEPLOYMENT.md             # This file
└── package.json
```

---

## ❓ FAQ

**Q: Will it work exactly like it does here?**
A: Yes! All 8 AI features work the same. The only difference is which AI model generates the responses. DeepSeek R1 is actually smarter than the model used on this platform.

**Q: Can I use it for free?**
A: Yes! Nvidia gives 1,000 free credits. Groq has a permanent free tier (14,400 requests/day). The Vercel hosting is also free.

**Q: What if I run out of Nvidia credits?**
A: Switch to Groq by changing env vars in Vercel:
```
OPENAI_API_KEY=gsk_your-groq-key
OPENAI_BASE_URL=groq://
OPENAI_MODEL=llama-3.3-70b-versatile
```

**Q: Can I host on my own server instead of Vercel?**
A: Yes! Clone the repo, set env vars, and run:
```bash
npm install
npx prisma generate
npm run build
npm start
```

**Q: Do I need a database?**
A: No — all 8 AI features work without a database. Only the spaced-repetition flashcard review feature needs a database. If you want it, use Supabase (free).
