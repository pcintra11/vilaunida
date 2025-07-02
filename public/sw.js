self.addEventListener('push', function (event) {
  console.log('push event', event);
  if (event.data) {
    const data = event.data.json();
    console.log('push data', data);
    const options = {
      body: data.body,
      icon: '/icon-500x500.png', // data.icon || 
      //badge: '/icon-96x96.png', // '/badge.webp', //@!!!!!!!!!!!!19
      //vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
})
 
self.addEventListener('notificationclick', function (event) {
  console.log('notificationclick - event', event);
  event.notification.close();
  event.waitUntil(clients.openWindow('https://vilaunida.com.br')); // abre o link e remove a notificação
})