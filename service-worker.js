importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyCTArFuPpxo608354Ql9RLOZRB9lGHFndI",
  authDomain: "habit-tracker-3eb0d.firebaseapp.com",
  projectId: "habit-tracker-3eb0d",
  storageBucket: "habit-tracker-3eb0d.firebasestorage.app",
  messagingSenderId: "724949907964",
  appId: "1:724949907964:web:f5b76c04de753903d55a79"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log("📩 Received background:", payload);
  const notificationTitle = payload.notification?.title || "Habit Tracker";
  const notificationOptions = {
    body: payload.notification?.body || "Stay on track with your goals!",
    icon: "/icon192.png"
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
