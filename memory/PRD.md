# MMuni - My Municipality's App

## Overview
Expo React Native application for municipality-related services.

## Architecture
- **Frontend**: Expo React Native (web) on port 3000
- **Backend**: FastAPI on port 8001
- **Database**: MongoDB
- **External Services**: Weather API, AI Chat API (Dify), Supabase

## Core Features (Implemented)
- User authentication (Supabase)
- Weather widget
- AI Chat integration
- User profile management
- Multi-language support (EN/RU)

## What's Been Implemented
- [2026-01-28] Initial codebase with Expo setup
- [2026-01-28] Fixed startup - changed package.json to `expo start --web --port 3000`

## API Endpoints
- GET /api/ - Health check
- GET /api/weather?lat=&lng= - Weather data
- POST /api/chat - AI chat
- POST /api/user/update-profile - User profile update

## Backlog
- P0: Core functionality testing
- P1: Additional features as per user requirements
- P2: UI/UX improvements

## Next Tasks
- Awaiting user requirements for enhancements
