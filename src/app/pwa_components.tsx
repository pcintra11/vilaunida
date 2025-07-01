'use client'

import { useState, useEffect } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification } from './pwa_actions';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function PWAPushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('serviceWorker', 'serviceWorker' in navigator);
    console.log('PushManager', 'PushManager' in window);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
      subscribeToPush(); // @!!!!!!!!!!!19 sempre??
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const sub = await registration.pushManager.getSubscription();
    console.log('getSubscription - sub', sub);
    setSubscription(sub);
  }

  async function subscribeToPush() {
    console.log('subscribeToPush');
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
    console.log('subscribeToPush ok');
  }

  async function unsubscribeFromPush() {
    console.log('unsubscribeFromPush');
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
    console.log('unsubscribeFromPush - ok');
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage('');
    }
  }

  if (!isSupported)
    return <p>Push notifications are not supported in this browser.</p>

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test</button>
        </>
      ) : (
        <>
          {/* <p>You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush}>Subscribe</button> */}
        </>
      )}
    </div>
  );
}

let deferredPrompt: any = null;

export function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    setIsIOS( //@!!!!!!!!!!!!!!!19
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setShowInstallButton(true);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [])

  const handleInstall = async () => {
    console.log('handleInstall - deferredPrompt null', deferredPrompt == null);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      console.log('handleInstall - userChoice', result);
      if (result.outcome === 'accepted')
        console.log('Usuário instalou o app');
      deferredPrompt = null;
    }
  }

  if (isStandalone)
    return null; // Don't show install button if already installed

  return (
    <div>
      <h3>Install App</h3>
      {showInstallButton &&
        <button onClick={handleInstall}>Add to Home Screen</button>
      }
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then &quot;Add to Home Screen&quot;
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>.
        </p>
      )}
    </div>
  );
}