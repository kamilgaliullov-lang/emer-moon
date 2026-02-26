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
- react-native-maps (placeholder implemented)

---

## What's Been Implemented

### Session 2: February 26, 2026

#### P0 - State Persistence ✅
- Municipality selection persists to localStorage
- Guest users see Glagne directly on return visits

#### P1 - Authentication Flow ✅
- Registration (Name, Email, Password, Municipality)
- Login on StartScreen
- Session management via Supabase auth listener
- Logout and Delete Account

#### P1 - Bottom Sheets ✅
All 7 Bottom Sheets are fully implemented:

| Sheet | Status | Features |
|-------|--------|----------|
| **BS_List** | ✅ | Filtered object list by type/sphere, displays ObjectCards |
| **BS_Object** | ✅ | Object detail, likes/dislikes, comments, edit/delete, report |
| **BS_Create** | ✅ | Create/edit objects, role-based type restrictions |
| **BS_Settings** | ✅ | Profile management, registration, logout |
| **BS_Map** | ✅ | Map placeholder with coordinates, object list |
| **BS_Chat** | ✅ | AI chat with premium-only restriction |
| **BS_Docs** | ✅ | Municipal documents list |

#### P1 - Role-Based UI ✅
- "Add" FAB hidden for guests (only visible for registered+ users)
- BSCreate restricts object types by role:
  - `person` → admin/superadmin only
  - `initiative` → activist/admin/superadmin
  - `news` → admin/superadmin
  - `organization`, `event` → registered+
- Edit/Delete restricted to author or admin
- AI Chat requires premium subscription

---

## Completed Features
- [x] State persistence (localStorage)
- [x] Municipality selection (My Municipality / Random)
- [x] Navigation: StartScreen ↔ Glagne
- [x] Weather widget integration
- [x] Authentication: Registration, Login, Logout
- [x] User profile management
- [x] BS_List with filtered queries
- [x] BS_Object with likes, comments, edit/delete
- [x] BS_Create with role-based restrictions
- [x] BS_Settings profile management
- [x] BS_Map with coordinate display
- [x] BS_Chat with premium lock
- [x] BS_Docs document list
- [x] Role-based "Add" FAB visibility
- [x] i18n setup (English)

---

## Pending Issues

### P2 - Non-Critical
1. **Require Cycle Warnings**: Metro bundler circular dependency warnings
2. **React 19 ref deprecation**: Minor console warning

---

## Future Tasks (P2)

- [ ] i18n Russian translations
- [ ] Admin drag-and-drop reordering in BS_List
- [ ] Refactor SheetProvider to eliminate require cycles
- [ ] Implement actual map view with react-native-maps (currently placeholder)
- [ ] Connect AI Chat to actual AI API endpoint
- [ ] File/image upload for object photos

---

## Code Architecture
```
/app
├── backend
│   ├── .env
│   ├── requirements.txt
│   └── server.py              # Weather & Chat API proxy
└── frontend
    ├── .env
    ├── app.json
    ├── package.json
    └── app/
    │   ├── _layout.tsx        # Root, auth listener, hydration
    │   ├── index.tsx          # Router (StartScreen/Glagne)
    │   └── +html.tsx
    └── src/
        ├── services/
        │   ├── api.ts         # Backend API calls
        │   ├── i18n.ts        # Translations
        │   └── supabase.ts    # Supabase client
        ├── store/
        │   └── useAppStore.ts # Zustand + localStorage
        ├── utils/
        │   ├── constants.ts   # Colors, radius, shadows
        │   └── types.ts       # TypeScript interfaces
        └── components/
            ├── Glagne.tsx         # Main screen
            ├── StartScreen.tsx    # Login + municipality selection
            ├── ObjectCard.tsx     # Reusable card component
            ├── RoleBadge.tsx      # User role indicator
            ├── WeatherWidget.tsx  # Weather display
            ├── SheetProvider.tsx  # Bottom sheet manager
            └── sheets/
                ├── BSChat.tsx     # AI assistant
                ├── BSCreate.tsx   # Create/edit objects
                ├── BSDocs.tsx     # Documents list
                ├── BSList.tsx     # Filtered object list
                ├── BSMap.tsx      # Map view
                ├── BSObject.tsx   # Object detail + comments
                └── BSSettings.tsx # Profile + auth
```

## API Endpoints
- `/api/weather?lat=X&lng=Y` - Weather proxy
- `/api/chat` - AI assistant proxy (TODO: connect to actual API)
- `/api/health` - Health check

## Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` - Supabase anon key
- `EXPO_PUBLIC_BACKEND_URL` - Backend proxy URL
