import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div>
          <div>links</div>
          <a href="https://test.vizinet.com.br">
            página test.vizinet.com.br
          </a>
          <a href="https://test.vizinet.com.br/vzn/presentation">
            página test.vizinet.com.br/vzn/presentation
          </a>
          <a href="https://test.vizinet.com.br" rel="noopener noreferrer">
            página test.vizinet.com.br noopener noreferrer
          </a>
        </div>
      </div>
    </main>
  );
}
