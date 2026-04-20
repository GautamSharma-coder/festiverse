# Festiverse26

The official frontend web application for Festiverse26. Built with React and Vite, this platform provides a modern, fast, and interactive experience for fest attendees.

## Features

- **Dynamic Landing Page**: Interactive hero section featuring event details and dynamic pricing.
- **Societies Directory**: Discover college societies (e.g., Udaan) and their events.
- **Event Management**: Secure Admin Panel for event managers to handle tickets, users, and edit site details.
- **Responsive UI**: A fully mobile-friendly design utilizing modern navigation menus, seamless footers, and crisp grid layouts.
- **Fast Performance**: Next-generation frontend tooling with Vite + React 19.

## Technologies Used

- **Core**: [React v19](https://react.dev/), [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [GSAP](https://gsap.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Other Utils**: `html5-qrcode`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18+ recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:

   ```bash
   cd fesstiverse
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (ensure API URL targets your backend):

   ```bash
   cp .env.example .env
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts the local dev server.
- `npm run build`: Bundles the application into static files for production.
- `npm run lint`: Analyzes code for stylistic errors or bugs.
- `npm run preview`: Previews the bundled output locally before deployment.

## Project Structure

- `src/components/` - Main site components (Hero, Footer, Team, Contact).
- `src/admin/` - Dashboard components for backend data management.
- `src/lib/` - Shared utilities and API helper functions.
