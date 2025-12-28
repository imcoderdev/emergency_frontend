# 🚨 EmergencyHub Frontend

React frontend for real-time emergency incident reporting platform.

## Features

- **Live Dashboard** with interactive map (React Leaflet)
- **Mobile-First Reporting** with GPS location capture
- **Responder Portal** with priority-sorted incident queue
- **Real-Time Updates** via Socket.IO
- **PWA Support** for mobile installation
- **Dark Theme** optimized for emergency response

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS 3.4
- React Leaflet 4.x
- Socket.IO Client
- Axios
- React Router v6
- Lucide Icons

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                      # Main router & navbar
│   ├── main.jsx                     # Entry point
│   ├── pages/
│   │   ├── Dashboard.jsx            # Live map + incident feed
│   │   ├── Report.jsx               # Citizen incident reporting
│   │   └── ResponderDashboard.jsx   # Admin priority queue
│   ├── components/
│   │   ├── IncidentCard.jsx         # Reusable incident card
│   │   └── LoadingSpinner.jsx       # Loading states
│   └── services/
│       ├── api.js                   # Axios API wrapper
│       └── socket.js                # Socket.IO client
├── public/
│   ├── manifest.json                # PWA configuration
│   └── emergency-icon.svg           # App icon
├── index.html
├── vercel.json                      # Vercel deployment config
└── tailwind.config.js
```

## Environment Setup

The frontend connects to the backend at:
```
https://emergency-backend-e33i.onrender.com
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Import GitHub repository to Vercel
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy

### Other Platforms

The `vercel.json` configuration ensures all routes redirect to index.html for client-side routing.

## Pages

### Dashboard (`/dashboard`)
- **Live Map**: Shows all incidents with color-coded markers
- **Incident Feed**: Real-time list of reports
- **Auto-refresh**: Updates via Socket.IO

### Report Incident (`/report`)
- **GPS Location**: Automatic or manual selection
- **Media Upload**: Photos/videos of incident
- **AI Analysis**: Automatic severity classification
- **Mobile-Optimized**: Quick emergency reporting

### Responder Portal (`/responder`)
- **Priority Queue**: Incidents sorted by urgency algorithm
- **Status Management**: Update incident status
- **Verification**: Mark incidents as verified
- **Live Notifications**: Sound alerts for critical incidents

## Components

### IncidentCard
Reusable component with:
- Severity color strip
- Type icon
- Upvote button
- Time ago display
- Compact/detailed variants

### LoadingSpinner
Loading states with:
- Emergency siren animation
- Dots variant
- Full-page overlay
- Skeleton loaders

## API Integration

All API calls go through `services/api.js`:

```javascript
import { getIncidents, reportIncident, upvoteIncident } from './services/api';

// Get filtered incidents
const incidents = await getIncidents({ 
  type: 'Fire', 
  severity: 'Critical' 
});

// Report new incident
const result = await reportIncident(formData);

// Upvote incident
await upvoteIncident(incidentId);
```

## Real-Time Updates

Socket.IO events handled in `services/socket.js`:

```javascript
import { subscribeToIncidents } from './services/socket';

// Listen for new incidents
subscribeToIncidents((incident) => {
  console.log('New incident:', incident);
});
```

## PWA Features

- Installable on mobile devices
- Offline-ready (via manifest.json)
- Native app experience
- App shortcuts for quick reporting

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

ISC
