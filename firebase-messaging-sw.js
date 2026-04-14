// firebase-messaging-sw.js

// 建立一個簡單的變數來追蹤紅點數量
// 注意：Service Worker 會在閒置時重置，但在連續接收通知時能維持數字
let currentBadgeCount = 0;

self.addEventListener('push', function(event) {
    console.log('[SW] 收到推播通知');

    // 1. 累加紅點計數
    currentBadgeCount++;

    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = { 
            title: "海山救護義消", 
            body: event.data.text(),
            url: 'https://eurekateamstar-star.github.io/'
        };
    }

    // 2. 設定桌面圖示紅點數字 (1, 2, 3, 4...)
    if ('setAppBadge' in navigator) {
        navigator.setAppBadge(currentBadgeCount).catch((error) => {
            console.error('設定紅點失敗:', error);
        });
    }

    const title = data.title || '🚨 海山任務通知';
    const options = {
        body: data.body || '您有新的任務訊息，請點擊查看。',
        icon: 'https://eurekateamstar-star.github.io/icon1.jpg',
        badge: 'https://eurekateamstar-star.github.io/icon1.jpg',
        
        // 模擬救護車急促震動模式
        vibrate: [500, 100, 500, 100, 500, 100, 500],
        
        // 加入互動按鈕
        actions: [
            { action: 'view', title: '進入平台' },
            { action: 'close', title: '忽略' }
        ],
        
        // 標籤管理：相同標籤的通知會互相覆蓋，避免通知列炸掉
        tag: 'haishan-ems-task',
        renotify: true,
        
        // 強制互動：通知會停在螢幕上直到使用者點擊或滑掉
        requireInteraction: true,
        
        // 傳遞資料給點擊事件
        data: { 
            url: data.url || 'https://eurekateamstar-star.github.io/' 
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 處理通知點擊事件
self.addEventListener('notificationclick', function(event) {
    // 關閉通知視窗
    event.notification.close();

    // 3. 點擊後立即清除紅點數字
    currentBadgeCount = 0;
    if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge();
    }

    // 如果點擊的是「忽略」按鈕，直接結束
    if (event.action === 'close') return;

    // 4. APP 化跳轉邏輯：如果網頁已開著，就直接切換過去，不要開新分頁
    const urlToOpen = event.notification.data.url;
    
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

// 監聽來自網頁端的訊息 (例如網頁開啟時要求清除紅點)
self.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'clearBadge') {
        currentBadgeCount = 0;
        if ('clearAppBadge' in navigator) {
            navigator.clearAppBadge();
        }
    }
});
