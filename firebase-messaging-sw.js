// firebase-messaging-sw.js

self.addEventListener('push', function(event) {
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: "海山救護義消", body: event.data.text() };
    }

    const title = data.title || '🚨 海山任務通知';
    const options = {
        body: data.body || '',
        icon: 'https://eurekateamstar-star.github.io/icon1.jpg',
        badge: 'https://eurekateamstar-star.github.io/icon1.jpg',
        
        // 1. [大圖示] 讓推播可以帶圖片（如果有傳圖片的話）
        image: data.image || '', 
        
        // 2. [震動模式] 模擬救護車急促震動 (震動, 暫停, 震動...)
        vibrate: [500, 100, 500, 100, 500, 100, 500],
        
        // 3. [APP 互動按鈕] 讓推播直接出現按鈕可以點
        actions: [
            { action: 'view', title: '立即開啟平台' },
            { action: 'close', title: '忽略' }
        ],
        
        // 4. [標籤管理] 相同類型的通知會覆蓋，不會塞滿整個通知列
        tag: 'task-notification',
        renotify: true,
        
        requireInteraction: true, // 除非使用者點擊，否則通知不會自動消失
        data: { url: data.url || 'https://eurekateamstar-star.github.io/' }
    };

    // 5. [APP 紅點] 讓桌面圖示出現紅點 (支援的部分手機)
    if ('setAppBadge' in navigator) {
        navigator.setAppBadge(1);
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 點擊通知後的處理
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // --- 加入這段：點擊通知即清除紅點 ---
    if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge();
    }
    // -------------------------------

    if (event.action === 'close') return;
    // 如果點擊的是忽略按鈕
    if (event.action === 'close') return;

    const urlToOpen = event.notification.data.url;

    // 6. [視窗管理] APP 化的重點：如果已經開著網頁，就直接跳過去，不要開新分頁
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;
        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }
        if (matchingClient) {
            return matchingClient.focus();
        } else {
            return clients.openWindow(urlToOpen);
        }
    });

    event.waitUntil(promiseChain);
});
