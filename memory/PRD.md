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

### Session 1: February 25, 2026
- Fixed Expo crash loop
- StartScreen and Glagne basic rendering

### Session 2: February 26, 2026

#### P0 - State Persistence ✅
- Implemented custom localStorage persistence for Zustand store
- Municipality selection now persists across page refreshes
- Guest users who select "My Municipality" will see Glagne directly on return

#### P1 - Authentication Flow ✅
- **Registration**: 
  - Full form with Name, Email, Password, Municipality selection
  - Opens via "Register" button → BS_Settings bottom sheet
  - Uses `supabase.auth.signUp()` + creates record in `user` table
  
- **Login**:
  - Email/password login on StartScreen
  - Uses `supabase.auth.signInWithPassword()`
  - Automatically navigates to user's saved municipality
  
- **Session Management**:
  - `_layout.tsx` listens to Supabase auth state changes
  - Restores user session and municipality on app restart
  - Hydrates state from localStorage on mount
  
- **Profile Management** (BS_Settings):
  - Update name, email, password
  - Change municipality
  - Toggle activist status (for registered users)
  - Logout functionality
  - Delete account option

---

## Completed Features
- [x] State persistence (localStorage)
- [x] Municipality selection (My Municipality / Random)
- [x] Navigation: StartScreen ↔ Glagne
- [x] Weather widget integration
- [x] Authentication: Registration, Login, Logout
- [x] User profile management in BS_Settings
- [x] i18n setup (English translations)

---

## Pending Issues

### P2 - Non-Critical
1. **Require Cycle Warnings**: Metro bundler shows circular dependency warnings between SheetProvider and individual sheet components
2. **React 19 ref deprecation warning**: Minor console warning

---

## Upcoming Tasks (P1)

### Bottom Sheets Implementation
- [ ] BS_List: Implement filtered object list functionality
- [ ] BS_Object: Implement object detail view with comments
- [ ] BS_Create: Implement object creation/editing form
- [ ] BS_Map: Implement map view with react-native-maps
- [ ] BS_Chat: Wire up to AI Assistant API
- [ ] BS_Docs: Implement documents list

### User Role Permissions
- [ ] Show/hide "Add" FAB based on user role
- [ ] Role-based content creation restrictions
- [ ] Admin features (reordering, moderation)

---

## Future Tasks (P2)

- [ ] i18n Russian translations
- [ ] Admin drag-and-drop reordering in BS_List
- [ ] Refactor SheetProvider to eliminate require cycles
- [ ] Comments system implementation
- [ ] Likes/dislikes/reports functionality
- [ ] Mayor verification flow

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
    └── app/
    │   ├── _layout.tsx      # App root, auth listener, hydration
    │   ├── index.tsx        # Main router (StartScreen/Glagne)
    │   └── +html.tsx
    └── src/
        ├── services/
        │   ├── api.ts
        │   ├── i18n.ts
        │   └── supabase.ts
        ├── store/
        │   └── useAppStore.ts  # Zustand with localStorage persistence
        ├── utils/
        │   ├── constants.ts
        │   └── types.ts
        └── components/
            ├── Glagne.tsx
            ├── StartScreen.tsx   # Login form included
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
                └── BSSettings.tsx  # Registration + Profile management
```

## Key Files Modified This Session
- `src/store/useAppStore.ts` - Added localStorage persistence
- `app/_layout.tsx` - Added hydration call on mount
- `src/components/sheets/BSSettings.tsx` - Full auth flow (already existed)
- `src/components/StartScreen.tsx` - Login flow (already existed)
