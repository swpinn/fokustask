# FocusTask ✅

> A beautiful to-do list app built with React + Firebase.
> 
> 🌐 **Live App:** [https://fokustask.web.app](https://fokustask.web.app)

[![Live App](https://img.shields.io/badge/Live_App-fokustask.web.app-26665f?style=for-the-badge&logo=googlechrome&logoColor=white)](https://fokustask.web.app)
![FocusTask Preview](https://img.shields.io/badge/Status-Active-26665f?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)

## Features

- ✅ Add, edit, delete, and complete tasks
- 🔄 Drag & drop to reorder tasks
- 📅 Calendar view with task indicators
- 📊 Statistics with charts
- 🏷️ Categories & labels
- ⏰ Due date & time reminders
- 🔐 Google & Email authentication
- 📱 Responsive (mobile, tablet, desktop)
- ☁️ Real-time sync across all devices (Firebase)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Backend/DB**: Firebase Firestore + Authentication
- **Charts**: Chart.js via react-chartjs-2
- **Drag & Drop**: @hello-pangea/dnd
- **Routing**: React Router v6
- **Deploy**: Firebase Hosting ([fokustask.web.app](https://fokustask.web.app))

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-username/focustask.git
cd focustask
npm install
```

### 2. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **Add project** → beri nama (misal: `focustask`)
3. Di sidebar, klik **Build > Firestore Database** → Create database → Start in production mode
4. Di sidebar, klik **Build > Authentication** → Get started → Enable **Google** dan **Email/Password**
5. Di sidebar, klik ⚙️ **Project settings** → **Your apps** → klik `</>` (Web)
6. Register app → copy `firebaseConfig`

### 3. Create .env

Buat file `.env` di root project (jangan di-commit!):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Di Firebase Console > Firestore > Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

### 5. Run Locally

```bash
npm run dev
```

## Deploy ke Firebase Hosting

```bash
# Build dan deploy ke Firebase
npm run deploy

# Atau deploy hosting saja
npm run deploy:hosting
```
