# AI Movie Recommendation Frontend

React UI for the AI movie/series recommendation app. It talks to the Spring Boot backend and shows movies, series, favorites, profiles, and AI-driven recommendations.

## Features
- Auth flow (login/register) with JWT stored in localStorage
- Browse movies and series
- Favorites management
- Personalized recommendations and history
- Profile page and basic navigation

## Tech Stack
- React 19 + react-router-dom
- Axios
- Tailwind CSS
- Create React App (react-scripts)

## Local Setup
Prereqs: Node.js 18+ and npm.

Install and run:
```
npm install
npm start
```

Build:
```
npm run build
```

## Configuration
The API base URL is set in `src/api/axios.js`:
```
baseURL: "http://localhost:8080/api"
```
Update it if your backend runs elsewhere.

## Routes
- `/home`
- `/movies`
- `/series`
- `/favorites`
- `/recommendations`
- `/old-recommendations`
- `/profile`
- `/login`
- `/register`

## Project Structure
- `src/api` - axios client with auth header
- `src/pages` - page-level views
- `src/assets` - images and static assets
- `src/data` - local data helpers
- `src/App.jsx` - routes
- `src/index.jsx` - app entry

## Notes
- The frontend expects the backend to run on port 8080.
- Auth token is read from `localStorage` and sent as `Authorization: Bearer <token>`.
