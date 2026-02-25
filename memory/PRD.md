# MMuni - Municipal Application PRD

## Original Problem Statement
Build a professional, single-screen mobile application named "MMuni" for iOS and Android using Expo. This is a customizable municipal application that can serve different municipalities.

## Key Requirements
- **Backend**: Supabase for database
- **Architecture**: Single-screen UI ("Glagne") with all views opening as stacked Bottom Sheets using `@gorhom/bottom-sheet`
- **Data Model**: Universal entity "obj" represents all content, filtered by `current_mun_id`
- **UI/UX**: iOS 18 Human Interface Guidelines, San Francisco font, large corner radii (28px), Lucide Icons
- **User Roles**: guest, registered, activist, admin, superadmin

## Database Schema
- **mun**: {mun_id, mun_country, mun_region, mun_name, mun_coordinates}
- **obj**: {obj_id, obj_mun, obj_type, obj_sphere, obj_title, obj_description, obj_photo, obj_date, obj_author, obj_coordinates, obj_likes, obj_dislikes, obj_reports, obj_sort_order}
- **user**: {user_id, user_name, user_email, user_mun, user_role, user_premium}
- **comm**: {comm_id, comm_obj, comm_author, comm_text, comm_date, comm_likes, comm_dislikes, comm_reports}
- **doc**: {doc_id, doc_mun, doc_author, doc_title, doc_url, doc_date}
- **config**: {config_id, config_key, config_value}

## Tech Stack
- React Native (Expo)
- Supabase
- TanStack Query
- Zustand
- @gorhom/bottom-sheet
- lucide-react-native
- i18next
- react-native-maps (planned)

---

## What's Been Implemented

### Session: February 25, 2026

#### P0 - Core Navigation Fixed
- Fixed critical Supabase connection issue (wrong env variable name `EXPO_PUBLIC_SUPABASE_ANON_KEY` -> `EXPO_PUBLIC_SUPABASE_KEY`)
- Fixed Zustand state management for web platform (removed problematic persist middleware causing hydration issues)
- **StartScreen** now successfully fetches municipalities from Supabase (5 municipalities: 3 in Kazakhstan, 2 in South Africa)
- **Municipality Selection Flow** working:
  - "My Municipality" button opens bottom sheet with country -> region -> municipality hierarchy
  - "Random Municipality" button navigates directly to first available municipality
- **Navigation** from StartScreen to Glagne screen working

#### P0 - Glagne Main Screen
- Weather Widget working (fetching from OpenWeatherMap API via backend proxy)
- Main sections rendering:
  - Administration, Documents, Initiatives buttons
  - Organizations section with 4 spheres (Governance, Social, Infrastructure, Environment)
  - Events & Initiatives with map placeholder
  - News section (shows "No data available" when no news exists)
- FAB buttons (AI chat, Add content for logged-in users)
- Settings gear icon in header

#### Backend Proxy
- `/api/weather` endpoint working - proxies to OpenWeatherMap
- `/api/health` endpoint available

---

## Pending Issues

### P2 - Non-Critical
1. **Require Cycle Warnings**: Metro bundler shows circular dependency warnings between SheetProvider and individual sheet components
2. **"import.meta" Error**: Browser console shows this error on page load but app still functions

---

## Upcoming Tasks (P1)

### Bottom Sheets Implementation
- [ ] BS_List: Implement filtered object list functionality
- [ ] BS_Object: Implement object detail view with comments
- [ ] BS_Create: Implement object creation/editing form
- [ ] BS_Settings: Implement user profile management
- [ ] BS_Map: Implement map view with react-native-maps
- [ ] BS_Chat: Wire up to AI Assistant API
- [ ] BS_Docs: Implement documents list

### Authentication
- [ ] Login flow with Supabase auth
- [ ] Registration flow
- [ ] User role-based permissions

### State Persistence
- [ ] Re-implement Zustand persist middleware properly for web/native
- [ ] Session persistence across app restarts

---

## Future Tasks (P2)

- [ ] i18n implementation (English/Russian)
- [ ] Admin drag-and-drop reordering in BS_List
- [ ] Refactor SheetProvider to eliminate require cycles
- [ ] Content creation by role (registered, activist, admin)
- [ ] Comments system
- [ ] Likes/dislikes/reports functionality

---

## Code Architecture
```
/app
├── backend
│   ├── .env
│   ├── requirements.txt
│   └── server.py
└── frontend
    ├── .env
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    ├── metro.config.js
    └── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   └── +html.tsx
    └── src/
        ├── services/
        │   ├── api.ts
        │   ├── i18n.ts
        │   └── supabase.ts
        ├── store/
        │   └── useAppStore.ts
        ├── utils/
        │   ├── constants.ts
        │   └── types.ts
        └── components/
            ├── Glagne.tsx
            ├── StartScreen.tsx
            ├── ObjectCard.tsx
            ├── RoleBadge.tsx
            ├── WeatherWidget.tsx
            ├── SheetProvider.tsx
            └── sheets/
                ├── BSChat.tsx
                ├── BSCreate.tsx
                ├── BSDocs.tsx
                ├── BSList.tsx
                ├── BSMap.tsx
                ├── BSObject.tsx
                └── BSSettings.tsx
```

## API Credentials
- Supabase URL & Key: In frontend/.env
- Weather API: In backend/.env
- AI Assistant API: In backend/.env (to be configured)
