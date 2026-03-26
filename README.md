# Smart Bookmark App

A modern bookmark manager built with Next.js 15, Supabase, and Tailwind CSS. Features include Google OAuth authentication, real-time sync across tabs, and private bookmark storage enforced at the database level.

## 🚀 Live Demo

[View Live Demo](https://smart-bookmark-app.vercel.app/)

## ✨ Features

- **Google OAuth Login** - Seamless authentication with Google
- **Private Bookmarks** - Your bookmarks are private to you only, enforced at database level
- **Real-Time Sync** - Changes appear instantly across multiple tabs
- **Add Bookmarks** - Clean form with URL validation
- **Delete Bookmarks** - With confirmation dialog to prevent accidents
- **Tags Support (Bonus Feature)** - Organize bookmarks with tags for better categorization
- **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- **Dark Mode Support** - Automatic dark mode based on system preference

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Realtime**: Supabase Realtime subscriptions
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy and run the SQL from `supabase/schema.sql` to create the bookmarks table and set up RLS
4. Navigate to **Authentication → Providers** and enable Google OAuth
5. Add your OAuth credentials (get these from [Google Cloud Console](https://console.cloud.google.com))
6. Set the Authorized Redirect URI to: `https://your-project.vercel.app/auth/callback`

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **API**.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 How Supabase Auth and RLS Work

### Authentication Flow

The app uses Supabase Auth with Google OAuth:

1. User clicks "Sign in with Google" → Redirected to Google's OAuth consent screen
2. User approves → Redirected back to `/auth/callback` with authorization code
3. The callback exchanges the code for a session
4. Session is stored in secure HTTP-only cookies
5. Middleware checks session on protected routes

### Row Level Security (RLS) Policies

RLS is enabled on the `bookmarks` table to ensure privacy at the database level. Here's why each policy is correct:

| Policy | Purpose | Why It's Correct |
|--------|---------|------------------|
| `Users can view their own bookmarks` | Allows users to SELECT only their rows | Uses `auth.uid() = user_id` which guarantees the current authenticated user owns the bookmark |
| `Users can insert their own bookmarks` | Allows users to INSERT with their user_id | The `WITH CHECK` clause validates that `user_id` matches `auth.uid()` |
| `Users can update their own bookmarks` | Allows users to UPDATE only their rows | Both `USING` and `WITH CHECK` ensure ownership is maintained |
| `Users can delete their own bookmarks` | Allows users to DELETE only their rows | The `USING` clause checks ownership before deletion |

**Why RLS is important**: Even if a malicious user manipulated the frontend to send requests with different user IDs, the database would reject them. The security is enforced at the data layer, not the application layer.

### Cascade Deletion

The table includes `ON DELETE CASCADE` on the `user_id` foreign key. This means:
- When a user account is deleted, all their bookmarks are automatically deleted
- This prevents orphaned records and keeps the database clean

## 🔄 Real-Time Sync Implementation

### Supabase Realtime Features Used

The app uses Supabase Realtime subscriptions to sync changes across tabs:

```typescript
const channel = supabase
  .channel('bookmarks_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookmarks'
  }, (payload) => {
    // Handle INSERT, UPDATE, DELETE events
  })
  .subscribe()
```

### Subscription Cleanup

Subscriptions are properly cleaned up in the useEffect cleanup function:

```typescript
return () => {
  supabase.removeChannel(channel)
}
```

This prevents memory leaks and duplicate subscriptions when components unmount.

### Realtime Enablement

The `bookmarks` table is added to the `supabase_realtime` publication in the SQL schema:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
```

This allows PostgreSQL's logical replication to stream changes to connected clients.

## 🏷️ Bonus Feature: Tags/Categorize Bookmarks

I chose to implement **Tags** as the bonus feature because:

1. **Product Value**: As bookmark collections grow, organization becomes critical. Tags allow users to categorize bookmarks meaningfully without rigid folder structures
2. **Flexible Filtering**: Users can add multiple tags to a single bookmark (e.g., "work", "important", "tutorial")
3. **Scalable**: Unlike nested folders, a flat tagging system works well for any collection size
4. **Quick Implementation**: It's a small UI change that provides significant UX value

### Implementation Details

- Tags are stored as a PostgreSQL text array (`TEXT[]`)
- Users can enter comma-separated tags in the bookmark form
- Tags are displayed as colorful badges on each bookmark
- Future enhancement: Filter bookmarks by clicking tags

## 🐛 Problems Encountered and Solutions

### Problem 1: Next.js 15 Auth Helper Issues

**Issue**: The latest `@supabase/auth-helpers-nextjs` had compatibility issues with Next.js 15's App Router.

**Solution**: Used the raw `@supabase/supabase-js` client with cookie-based session management for server components and the standard client for client components.

### Problem 2: Realtime Subscription Memory Leaks

**Issue**: Subscriptions weren't being cleaned up, causing multiple subscriptions on hot reload.

**Solution**: Implemented proper cleanup in the useEffect return function to remove channels when components unmount.

### Problem 3: TypeScript Types for Supabase

**Issue**: TypeScript didn't know the shape of our database tables.

**Solution**: Created manual TypeScript types in `types/database.ts` matching our SQL schema. For larger projects, I'd use the Supabase CLI to auto-generate types.

### Problem 4: Delete Confirmation UX

**Issue**: Users could accidentally delete bookmarks with a single click.

**Solution**: Added a modal dialog that requires explicit confirmation before deletion, with a preview of what will be deleted.

## 🚀 Deployment to Vercel

The app is deployed to Vercel with automatic deployments from the main branch:

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Update the Google OAuth redirect URI in Supabase to the Vercel URL
4. Deploy!

## 🔮 Future Improvements

If I had more time, I would add:

1. **Tag Filtering** - Click on a tag to filter bookmarks by that tag
2. **Search** - Full-text search across bookmark titles and URLs
3. **Edit Bookmarks** - Ability to modify bookmark titles and tags
4. **Import/Export** - Import bookmarks from browser, export to JSON/HTML
5. **Favicon Display** - Show website favicons next to bookmarks
6. **Bookmark Groups/Folders** - Hierarchical organization beyond tags
7. **Analytics** - View most frequently clicked bookmarks
8. **Shareable Collections** - Create curated lists to share with others

## 📄 License

MIT

## 🙏 Acknowledgments

Built as a take-home assessment for [ABSTRABIT](https://abstrabit.com).
