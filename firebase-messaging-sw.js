importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCzxANy8mkN8BzsGr0SDvGLW_AJ43kRQ1Q",
    authDomain: "star-c5e91.firebaseapp.com",
    projectId: "star-c5e91",
    storageBucket: "star-c5e91.firebasestorage.app",
    messagingSenderId: "804810488246",
    appId: "1:804810488246:web:477340ff049b90ed68e917"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 背景推播處理
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 背景推播:', payload);
    const title = payload.notification?.title || '海山救護義消';
    const body = payload.notification?.body || '';
    self.registration.showNotification(title, {
        body,
        icon: 'https://eurekateamstar-star.github.io/icon-192.png',
        badge: 'https://eurekateamstar-star.github.io/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { url: payload.fcmOptions?.link || 'https://eurekateamstar-star.github.io/' }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || 'https://eurekateamstar-star.github.io/';
    event.waitUntil(clients.openWindow(url));
});
