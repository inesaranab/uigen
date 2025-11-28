# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language via a chat interface, Claude AI generates working React components, and they render in real-time in a sandboxed iframe.

Key characteristics:
- Dual-panel UI: chat on left, live preview/code editor on right
- Virtual file system (in-memory, no disk writes)
- Anonymous users can prototype; registered users can persist projects
- Works with or without Anthropic API key (falls back to mock provider)

## Commands

```bash
npm run setup          # Install deps, generate Prisma client, run migrations
npm run dev            # Start dev server (Turbopack) on port 3000
npm run build          # Production build
npm test               # Run Vitest test suite
npm run lint           # Run ESLint
npm run db:reset       # Reset database (force migration reset)
```

## Environment Variables

```
ANTHROPIC_API_KEY=...  # Optional; app uses mock provider if not set
JWT_SECRET=...         # For session tokens (has dev default)
```

## Architecture

### Data Flow

```
User Chat Input
    ↓
ChatProvider (Vercel AI SDK)
    ↓
/api/chat route (streamText + tools)
    ↓
Claude AI (claude-haiku-4-5)
    ↓
Tool Calls (str_replace_editor, file_manager)
    ↓
VirtualFileSystem (in-memory)
    ↓
FileSystemProvider (React Context)
    ↓
PreviewFrame (Babel transform + import map → sandboxed iframe)
```

### Key Modules

**Virtual File System** (`src/lib/file-system.ts`):
- In-memory file tree with CRUD operations
- Serializes to JSON for database persistence
- Entry point is always `/App.jsx`

**AI Integration** (`src/lib/provider.ts`, `src/app/api/chat/route.ts`):
- Uses Vercel AI SDK with Anthropic provider
- MockLanguageModel for fallback when no API key
- Tools: `str_replace_editor` (file operations), `file_manager` (rename/delete)

**Code Transformation** (`src/lib/transform/jsx-transformer.ts`):
- Babel transpilation for JSX/TypeScript
- Dynamic import map generation using esm.sh CDN
- CSS import extraction

**Authentication** (`src/lib/auth.ts`, `src/actions/index.ts`):
- JWT in httpOnly cookies (7-day expiry)
- bcrypt password hashing
- Middleware protects `/api/projects`, `/api/filesystem`

**State Management**:
- `src/lib/contexts/chat-context.tsx`: Chat messages and input
- `src/lib/contexts/file-system-context.tsx`: Virtual file operations

### Database (Prisma + SQLite)

Two models: `User` (id, email, password, projects) and `Project` (id, name, userId, messages JSON, data JSON for VFS state)

## Testing

Tests use Vitest with jsdom environment. Test files are in `__tests__/` directories alongside source:
- `src/components/chat/__tests__/`
- `src/components/editor/__tests__/`
- `src/lib/__tests__/`
- `src/lib/contexts/__tests__/`
- `src/lib/transform/__tests__/`

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Radix UI + shadcn/ui components
- Monaco Editor for code editing
- Vercel AI SDK + Anthropic Claude
- Prisma ORM + SQLite
- Use comments sparingly. Only comment complex code.
- The database schema is defined in @prisma\schema.prisma file. Reference it anytime you need the structure of data stored in the database.