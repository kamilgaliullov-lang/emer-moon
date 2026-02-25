# MMuni - Municipal Application PRD

## Original Problem Statement
Build a professional, single-screen mobile application named "MMuni" for iOS and Android using Expo. This app is a customizable municipal application that can serve different municipalities.

## Core Requirements

### Backend
- **Database**: Supabase
- **Proxy Server**: FastAPI backend for Weather API and AI Chat API proxying

### Frontend Architecture
- Single-screen UI ("Glagne") with all other views opening as stacked Bottom Sheets using `@gorhom/bottom-sheet`
- Data filtered by currently selected municipality (`current_mun_id`)

### Design Requirements
- Follow Apple's iOS 18 Human Interface Guidelines (HIG)
- San Francisco font, large corner radii (28px), soft shadows
- Lucide Icons (1.5px stroke)

### User Roles
Five distinct roles: `guest`, `registered`, `activist`, `admin`, `superadmin`

### Key Screens/Features
1. **StartScreen**: Municipality selection or login
2. **Glagne**: Main screen with weather widget, organizations, events, news, FABs
3. **Bottom Sheets**:
   - `BS_List`: Filtered list of objects
   - `BS_Object`: Detailed view with comments
   - `BS_Create`: Create/edit objects
   - `BS_Settings`: User profile
   - `BS_Map`: Map view with pins
   - `BS_Chat`: AI assistant
   - `BS_Docs`: Municipal documents

### Tech Stack
- Expo (React Native)
- `@tanstack/react-query` for data fetching
- `zustand` with `persist` middleware for state management
- `i18next` for localization (EN/RU)
- `@gorhom/bottom-sheet` for UI
- `lucide-react-native` for icons

## Database Schema
- **mun**: `{mun_id, mun_country, mun_region, mun_name, mun_coordinates}`
- **obj**: `{obj_id, obj_mun, obj_type, obj_sphere, obj_title, obj_description, obj_photo, obj_date, obj_author, obj_coordinates, obj_likes, obj_dislikes, obj_reports, obj_sort_order}`
- **user**: `{user_id, user_name, user_email, user_mun, user_role, user_premium}`
- **comm**: `{comm_id, comm_obj, comm_author, comm_text, comm_date, comm_likes, comm_dislikes, comm_reports}`
- **doc**: `{doc_id, doc_mun, doc_author, doc_title, doc_url, doc_date}`
- **config**: `{config_id, config_key, config_value}`

## Integrations
1. **Supabase**: Database and Auth (credentials provided by user)
2. **OpenWeatherMap**: Weather widget
3. **Custom AI Assistant**: Chat feature via backend proxy

---

## What's Been Implemented

### Date: 2026-02-25

#### Completed
- [x] Project setup with Expo
- [x] All dependencies installed (React Query, Zustand, i18next, Bottom Sheet, etc.)
- [x] Backend proxy server (FastAPI) with `/api/weather` and `/api/chat` endpoints
- [x] Supabase client with SSR-safe initialization
- [x] Zustand store with SSR-safe persistence
- [x] i18next configuration with EN/RU locales
- [x] **StartScreen** - Full implementation with:
  - Municipality selection (Country > Region > Municipality drill-down)
  - Random municipality button
  - Login form with Supabase auth
  - Register button
- [x] **Glagne (Main Screen)** - Full implementation with:
  - Weather widget integration
  - Administration, Documents, Initiatives action buttons
  - Organization spheres (Governance, Social, Infrastructure, Environment)
  - Events/Map section
  - News section with object cards
  - FABs for AI Chat and Create
- [x] **SheetProvider** - Context for managing all bottom sheets
- [x] All 7 Bottom Sheet components created (BSList, BSObject, BSCreate, BSSettings, BSMap, BSChat, BSDocs)
- [x] UI Components: ObjectCard, RoleBadge, WeatherWidget
- [x] Type definitions for all data models
- [x] Color scheme and styling constants

#### Bug Fixes Applied This Session
- [x] Fixed `ReferenceError: window is not defined` - Supabase client now handles SSR
- [x] Fixed Zustand store SSR crash - Added SSR-safe storage wrapper
- [x] Resolved Expo server crash loop
- [x] Cleaned up corrupted metro-cache folder

---

## Prioritized Backlog

### P0 - Critical (Blocking)
- [ ] **Verify Supabase credentials** - The anon key format looks incorrect; needs user confirmation
- [ ] **Add sample data to Supabase** - Tables are empty, app needs at least one municipality

### P1 - High Priority
- [ ] Wire up Weather API to WeatherWidget component
- [ ] Complete BSObject with comments functionality
- [ ] Complete BSCreate with form validation and submission
- [ ] Complete BSSettings with profile editing
- [ ] Complete BSChat with AI integration
- [ ] Complete BSDocs with document list/viewer

### P2 - Medium Priority  
- [ ] Implement BSMap with react-native-maps
- [ ] Add user role-based permissions for CRUD operations
- [ ] Implement drag-and-drop reordering for admins
- [ ] Add image upload for objects

### P3 - Low Priority / Polish
- [ ] Fix require cycle warnings between SheetProvider and sheet components
- [ ] Add loading states and error handling throughout
- [ ] Implement offline caching
- [ ] Add push notifications

---

## File Structure
```
/app
├── backend
│   ├── .env
│   ├── requirements.txt
│   └── server.py
└── frontend
    ├── .env
    ├── package.json
    └── app
        ├── _layout.tsx
        ├── index.tsx
        └── src
            ├── components/
            │   ├── Glagne.tsx
            │   ├── StartScreen.tsx
            │   ├── ObjectCard.tsx
            │   ├── RoleBadge.tsx
            │   ├── WeatherWidget.tsx
            │   ├── SheetProvider.tsx
            │   └── sheets/
            │       ├── BSChat.tsx
            │       ├── BSCreate.tsx
            │       ├── BSDocs.tsx
            │       ├── BSList.tsx
            │       ├── BSMap.tsx
            │       ├── BSObject.tsx
            │       └── BSSettings.tsx
            ├── services/
            │   ├── api.ts
            │   ├── i18n.ts
            │   └── supabase.ts
            ├── store/
            │   └── useAppStore.ts
            ├── utils/
            │   ├── constants.ts
            │   └── types.ts
            └── locales/
                ├── en.json
                └── ru.json
```

## Environment Variables

### Frontend (.env)
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `EXPO_PUBLIC_BACKEND_URL` - Backend API URL

### Backend (.env)
- `WEATHER_API_URL` - OpenWeatherMap API base URL
- `WEATHER_API_KEY` - OpenWeatherMap API key
- `AI_API_URL` - AI Assistant API URL
- `AI_API_KEY` - AI Assistant API key
