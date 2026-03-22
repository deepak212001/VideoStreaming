# YouTube Clone - React Layout

A responsive YouTube-like layout built with React.js featuring a top navigation bar, collapsible sidebar, horizontal filter bar, and a dynamic video grid.

## Features

- **Navbar**: Logo on left, search bar in center (hidden on mobile), profile/avatar on right
- **Collapsible Sidebar**: Home, Explore, Subscriptions, Library, History, Playlists, Watch Later
- **Filter Bar**: Horizontal scrollable category chips (All, Music, Podcasts, etc.)
- **Video Grid**: Responsive grid of video cards with thumbnails, titles, channel info, views, and dates
- **Hover Effects**: Video cards show a description tooltip on hover; thumbnails scale slightly; three-dot menu appears
- **Responsive Design**: Desktop (multi-column grid), tablet, and mobile (single column) layouts

## Tech Stack

- React 19
- Vite 8
- Plain CSS (no framework)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx      # Top navigation bar
│   ├── Navbar.css
│   ├── Sidebar.jsx     # Collapsible sidebar
│   ├── Sidebar.css
│   ├── FilterBar.jsx   # Category filter chips
│   ├── FilterBar.css
│   ├── VideoCard.jsx   # Video card with hover tooltip
│   └── VideoCard.css
├── data/
│   └── videos.js      # Dummy video data
├── hooks/
│   └── useMediaQuery.js
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Dummy Data

The `VIDEOS_DATA` array in `src/data/videos.js` contains sample videos. Each video object includes:

- `id`, `title`, `thumbnail`, `channelName`, `channelAvatar`
- `views`, `uploadDate`, `duration`, `description`, `verified`

Edit this file to add or modify videos.
