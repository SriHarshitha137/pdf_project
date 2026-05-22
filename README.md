# PDFKit Pro

A full-featured PDF tools web app built with **Next.js 15 (App Router)** and TypeScript. Includes 12 PDF utilities, drag-and-drop file upload, processing simulation, pricing, and an about page.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Plain CSS (custom properties, no Tailwind)
- **Fonts:** Syne (display) + DM Sans (body) via Google Fonts

---

## Project Structure

```
pdfkit-pro/
├── app/
│   ├── layout.tsx              # Root layout — wraps all pages with Navbar + Footer
│   ├── globals.css             # All global styles (CSS variables, components)
│   ├── page.tsx                # Home — hero, stats, tool grid, features, CTA
│   ├── pricing/
│   │   └── page.tsx            # Pricing — 3-tier plan cards
│   ├── about/
│   │   └── page.tsx            # About — mission, privacy, team blurbs
│   └── tools/[toolId]/
│       ├── layout.tsx          # Dynamic per-tool metadata
│       └── page.tsx            # Tool page — dropzone, options, progress, result
├── components/
│   ├── Icon.tsx                # SVG icon wrapper (supports path arrays)
│   ├── Navbar.tsx              # Sticky nav with tools mega-dropdown
│   ├── Footer.tsx              # Footer with tool links and company columns
│   └── ToolCard.tsx            # Card used in the home page tools grid
└── lib/
    └── data.ts                 # All shared data: tools, icons, categories, plans
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build
npm start
```

---

## Pages & Routes

| Route              | Description                              |
|--------------------|------------------------------------------|
| `/`                | Home — hero, search, tool grid, features |
| `/pricing`         | Pricing — Free / Pro / Team plans        |
| `/about`           | About — mission and privacy info         |
| `/tools/merge`     | Merge PDF tool                           |
| `/tools/split`     | Split PDF tool                           |
| `/tools/compress`  | Compress PDF tool                        |
| `/tools/pdf2jpg`   | PDF to JPG converter                     |
| `/tools/jpg2pdf`   | JPG to PDF converter                     |
| `/tools/rotate`    | Rotate PDF tool                          |
| `/tools/watermark` | Watermark PDF tool                       |
| `/tools/unlock`    | Unlock PDF tool                          |
| `/tools/protect`   | Protect PDF tool                         |
| `/tools/organize`  | Organize PDF pages                       |
| `/tools/ocr`       | OCR PDF tool                             |
| `/tools/ai`        | AI Summarize PDF tool                    |

---

## Adding a New Tool

1. Add an entry to the `tools` array in `lib/data.ts`
2. Add its icon paths to the `icons` object in `lib/data.ts`
3. Add a config entry in `toolConfigs` inside `app/tools/[toolId]/page.tsx`

That's it — the dynamic route and sidebar options will pick it up automatically.

---

## Connecting Real PDF Processing

All tools currently simulate processing with a progress animation. To wire up real backends:

- Replace `startProcessing()` in `app/tools/[toolId]/page.tsx` with a `fetch`/`FormData` POST to your API
- Update the result state to show the actual returned file URL
- Recommended libraries: `pdf-lib` (client-side), `ilovepdf API`, `pdfcpu`, or a custom Node.js backend

---

## Deploy on Vercel

```bash
npm i -g vercel
vercel
```

Or push to GitHub and import at [vercel.com/new](https://vercel.com/new).
