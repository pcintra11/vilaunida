'use server'
 
import webpush from 'web-push';
 
webpush.setVapidDetails(
  'mailto:XXXXpcintra1@gmail.com', //@!!!!!!!!!!!!19 ??
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);
 
let subscription: PushSubscription | null = null;
 
export async function subscribeUser(sub: PushSubscription) {
  console.log('subscribeUser - subscription', sub);
  subscription = sub;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}
 
export async function unsubscribeUser() {
  console.log('unsubscribeUser - subscription', subscription);
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}
 
export async function sendNotification(message: string) {
  console.log('sendNotification - subscription', subscription);
  if (!subscription)
    throw new Error('No subscription available');

  console.log('sendNotification');
  const subscriptionJSON = JSON.stringify(subscription);
 
  try {
    await webpush.sendNotification(
      JSON.parse(subscriptionJSON),
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon-96x96.png', // é o ícone que aparece na barra de status do celular, lá no topo E ao lado direito da notificação no computador
      })
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}