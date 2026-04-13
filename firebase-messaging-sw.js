self.addEventListener('push', function(event) {
    console.log('[SW] 收到原生推播:', event.data.text());
    
    let data = {};
    try {
        data = event.data.json(); // 解析後端傳來的 JSON { title, body, url }
    } catch (e) {
        console.error("解析推播資料失敗:", e);
        return;
    }

    const title = data.title || '海山救護義消';
    const options = {
        body: data.body || '',
        icon: 'https://eurekateamstar-star.github.io/icon-192.png',
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
