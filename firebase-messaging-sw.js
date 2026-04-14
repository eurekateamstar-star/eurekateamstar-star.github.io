// firebase-messaging-sw.js 完全替換為以下內容 (不要引入任何 Firebase 套件)

self.addEventListener('push', function(event) {
    console.log('[SW] 收到原生推播:', event.data.text());
    
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        console.error("解析推播資料失敗:", e);
        return;
    }

    const title = data.title || '海山救護義消';
    const options = {
        body: data.body || '',
        icon: 'https://eurekateamstar-star.github.io/icon1.jpg', // 確認此圖片存在
        badge: 'https://eurekateamstar-star.github.io/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { url: data.url || 'https://eurekateamstar-star.github.io/' }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || 'https://eurekateamstar-star.github.io/';
    event.waitUntil(clients.openWindow(url));
});
