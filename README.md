# StudyFlow - Frontend Application

A comprehensive collaborative learning platform built with React, TypeScript, and modern web technologies. StudyFlow enables students to create study teams, share resources, take quizzes, track progress, and communicate in real-time through text and voice calls.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Generation](#api-generation)
- [Design System](#design-system)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)

## 🎯 Project Overview

StudyFlow is a modern, feature-rich frontend application designed to facilitate collaborative learning. It provides students with tools to organize study sessions, share educational resources, take quizzes, track their learning progress, and communicate with peers through real-time messaging and voice calls.

**Key Capabilities:**
- 👥 Team-based study groups with member management
- 📚 Resource sharing and collaborative learning
- 📝 Quiz creation, solving, and history tracking
- 📊 Progress tracking and statistics
- 💬 Real-time messaging via WebSockets
- 🎙️ Voice calling with WebRTC
- 👫 Friend system for networking
- 🎨 Dark/Light theme support
- 🔐 JWT-based authentication

## 🛠️ Tech Stack

### Core Technologies
- **React 19.1.1** - Modern UI library with latest features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.1.7** - Fast build tool and development server
- **React Router DOM 7.9.4** - Client-side routing

### State Management & Data Fetching
- **Zustand 5.0.8** - Lightweight state management
- **TanStack React Query 5.90.5** - Server state management and caching
- **Axios 1.13.1** - HTTP client

### UI & Styling
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **Shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **next-themes** - Theme management (dark/light mode)

### Real-time Communication
- **WebSockets** - Real-time messaging
- **WebRTC** - Voice calling functionality

### Form Management & Validation
- **React Hook Form 7.66.0** - Form state management
- **Zod 4.1.12** - Schema validation

### Developer Tools
- **ESLint** - Code linting
- **OpenAPI Generator** - API client generation from Swagger
- **TypeScript ESLint** - TypeScript-specific linting rules

## 🏗️ Architecture

### Architectural Patterns

#### 1. **Component-Based Architecture**
The application follows React's component-based architecture with a clear separation between:
- **UI Components** (`/components/ui`) - Reusable, presentational components
- **Feature Components** (`/components/teamComponents`) - Business logic components
- **Page Components** (`/pages`) - Route-level components

#### 2. **State Management Strategy**
```
┌─────────────────────────────────────────────────┐
│           Application State Layer               │
├─────────────────────────────────────────────────┤
│  Zustand Stores (Client State)                  │
│  ├── useAuthStore - Authentication & user data  │
│  ├── useTeamStore - Team state                  │
│  ├── useFriendStore - Friends data              │
│  ├── useVoiceStore - Voice call state           │
│  └── useStatisticsStore - User statistics       │
├─────────────────────────────────────────────────┤
│  React Query (Server State)                     │
│  ├── Queries - Data fetching & caching          │
│  ├── Mutations - Data updates                   │
│  └── Invalidation - Cache management            │
└─────────────────────────────────────────────────┘
```

#### 3. **Routing Architecture**
```
┌──────────────────────────────────────────┐
│          Application Router              │
├──────────────────────────────────────────┤
│  Public Routes (AuthRoutes wrapper)      │
│  ├── /login                              │
│  └── /signup                             │
├──────────────────────────────────────────┤
│  Private Routes (PrivateRoutes wrapper)  │
│  ├── /home                               │
│  ├── /study-teams                        │
│  ├── /teams/:teamId                      │
│  ├── /friends                            │
│  ├── /shared-resources                   │
│  ├── /statistics                         │
│  ├── /settings                           │
│  └── /private-call/:roomId               │
└──────────────────────────────────────────┘
```

**Route Protection:**
- `AuthRoutes` - Redirects authenticated users away from login/signup
- `PrivateRoutes` - Protects routes requiring authentication via JWT validation
- Token validation using `TolenValidator.tsx`

#### 4. **Service Layer Architecture**
```
┌────────────────────────────────────────────────┐
│              Services Layer                    │
├────────────────────────────────────────────────┤
│  API Client (/services/react-query)            │
│  ├── api.ts - Axios instance with interceptors│
│  ├── auth.ts - Authentication endpoints        │
│  ├── teams.ts - Team management                │
│  ├── quiz.ts - Quiz operations                 │
│  ├── messages.ts - Messaging                   │
│  ├── friend.ts - Friend management             │
│  ├── user.ts - User operations                 │
│  ├── voice.ts - Voice call setup               │
│  └── events.ts - Event management              │
├────────────────────────────────────────────────┤
│  WebSocket Services (/services/websockets)     │
│  └── messagesWS.ts - Real-time messaging       │
├────────────────────────────────────────────────┤
│  Voice Services (/services/voice)              │
│  └── audioUtils.ts - WebRTC audio handling     │
└────────────────────────────────────────────────┘
```

**API Communication:**
- OpenAPI-generated TypeScript client for type-safe API calls
- Axios interceptors for automatic JWT token injection
- Centralized error handling and response transformation

#### 5. **Real-time Communication Architecture**
```
┌─────────────────────────────────────────┐
│     Real-time Features                  │
├─────────────────────────────────────────┤
│  WebSocket Layer                        │
│  └── Messages - Team chat               │
├─────────────────────────────────────────┤
│  WebRTC Layer                           │
│  ├── Voice signaling                    │
│  ├── Peer connection management         │
│  └── Audio stream handling              │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```
ProiectColectivFrontEnd/
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images, logos, icons
│   │   ├── logo-clean.png
│   │   ├── logo.png
│   │   └── home.png
│   │
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (25+ UI components)
│   │   │
│   │   ├── teamComponents/      # Team-specific components
│   │   │   ├── NavBar.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── CreateTeamForm.tsx
│   │   │   ├── SearchTeamForm.tsx
│   │   │   ├── CallNotifier.tsx
│   │   │   └── teamProps.ts
│   │   │
│   │   └── theme-provider.tsx   # Theme context provider
│   │
│   ├── pages/                   # Route components
│   │   ├── private/             # Protected routes
│   │   │   ├── HomePage/        # Dashboard
│   │   │   ├── Teams/           # Team management
│   │   │   │   ├── StudyTeams.tsx
│   │   │   │   ├── TeamPage.tsx
│   │   │   │   └── TeamPageComponents/
│   │   │   │       ├── CreateQuiz.tsx
│   │   │   │       ├── SolveQuiz.tsx
│   │   │   │       ├── QuizHistory.tsx
│   │   │   │       ├── QuizAttemptView.tsx
│   │   │   │       └── CreateEvent.tsx
│   │   │   ├── Friends/         # Friend management
│   │   │   ├── AddFriends/      # Friend discovery
│   │   │   ├── SharedResources/ # Resource sharing
│   │   │   ├── TrackProgress/   # Statistics & analytics
│   │   │   ├── Settings/        # User settings
│   │   │   ├── EditAccountInfo/ # Profile editing
│   │   │   └── Calls/           # Voice calling
│   │   │       └── PrivateCallPage.tsx
│   │   │
│   │   └── public/              # Public routes
│   │       ├── login/
│   │       │   └── Login.tsx
│   │       └── signup/
│   │           └── Signup.tsx
│   │
│   ├── services/                # Business logic & API
│   │   ├── react-query/         # API integration layer
│   │   │   ├── api.ts           # Axios instance & config
│   │   │   ├── auth.ts          # Authentication hooks
│   │   │   ├── teams.ts         # Team API hooks
│   │   │   ├── teamsRequests.ts # Team request hooks
│   │   │   ├── quiz.ts          # Quiz API hooks
│   │   │   ├── messages.ts      # Messaging hooks
│   │   │   ├── friend.ts        # Friend API hooks
│   │   │   ├── user.ts          # User API hooks
│   │   │   ├── events.ts        # Event API hooks
│   │   │   ├── voice.ts         # Voice call hooks
│   │   │   ├── voiceSignaling.ts    # WebRTC signaling
│   │   │   ├── voicePcManager.ts    # Peer connections
│   │   │   ├── voiceHelpers.ts      # Voice utilities
│   │   │   └── audioUtils.ts        # Audio processing
│   │   │
│   │   ├── stores/              # Zustand state stores
│   │   │   ├── useAuthStore.ts      # Auth state
│   │   │   ├── useTeamStore.ts      # Team state
│   │   │   ├── useFriendStore.ts    # Friends state
│   │   │   ├── useVoiceStore.ts     # Voice call state
│   │   │   └── useStatisticsStore.ts # Stats state
│   │   │
│   │   ├── websockets/          # WebSocket connections
│   │   │   └── messagesWS.ts    # Real-time messaging
│   │   │
│   │   └── voice/               # Voice communication
│   │       └── audioUtils.ts    # Audio handling
│   │
│   ├── utils/                   # Utility functions
│   │   ├── PrivateRoutes.tsx    # Auth route wrapper
│   │   ├── AuthRoutes.tsx       # Public route wrapper
│   │   └── TolenValidator.tsx   # JWT validation
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── use-mobile.ts        # Mobile detection
│   │
│   ├── lib/                     # Utility libraries
│   │   └── utils.ts             # Helper functions
│   │
│   ├── App.tsx                  # Root component & routing
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles
│   └── App.css                  # App-specific styles
│
├── api/                         # Generated API client (git-ignored)
├── components.json              # Shadcn/ui configuration
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript base config
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── eslint.config.js            # ESLint configuration
├── package.json                # Dependencies & scripts
└── README.md                   # This file
```

### Directory Responsibilities

#### `/components`
- **`/ui`** - Atomic, reusable UI components from Shadcn/ui (buttons, inputs, dialogs, etc.)
- **`/teamComponents`** - Team-specific composite components
- **`theme-provider.tsx`** - Application-wide theme management

#### `/pages`
- **`/private`** - Authenticated user pages (requires login)
- **`/public`** - Public access pages (login, signup)

#### `/services`
- **`/react-query`** - React Query hooks for API operations (queries, mutations)
- **`/stores`** - Zustand stores for client-side state management
- **`/websockets`** - WebSocket connection handlers
- **`/voice`** - WebRTC voice communication logic

#### `/utils`
- Route protection wrappers and authentication utilities

## ✨ Key Features

### 1. **Authentication & Authorization**
- JWT-based authentication
- Secure token storage in localStorage
- Automatic token refresh via Axios interceptors
- Protected routes with automatic redirect

### 2. **Study Teams**
- Create and join study teams
- Team-based resource organization
- Member management and permissions
- Team discovery and search

### 3. **Quiz System**
- Create custom quizzes for teams
- Take quizzes with timed responses
- View quiz history and results
- Track attempt scores and statistics

### 4. **Real-time Communication**
- WebSocket-based instant messaging
- Team chat channels
- Message persistence and history
- Online/offline status

### 5. **Voice Calling**
- WebRTC peer-to-peer voice calls
- Private call rooms
- Call notifications
- Audio stream management

### 6. **Resource Sharing**
- Upload and share study materials
- Organize resources by team
- Download shared resources

### 7. **Progress Tracking**
- Personal statistics dashboard
- Quiz performance analytics
- Study time tracking
- Achievement visualization

### 8. **Friend System**
- Send and receive friend requests
- Friend list management
- Friend discovery
- Private messaging

### 9. **Event Management**
- Create study events
- Event calendar
- Team event notifications

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Backend API** running (for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProiectColectivFrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env.development` file in the root directory:
   ```env
   VITE_BASEPATH=http://localhost:8080
   VITE_WSPATH=localhost:8080
   ```

4. **Generate API client** (optional, if backend is running)
   ```bash
   npm run generate:localApi
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 💻 Development

### Development Workflow

1. **Start the dev server**
   ```bash
   npm run dev
   ```
   - Hot module replacement (HMR) enabled
   - Runs on port 3000
   - Proxy configured for backend API on port 8080

2. **Code linting**
   ```bash
   npm run lint
   ```

3. **Build for production**
   ```bash
   npm run build
   ```
   - TypeScript compilation check
   - Vite production build
   - Output in `/dist` directory

4. **Preview production build**
   ```bash
   npm run preview
   ```

### Code Style & Standards

- **TypeScript** - All code is written in TypeScript for type safety
- **ESLint** - Configured with React and TypeScript rules
- **Component Structure** - Functional components with hooks
- **State Management** - Zustand for client state, React Query for server state
- **Styling** - Tailwind CSS utility classes

### Adding New Features

1. **Creating a new page:**
   - Add component to `/src/pages/private` or `/src/pages/public`
   - Register route in `/src/App.tsx`
   - Wrap with appropriate route protection

2. **Adding API endpoints:**
   - Define hooks in `/src/services/react-query`
   - Use React Query's `useQuery` for GET operations
   - Use React Query's `useMutation` for POST/PUT/DELETE operations

3. **State management:**
   - Client state → Create Zustand store in `/src/services/stores`
   - Server state → Create React Query hooks in `/src/services/react-query`

## 🔌 API Generation

### OpenAPI Code Generation

The project uses OpenAPI Generator to automatically create TypeScript API clients from the backend's Swagger documentation.

**Generate API from production backend:**
```bash
npm run generate:api
```

**Generate API from local backend:**
```bash
npm run generate:localApi
```

**Requirements:**
- Backend server must be running
- Swagger documentation must be accessible at `/swagger/doc.json`

**Output:**
- Generated files are placed in `/src/api`
- This directory is git-ignored
- Files are automatically typed with TypeScript interfaces

**Usage in code:**
```typescript
import { DefaultApi, Configuration } from "@/api";
```

## 🎨 Design System

### Shadcn/ui + Tailwind CSS

The project uses **Shadcn/ui**, a collection of re-usable components built with Radix UI and Tailwind CSS.

**Key Characteristics:**
- Copy-paste components (not npm packages)
- Fully customizable
- Accessible by default (Radix UI primitives)
- Styled with Tailwind CSS

### Adding New Components

1. **Install a component:**
   ```bash
   npx shadcn@latest add button
   ```

2. **Use in your code:**
   ```tsx
   import { Button } from "@/components/ui/button"
   
   function MyComponent() {
     return <Button>Click me</Button>
   }
   ```

3. **Customize:**
   - Edit the component in `/src/components/ui`
   - Modify Tailwind classes
   - Extend functionality

### Available Components
- **Forms:** Input, Textarea, Select, Checkbox, Radio, Label
- **Layout:** Card, Separator, Tabs, Accordion, Collapsible
- **Overlays:** Dialog, Alert Dialog, Popover, Tooltip, Sheet
- **Navigation:** Menubar, Dropdown Menu, Sidebar
- **Feedback:** Spinner, Skeleton, Sonner (Toast)
- **Data Display:** Avatar, Badge, Calendar, Scroll Area

### Theme Customization

**Theme Toggle:**
The app supports dark/light mode via `next-themes`:
```tsx
import { useTheme } from "next-themes"

const { theme, setTheme } = useTheme()
```

**Customize Theme:**
Use the [Tweakcn theme editor](https://tweakcn.com/editor/theme) to customize colors and styles.

**Component Documentation:**
[Shadcn/ui Components](https://ui.shadcn.com/docs/components)

## ⚙️ Environment Configuration

### Environment Files

- **`.env.development`** - Development environment
- **`.env.production`** - Production environment
- **`.env`** - Git-ignored, for local overrides

### Required Variables

```env
# Backend API base URL
VITE_BASEPATH=http://localhost:8080

# WebSocket server path (without ws:// prefix)
VITE_WSPATH=localhost:8080
```

### Accessing Environment Variables

```typescript
const baseUrl = import.meta.env.VITE_BASEPATH;
const wsPath = import.meta.env.VITE_WSPATH;
```

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **dev** | `npm run dev` | Start development server on port 3000 |
| **build** | `npm run build` | Build for production (TypeScript + Vite) |
| **lint** | `npm run lint` | Run ESLint on all source files |
| **preview** | `npm run preview` | Preview production build locally |
| **generate:api** | `npm run generate:api` | Generate API client from production Swagger |
| **generate:localApi** | `npm run generate:localApi` | Generate API client from local Swagger |

## 🔒 Security Considerations

- **JWT Tokens** - Stored in localStorage, included in API requests via interceptors
- **Token Validation** - Automatic validation on protected routes
- **HTTPS** - Required for production (WebRTC requirement)
- **CORS** - Configured via Vite proxy in development

## 🏛️ Architecture Patterns Summary

1. **Component Composition** - Small, reusable components composed into larger features
2. **Container/Presenter Pattern** - Pages (containers) use services, components (presenters) receive props
3. **Custom Hooks** - Business logic extracted into reusable hooks
4. **Service Layer** - API calls abstracted behind service functions
5. **State Management Separation** - Client state (Zustand) vs Server state (React Query)
6. **Route Protection** - HOC pattern for route authorization
7. **WebSocket Management** - Custom hooks for WebSocket lifecycle
8. **WebRTC Abstraction** - Peer connection management in dedicated services

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

---

**Built with ❤️ by the StudyFlow Team**
