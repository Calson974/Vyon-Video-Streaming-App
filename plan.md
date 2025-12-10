```markdown
# Video Streaming Platform - Project Plan

## Project Name: Vyon

## Overview
This document outlines the planning phase for a video streaming platform built during a 3-day live coding session. The platform draws inspiration from YouTube but focuses on core MVP features that can be realistically implemented in the given timeframe.

## Core Features

### 1. Authentication System
- User signup and login (combined page)
- Unique user ID for each account
- Per-user video storage and management tied to user ID

### 2. Video Feed (Homepage)
- Display list of videos with thumbnails
- Basic video metadata: title, description, category, view count, upload date
- Search functionality in header/navbar

### 3. Upload & Manage Videos
- Upload videos with title, description, category
- Edit video details
- Delete videos
- View analytics for own videos
- Manage page/dashboard for authenticated users only

### 4. Video Watch Page
- Expanded video player view (watch/details page)
- Display full video with metadata
- Basic interactions (likes, comments - authenticated only)

### 5. User Interactions
- Likes (with like count display)
- Comments (with comment count display)
- Subscribe/follow (tentative - time permitting)
- Interactions restricted for unauthenticated users

### 6. Analytics & Tracking
- Basic analytics per video (views, watch time)
- Watch time tracking (intervals: 30s, 1min, 5min)
- Track "started watching" timestamps
- User-specific watch records in database
- Policy: No watch time tracking for unauthenticated users

## Pages Structure
```
Homepage (Feed) → Watch Page → Manage Page → Auth Page (Login/Signup)
```

- **Homepage**: Feed + Header (search, nav: Manage/Login)
- **Watch Page**: Full video player + interactions
- **Manage Page**: Upload/edit/delete own videos + analytics
- **Auth Page**: Login/Signup (2-in-1)

## User Flows

### Unauthenticated User
```
Homepage → Watch videos (no tracking) → Cannot like/comment
         ↓
       Login → Authenticated User
```

### Authenticated User
```
Homepage → Watch (tracked) → Interact (like/comment) → Manage videos
         ↓
      Logout → Unauthenticated
```

## Technical Stack (Day 1 Decisions)
- **Framework**: Vite + Vanilla JavaScript
- **Styling**: Tailwind CSS
- **Project Structure**: Standard Vite setup (src/, public/, pages/)

## Next Steps
- Day 2: Implement authentication + basic pages
- Day 3: Video upload/management + watch tracking
- Post-build: Group projects with custom UIs