'use client'

import { useState, useEffect } from 'react';
import { isIOS, isMobile } from 'react-device-detect';
import { subscribeUser, unsubscribeUser, sendNotification } from './pwa_actions';

import { CookieCli } from './libs/cookiesCli';

function isAppInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true // necessário para Safari no iOS //@!!!!!!!!!19 testar
  )
}

let deferredPrompt: any = null;

export function PWAInstallPrompt() {
  //const [appInstalled, setAppInstalled] = useState(isAppInstalled());
  const [showInstallInstruction, setShowInstallInstruction] = useState(false);

  useEffect(() => {
    // setIsIOS( //@!!!!!!!!!!!!!!!19
    //   /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    // );
    //setAppInstalled(isAppInstalled());
    const handler = (e: any) => {
      e.preventDefault(); // para mostrar uma mensagem mais explicativa sobre a importância da instalação
      deferredPrompt = e;
      const cookieInstall = CookieCli.get('installPrompt');
      if (cookieInstall !== 'exibido')
        setShowInstallInstruction(true);
      else
        CookieCli.set('installPrompt', 'exibido', { maxAgeSeconds: 60 }); //@!!!!!!!!!!!19
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isMobile) {
    console.log('PWAInstallPrompt - não é mobile');
    return null;
  }
  if (isAppInstalled()) {
    console.log('PWAInstallPrompt - já instalado'); // testar desinstalar !!!!!!!!19
    return null;
  }

  const handleInstall = async () => {
    console.log('handleInstall - deferredPrompt null?', deferredPrompt == null);
    if (deferredPrompt) {
      deferredPrompt.prompt(); // mostra a mensagem padrão do navegador para instalação
      const result = await deferredPrompt.userChoice;
      console.log('handleInstall - userChoice', result);
      if (result.outcome === 'accepted')
        console.log('Usuário instalou o app');
      deferredPrompt = null;
    }
  }

  // para apple vai mostrar sempre o processo de instalação? @!!!!!!!!!!!!19 (vilhena)
  return (
    <div>
      {showInstallInstruction &&
        <>
          <button onClick={handleInstall}>Adicione a Vizinet na tela principal do celular</button>
          {!isIOS && (
            <p>
              Obs: Para Apple, se o botão acima não funcionar, acione compartilhar
              <span role="img" aria-label="share icon">
                {' '}
                ⎋{' '}
              </span>
              e depois &quot;Adicionar à Tela de Início&quot;
              <span role="img" aria-label="plus icon">
                {' '}
                ➕{' '}
              </span>.
            </p>
          )}
        </>
      }
    </div>
  );
}

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
      //subscribeToPush(); // @!!!!!!!!!!!19 sempre??
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

  async function subscribeToPush() { // depois de 3 tentativas, no opera, ele bloqueia e não permite mais
    console.log('subscribeToPush');
    const registration = await navigator.serviceWorker.ready;
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      console.log('subscribeToPush - sub', sub);
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
      console.log('subscribeToPush ok');
    }
    catch (error: any) {
      alert('Você precisa habilitar as notificações para o site nas configurações do navegador.')
      console.log('subscribeToPush - error', error);
    }
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
          <p>Algumas mensagens da Vizinet merecem sua atenção e vamos notificá-lo por aqui, mas para isso você precisa autorizar.</p>
          <button onClick={subscribeToPush}>Clique aqui para permitir as notificações e confirme no diálogo seguinte.</button>
        </>
      )}
    </div>
  );
}