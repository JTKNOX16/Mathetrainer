// firebase-config.js
// ----------------------------------------------------
// Projekt-Konfiguration (von dir bereitgestellt)
// ----------------------------------------------------
export const firebaseConfig = {
  apiKey: "AIzaSyCWlIj731UkNOgoNfkvYQX2a2yXVS2Lg0k",
  authDomain: "math-trainer-b4e77.firebaseapp.com",
  projectId: "math-trainer-b4e77",
  storageBucket: "math-trainer-b4e77.firebasestorage.app",
  messagingSenderId: "48449632113",
  appId: "1:48449632113:web:8912f7ed68bb3054a368d0"
};

// Standard-Gruppe (z. B. Klassen-ID) für die Bestenliste
export const DEFAULT_GROUP_ID = "3a-2025";

/*
Wichtige Hinweise:
- Diese Datei ist ein ES-Modul und wird von der index.html via <script type="module"> importiert.
- Die App nutzt anonyme Authentifizierung (Auth), damit Firestore-Schreibzugriffe sauber zugeordnet werden können.
- Für Firestore solltest du in den Firebase Security Rules MINDESTENS fordern, dass write-Zugriffe nur bei eingeloggten (anonymous) Usern erlaubt sind.
  Beispiel (vereinfacht; bitte anpassen):
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /leaderboard/{docId} {
        allow read: if true;
        allow write: if request.auth != null; // anonymous ok
      }
    }
  }
*/
