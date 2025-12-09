# CareMap

CareMap is a healthcare navigation platform I built to help users quickly locate nearby hospitals, clinics, and emergency services. Millions of people especially in developing countries struggle to locate healthcare quickly.
CareMap aims to solve that by providing:

* A fast, simple, accurate healthcare locator
* Access to verified facility information
* Clean, accessible UI

Built as part of my mentorship at **The Freelance Coalition for Developing Countries**, CareMap has grown from a small idea into a full-stack application combining **Next.js**, **Node.js**, **Google Maps**, and **PostgreSQL**.

This project is not commercial at the moment, it’s a passion project with the goal of helping people find help when it matters.

## Tech Stack

### API Documentation (Swagger UI)

CareMap uses Swagger UI to automatically generate interactive API documentation.

### Backend

* Node.js + Express
* PostgreSQL
* JWT Authentication
* Google Places API
* Swagger UI Express (For API documentation)

### Frontend

* Next.js 15 (App Router + Turbopack)
* TypeScript
* Tailwind CSS
* Google Maps SDK

## Core Features

### 1. Real-time User Location

* Automatically detects user/device location using the Geolocation API
* Displays the user’s position on an interactive map

### 2. Hospital & Clinic Search (Google Places API)

* Search for healthcare facilities near the user
* Uses Google’s Places API for accurate, global healthcare data

### 3. Interactive Map Visualization

* Displays both the user and hospital locations
* Adds clear markers and UI for easy navigation
* Provides directions from the user’s location to selected hospitals

### 4. Backend Authentication

* Node.js backend with JWT authentication
* PostgreSQL for secure user + saved data storage
* API routes for saving selected locations and bookmarks

### 5. Article Reading + Bookmark System

* Users can read health-related articles inside CareMap
* Articles can be saved (“Bookmark for later”)
* Stored in PostgreSQL and synced to user accounts

## ⚠️ Geolocation Accuracy Notice

Kindly note that CareMap uses real-time geolocation services to detect the user’s location and provide nearby hospitals. However, geolocation may occasionally fail or become inaccurate due to factors outside the app’s control, such as:

Poor or unstable network connection

Bad weather conditions (heavy rain, storms, cloud interference)

GPS signal obstruction (indoors, tall buildings, tunnels)

Device-level location restrictions

If the map fails to load your location or the distance calculations seem incorrect, please wait a few minutes and try again. Location services typically resume once weather or signal conditions improve.

## Installation (Local Development)

```sh
# Clone repo
git clone https://github.com/yourusername/caremap.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Required environment variables (`.env.local`)

```
GOOGLE_MAPS_API_KEY=
DATABASE_URL=
JWT_SECRET=
```

## Running the Backend

```sh
cd backend
npm install
npm run dev
```

Ensure PostgreSQL is running:

```sh
pg_ctl -D /opt/homebrew/var/postgresql@14 start
```

# Contact

Email: naomi.ibeh69@gmail.com <br>
[LinkedIn ](https://www.linkedin.com/in/ibe-naomi)

