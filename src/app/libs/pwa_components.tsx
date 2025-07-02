'use client'

import { useState, useEffect } from 'react';
import { isIOS, isMobile } from 'react-device-detect';
// import IosShareIcon from '@mui/icons-material/IosShare';
// import IosAdd from '@mui/icons-material/AddBox';

import { subscribeUser, unsubscribeUser, sendNotification } from './pwa_actions';

import { CookieCli } from './cookiesCli';

let deferredPrompt: any = null;

export function PWAInstallPrompt() {
  const [appInstalled, setAppInstalled] = useState(false);
  const [showInstallInstruction, setShowInstallInstruction] = useState(false);

  useEffect(() => {
    // setIsIOS(
    //   /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    // );
    const isAppInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true; // necessário para Safari no iOS //@!!!!!!!!!19 testar
    console.log('isAppInstalled', isAppInstalled);
    setAppInstalled(isAppInstalled);

    const handler = (e: any) => {
      e.preventDefault(); // para mostrar uma mensagem mais explicativa sobre a importância da instalação
      deferredPrompt = e;
      const cookieInstall = CookieCli.get('installPrompt');
      console.log('cookieInstall', cookieInstall);
      if (cookieInstall !== 'exibido') {
        setShowInstallInstruction(true);
        CookieCli.set('installPrompt', 'exibido', { maxAgeSeconds: 60 }); //@!!!!!!!!!!!19
      }
    }
    window.addEventListener('beforeinstallprompt', handler); // esse evento só existe para mobile!
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isMobile) {
    console.log('PWAInstallPrompt - não é mobile');
    return null;
  }
  if (appInstalled) {
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
          {isIOS && (
            <p>
              Em dispositivos Apple, caso o botão acima não funcione, toque em &quot;Compartilhar&quot;
              {' '}
              e selecione &quot;Adicionar à Tela de Início&quot;
              {/* <span role="img" aria-label="plus icon">
                <IosShareIcon />
              </span> */}
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
  const [showSubscriptionCtrl, setShowSubscriptionCtrl] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [appInstalled, setAppInstalled] = useState(false);

  async function checkIsUserSubscribed() {
    console.log('isUserSubscribed');
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setSubscription(subscription);
    console.log('isUserSubscribed - result', subscription != null);
    setShowSubscriptionCtrl(true);
  }

  useEffect(() => {
    const isAppInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true; // necessário para Safari no iOS
    console.log('isAppInstalled', isAppInstalled);
    setAppInstalled(isAppInstalled);

    console.log('serviceWorker', 'serviceWorker' in navigator);
    console.log('PushManager', 'PushManager' in window);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
      //subscribeToPush();
      checkIsUserSubscribed();
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
    console.log('sendTestNotification - subscription', subscription);
    console.log('sendTestNotification - message', message);
    if (subscription != null) {
      try {
        const result = await sendNotification(message);
        console.log('sendTestNotification - ok', result);
        setMessage('');
      }
      catch (error: any) {
        console.log('sendTestNotification - error', error); //@!!!!!!!!!!19
      }
    }
  }

  if (!isSupported)
    return <p>Push notifications are not supported in this browser.</p>

  return (
    <div>
      <h3>Push Notifications</h3>
      {(appInstalled && showSubscriptionCtrl) &&
        <>
          {subscription ? (
            <>
              <div>
                <p>You are subscribed to push notifications.</p>
                &nbsp;
                <button onClick={unsubscribeFromPush}>Unsubscribe</button>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Enter notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                &nbsp;
                <button onClick={sendTestNotification}>Send Test</button>
              </div>
            </>
          ) : (
            <>
              <p>Algumas mensagens da Vizinet merecem sua atenção e vamos notificá-lo por aqui, mas para isso você precisa autorizar.</p>
              <button onClick={subscribeToPush}>Clique aqui para permitir as notificações e confirme no diálogo seguinte.</button>
            </>
          )}
        </>
      }
    </div>
  );
}