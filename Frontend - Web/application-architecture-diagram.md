# SignLink Web Application Architecture Diagram

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SignLink Web Application                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Frontend      │    │   Backend       │    │   External      │              │
│  │   (React)       │    │   (ASP.NET)     │    │   Services      │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                     │
│           │                       │                       │                     │
│           ▼                       ▼                       ▼                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Vite Dev      │    │   API Server    │    │   Firebase      │              │
│  │   Server        │    │   (signlink2.   │    │   (Firestore)   │              │
│  │   (Port 5173)   │◄──►│   runasp.net)   │    │                 │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                     │
│           │                       │                       │                     │
│           ▼                       ▼                       ▼                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   WebRTC        │    │   AI Model      │    │   WebSocket     │              │
│  │   (P2P Video)   │    │   Server        │    │   (Port 8000)   │              │
│  │                 │    │   (Python)      │    │                 │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
Frontend - Web/
├── 📄 package.json                 # Dependencies & scripts
├── 📄 vite.config.js              # Vite configuration
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 index.html                  # Entry HTML file
├── 📁 public/                     # Static assets
│   ├── logo.png
│   └── _redirects                 # Vercel routing
├── 📁 src/                        # Source code
│   ├── 📄 main.jsx                # React entry point
│   ├── 📄 App.jsx                 # Main App component
│   ├── 📄 App.scss                # Global styles
│   ├── 📄 index.scss              # Base styles
│   ├── 📁 assets/                 # Static assets
│   │   ├── audios/                # Sound effects
│   │   └── images/                # Images
│   ├── 📁 components/             # Reusable components
│   │   ├── 📁 CallChat/           # Chat functionality
│   │   ├── 📁 Contact_Media/      # Contact components
│   │   ├── 📁 Features_Container/ # Feature cards
│   │   ├── 📁 Loader/             # Loading components
│   │   ├── 📁 Navbar/             # Navigation
│   │   ├── 📁 Profile_Icon/       # Profile components
│   │   ├── 📁 Section_Heading/    # Section headers
│   │   ├── 📁 Slider/             # Image slider
│   │   ├── 📁 Stats_Section/      # Statistics display
│   │   ├── 📁 Toggle_Point/       # Toggle components
│   │   ├── 📁 UpToTop_Button/     # Scroll to top
│   │   └── 📄 RequireAuth.jsx     # Authentication guard
│   ├── 📁 pages/                  # Page components
│   │   ├── 📁 About/              # About page
│   │   ├── 📁 Contact/            # Contact page
│   │   ├── 📁 Footer/             # Footer component
│   │   ├── 📁 Home/               # Home page
│   │   ├── 📁 Layout/             # Main layout
│   │   ├── 📁 Login/              # Authentication pages
│   │   ├── 📁 Meeting/            # Meeting management
│   │   │   ├── 📁 CallChat/       # Call chat functionality
│   │   │   ├── 📁 SettingsPopup/  # Settings modal
│   │   │   └── 📄 CallPage.jsx    # Main call interface
│   │   └── 📁 Profile/            # User profile
│   │       └── 📁 CallsHistory/   # Call history
│   └── 📁 utils/                  # Utilities & configurations
│       ├── 📁 custom_hooks/       # Custom React hooks
│       │   ├── 📁 api/            # API hooks
│       │   │   ├── 📁 callChat/   # Chat API hooks
│       │   │   ├── useLogin.js    # Login hook
│       │   │   ├── useSignUp.js   # Signup hook
│       │   │   └── axiosConfig.js # Axios configuration
│       │   └── 📁 userData/       # User data hooks
│       ├── 📁 redux-toolkit/      # State management
│       │   ├── store.js           # Redux store
│       │   ├── apiSlice.js        # API state slice
│       │   ├── webrtcSlice.js     # WebRTC state slice
│       │   └── windowScreen.js    # Screen state slice
│       ├── 📁 functions/          # Utility functions
│       └── firebase-config.js     # Firebase configuration
└── 📄 vercel.json                 # Deployment configuration
```

## 📋 Folder Responsibilities Table

| **Folder**                               | **Responsibility**           | **Key Components**               | **Dependencies**    |
| ---------------------------------------- | ---------------------------- | -------------------------------- | ------------------- |
| **public/**                              | Static assets                | Images, icons, routing rules     | Web server          |
| **src/**                                 | Main source code             | All React components and logic   | React ecosystem     |
| **src/assets/**                          | Static media files           | Audio files, images, icons       | Media players       |
| **src/components/**                      | Reusable UI components       | Modular, reusable components     | React, styling      |
| **src/components/CallChat/**             | Real-time chat functionality | Message display, input, history  | WebRTC, API         |
| **src/components/Contact_Media/**        | Contact page components      | Contact forms, social links      | Form handling       |
| **src/components/Features_Container/**   | Feature showcase             | Feature cards, descriptions      | UI components       |
| **src/components/Loader/**               | Loading states               | Spinners, progress indicators    | Animation           |
| **src/components/Navbar/**               | Navigation system            | Menu, logo, user menu            | Routing, auth       |
| **src/components/Profile_Icon/**         | User profile components      | Avatar, dropdown menu            | User data           |
| **src/components/Section_Heading/**      | Page section headers         | Titles, subtitles                | Typography          |
| **src/components/Slider/**               | Image carousel               | Image slides, navigation         | Swiper library      |
| **src/components/Stats_Section/**        | Statistics display           | Metrics, counters                | Data visualization  |
| **src/components/Toggle_Point/**         | Toggle components            | Switches, checkboxes             | Form controls       |
| **src/components/UpToTop_Button/**       | Scroll to top                | Floating button, scroll behavior | DOM manipulation    |
| **src/pages/**                           | Page-level components        | Full page layouts                | Routing, components |
| **src/pages/About/**                     | About page content           | Company info, team details       | Content management  |
| **src/pages/Contact/**                   | Contact page                 | Contact forms, location info     | Form handling       |
| **src/pages/Footer/**                    | Site footer                  | Links, social media, copyright   | Site-wide           |
| **src/pages/Home/**                      | Landing page                 | Hero section, features, CTA      | Marketing content   |
| **src/pages/Layout/**                    | Main layout wrapper          | Header, footer, navigation       | Site structure      |
| **src/pages/Login/**                     | Authentication pages         | Login/signup forms               | Auth API            |
| **src/pages/Meeting/**                   | Video calling interface      | Call controls, video streams     | WebRTC, AI          |
| **src/pages/Meeting/CallChat/**          | In-call chat system          | Real-time messaging              | WebSocket, API      |
| **src/pages/Meeting/SettingsPopup/**     | Call settings                | Audio/video settings, features   | User preferences    |
| **src/pages/Profile/**                   | User profile management      | Profile editing, call history    | User data, API      |
| **src/pages/Profile/CallsHistory/**      | Call history display         | Past calls, statistics           | API, data display   |
| **src/utils/**                           | Utilities and configurations | Helper functions, configs        | Various services    |
| **src/utils/custom_hooks/**              | Custom React hooks           | Reusable logic, API calls        | React, API          |
| **src/utils/custom_hooks/api/**          | API integration hooks        | HTTP requests, data fetching     | Axios, backend      |
| **src/utils/custom_hooks/api/callChat/** | Chat-specific API hooks      | Message sending, history         | Chat API            |
| **src/utils/custom_hooks/userData/**     | User data management         | Profile fetching, updates        | User API            |
| **src/utils/redux-toolkit/**             | State management             | Global state, persistence        | Redux, storage      |
| **src/utils/functions/**                 | Utility functions            | Helper functions, utilities      | JavaScript          |

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Data Flow Diagram                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   User      │    │   React     │    │   Redux     │    │   Backend   │       │
│  │   Interface │◄──►│   Components│◄──►│   Store     │◄──►│   API       │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
│         │                   │                   │                   │           │
│         │                   │                   │                   │           │
│         ▼                   ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   WebRTC    │    │   Custom    │    │   Firebase  │    │   AI Model  │       │
│  │   (P2P)     │    │   Hooks     │    │   Firestore │    │   Server    │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
│         │                   │                   │                   │           │
│         │                   │                   │                   │           │
│         ▼                   ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Video     │    │   State     │    │   Real-time │    │   Sign      │       │
│  │   Streams   │    │   Updates   │    │   Database  │    │   Language  │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Core Features & Components

### 1. Authentication System

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Authentication Flow                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Login     │───►│   Axios     │───►│   Backend   │───►│   JWT       │       │
│  │   Form      │    │   Config    │    │   API       │    │   Tokens    │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
│         │                   │                   │                   │           │
│         │                   │                   │                   │           │
│         ▼                   ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Redux     │    │   Cookies   │    │   User      │    │   Protected │       │
│  │   Store     │    │   Storage   │    │   Data      │    │   Routes    │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Video Calling System

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Video Calling Flow                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Call      │───►│   WebRTC    │───►│   Firebase  │───►│   Remote    │       │
│  │   Creation  │    │   Setup     │    │   Signaling │    │   Peer      │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
│         │                   │                   │                   │           │
│         │                   │                   │                   │           │
│         ▼                   ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Media     │    │   Data      │    │   Call      │    │   Video     │       │
│  │   Controls  │    │   Channels  │    │   State     │    │   Streams   │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3. Sign Language Recognition

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Sign Language Recognition Flow                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Video     │───►│   Canvas    │───►│   WebSocket │───►│   AI Model  │       │
│  │   Capture   │    │   Frame     │    │   (Port     │    │   Server    │       │
│  │             │    │   Extraction│    │   8000)     │    │   (Python)  │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
│         │                   │                   │                   │           │
│         │                   │                   │                   │           │
│         ▼                   ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Real-time │    │   Progress  │    │  Predictions│    │   Corrected │       │
│  │   Display   │    │   Tracking  │    │   & Results │    │   Sentences │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Frontend Technologies

-   **React 18** - UI framework
-   **Vite** - Build tool & dev server
-   **Redux Toolkit** - State management
-   **React Router DOM** - Client-side routing
-   **Tailwind CSS** - Styling framework
-   **SASS** - CSS preprocessor
-   **Axios** - HTTP client
-   **React Query** - Server state management

### Backend & External Services

-   **ASP.NET Core API** - Backend server (signlink2.runasp.net)
-   **Firebase Firestore** - Real-time database
-   **Python AI Server** - Sign language recognition (WebSocket on port 8000)
-   **WebRTC** - Peer-to-peer video communication

### Key Libraries

-   **SweetAlert2** - Modal dialogs
-   **React Toastify** - Notifications
-   **Formik + Yup** - Form handling & validation
-   **Redux Persist** - State persistence
-   **js-cookie** - Cookie management

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Deployment Flow                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Local     │───►│   Vite      │───►│   Vercel    │───►│   Production│       │
│  │   Development│   │   Build     │    │   Platform  │    │   (Netlify) │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
│         │                   │                   │                   │           │
│         │                   │                   │                   │           │
│         ▼                   ▼                   ▼                   ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Port      │    │   Static    │    │   CDN       │    │   HTTPS     │       │
│  │   5173      │    │   Assets    │    │   Delivery  │    │   Domain    │       │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Features

-   **JWT Authentication** - Token-based auth with refresh tokens
-   **Protected Routes** - RequireAuth component for route protection
-   **HTTPS Enforcement** - Secure communication
-   **CORS Configuration** - Cross-origin request handling
-   **Input Validation** - Form validation with Yup schemas

## 📊 State Management

### Redux Store Structure

```
Store
├── api (Persisted)
│   ├── isAuth: boolean
│   └── userData: { username, email, image, userId }
├── webrtc
│   ├── callId: string
│   ├── userType: "creator" | "guest"
│   └── comingFrom_CallPage: boolean
└── windowScreen
    └── isLargeScreen: boolean
```

## 🔄 API Endpoints

### Authentication

-   `POST /Auth/login` - User login
-   `POST /Auth/register` - User registration
-   `POST /Auth/refresh` - Token refresh
-   `POST /Auth/logout` - User logout

### Call Management

-   `POST /Call/startCall` - Start call chat
-   `POST /Call/joinCall` - Join call chat
-   `POST /Call/endCall` - End call chat
-   `POST /Call/leaveCall` - Leave call chat
-   `POST /Call/sendMsg` - Send chat message
-   `POST /Call/getChatMsgs` - Get chat messages
-   `POST /Call/getCallsHistory` - Get call history

## 🎨 UI/UX Features

-   **Responsive Design** - Mobile-first approach
-   **Dark Theme** - Modern dark interface
-   **Loading States** - Smooth loading animations
-   **Error Handling** - User-friendly error messages
-   **Accessibility** - ARIA labels and keyboard navigation
-   **Real-time Updates** - Live data synchronization

This architecture provides a robust, scalable foundation for a real-time video calling application with advanced sign language recognition capabilities.
