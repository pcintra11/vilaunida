//import styles from "./page.module.css";

import { PWAInstallPrompt, PWAPushNotificationManager } from "./pwa_components";

export default function Page() {
  return (
    <div>
      <div>
        <a href='https://test.vizinet.com.br'>
          página test.vizinet.com.br
        </a>
      </div>
      <div>
        <a href='https://vizinet.com.br'>
          página vizinet.com.br
        </a>
      </div>
      <div>
        <a href='https://vizinet.com.br/manicure_marianne_2024'>
          página vizinet.com.br/manicure_marianne_2024
        </a>
      </div>
      <div>
        <a href='https://vizinet.com.br' rel='noopener noreferrer'>
          página vizinet.com.br noopener noreferrer
        </a>
      </div>

      <PWAPushNotificationManager />
      <PWAInstallPrompt />
    </div>
  );
}
