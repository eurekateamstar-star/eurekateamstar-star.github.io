// firebase-messaging-sw.js

// --- 1. IndexedDB 儲存邏輯：確保數字在 SW 休眠後不會消失 ---
const DB_NAME = 'HaishanBadgeDB';
const STORE_NAME = 'badgeStore';

function getDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
    });
}

async function getBadgeCount() {
    try {
        const db = await getDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get('count');
            req.onsuccess = () => resolve(req.result || 0);
            req.onerror = () => resolve(0);
        });
    } catch (e) {
        return 0;
    }
}

async function setBadgeCount(count) {
    try {
        const db = await getDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(count, 'count');
            tx.oncomplete = () => resolve();
        });
    } catch (e) {}
}

// --- 2. 監聽推播事件 ---
self.addEventListener('push', function(event) {
    console.log('[SW] 收到推播任務');

    event.waitUntil(
        (async () => {
            // 讀取舊數字並加 1
            const currentCount = await getBadgeCount();
            const newCount = currentCount + 1;
            await setBadgeCount(newCount);

            // 更新桌面圖示紅點數字
            if ('setAppBadge' in navigator) {
                await navigator.setAppBadge(newCount);
            }

            let data = {};
            try {
                data = event.data.json();
            } catch (e) {
                data = { 
                    title: "海山救護義消", 
                    body: event.data.text() 
                };
            }

            const title = data.title || '🚨 海山任務通知';
            const options = {
                body: data.body || '您有新的任務訊息。',
                icon: 'https://eurekateamstar-star.github.io/icon1.jpg',
                badge: 'https://eurekateamstar-star.github.io/icon1.jpg',
                
                // 救護車急促震動模式
                vibrate: [500, 100, 500, 100, 500, 100, 500],
                
                // 互動按鈕
                actions: [
                    { action: 'view', title: '查看任務' },
                    { action: 'close', title: '忽略' }
                ],
                
                // 標籤管理：相同標籤會覆蓋
                tag: 'haishan-ems-task',
                renotify: true,
                requireInteraction: true,
                
                data: { 
                    url: data.url || 'https://eurekateamstar-star.github.io/' 
                }
            };

            await self.registration.showNotification(title, options);
        })()
    );
});

// --- 3. 監聽通知點擊事件 ---
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    event.waitUntil(
        (async () => {
            // 點擊後，歸零數字並清除紅點
            await setBadgeCount(0);
            if ('clearAppBadge' in navigator) {
                await navigator.clearAppBadge();
            }

            if (event.action === 'close') return;

            const urlToOpen = event.notification.data.url;
            const windowClients = await clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            });

            // 如果網頁已經開著，直接跳過去
            let matchingClient = null;
            for (let i = 0; i < windowClients.length; i++) {
                if (windowClients[i].url === urlToOpen) {
                    matchingClient = windowClients[i];
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        })()
    );
});

// --- 4. 監聽來自網頁端 (index.html) 的訊息 ---
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'clearBadge') {
        event.waitUntil(
            (async () => {
                // 當使用者直接開啟 App 時，也把數字歸零
                await setBadgeCount(0);
                if ('clearAppBadge' in navigator) {
                    await navigator.clearAppBadge();
                }
            })()
        );
    }
});
