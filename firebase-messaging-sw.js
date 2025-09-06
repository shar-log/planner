importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyCTArFuPpxo608354Ql9RLOZRB9lGHFndI",
  authDomain: "habit-tracker-3eb0d.firebaseapp.com",
  projectId: "habit-tracker-3eb0d",
  storageBucket: "habit-tracker-3eb0d.firebasestorage.app",
  messagingSenderId: "724949907964",
  appId: "1:724949907964:web:f5b76c04de753903d55a79"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log("📩 Background message:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon192.png"
  });
});
