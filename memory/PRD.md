# MMuni - Municipal Application PRD

## Original Problem Statement
Build a professional, single-screen mobile application named "MMuni" for iOS and Android using Expo. This is a customizable municipal application that can serve different municipalities.

## Tech Stack
- React Native (Expo)
- Supabase (database & auth)
- TanStack Query
- Zustand
- @gorhom/bottom-sheet
- lucide-react-native
- i18next (English & Russian)

---

## Completed Features

### Core Navigation & State
- [x] Municipality selection (My Municipality / Random)
- [x] Navigation: StartScreen ↔ Glagne
- [x] State persistence (localStorage) - remembers selected municipality
- [x] Weather widget integration

### Authentication
- [x] Registration (Name, Email, Password, Municipality)
- [x] Login on StartScreen
- [x] Session management via Supabase auth
- [x] Logout and Delete Account
- [x] Bug fix: user_role now correctly set to "registered" on signup (using upsert)

### Bottom Sheets (All 7 Complete)
- [x] BS_List - Filtered object list by type/sphere
- [x] BS_Object - Object detail, likes/dislikes, comments, edit/delete
- [x] BS_Create - Create/edit objects with role-based restrictions
- [x] BS_Settings - Profile management, auth, language selector
- [x] BS_Map - Map placeholder with coordinates
- [x] BS_Chat - AI chat with premium-only restriction
- [x] BS_Docs - Municipal documents list

### Role-Based UI
- [x] "Add" FAB hidden for guests
- [x] BSCreate restricts object types by user role
- [x] Edit/Delete restricted to author or admin
- [x] AI Chat requires premium subscription

### Internationalization (i18n)
- [x] English translations (complete)
- [x] Russian translations (complete)
- [x] Language selector in BS_Settings (globe icon + buttons)
- [x] Instant language switching without page reload
- [x] All UI text translated including:
  - Form labels and placeholders
  - Buttons and actions
  - Error messages and alerts
  - Navigation items
  - Settings options

---

## Translation Files
- `/app/frontend/src/locales/en.json` - 85+ English translations
- `/app/frontend/src/locales/ru.json` - 85+ Russian translations

---

## Pending Issues (P2)
1. Require Cycle Warnings in Metro bundler (non-blocking)
2. React 19 ref deprecation warning (minor)

---

## Future Tasks
- [ ] Implement actual map view with react-native-maps
- [ ] Connect AI Chat to actual AI API endpoint
- [ ] Admin drag-and-drop reordering in BS_List
- [ ] File/image upload for object photos
- [ ] Refactor SheetProvider to eliminate require cycles

---

## Code Architecture
```
/app/frontend/src/
├── locales/
│   ├── en.json          # English translations
│   └── ru.json          # Russian translations
├── services/
│   ├── api.ts
│   ├── i18n.ts          # i18next config
│   └── supabase.ts
├── store/
│   └── useAppStore.ts   # Zustand + localStorage (includes locale)
└── components/
    ├── Glagne.tsx
    ├── StartScreen.tsx
    └── sheets/
        ├── BSSettings.tsx  # Language selector added
        └── ...
```

## Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`
- `EXPO_PUBLIC_BACKEND_URL`
