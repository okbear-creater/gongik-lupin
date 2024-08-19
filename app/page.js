'use client';

import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/chat');
  };

  return (
    <main className={styles.main}>
      <video autoPlay muted loop className={styles.backgroundVideo}>
        <source src="/bg_vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={styles.overlay}></div>
      <div className={styles.textContainer}>
        <p className={`${styles.intro} ${styles.animateBottom}`}>나의 병역 신체검사 결과를 예측하는 AI</p>
        <h1 className={`${styles.title} ${styles.animateBottom}`}>공익루팡AI</h1>
        <p className={`${styles.description} ${styles.animateBottom}`}>
        내가 겪었던 증상이나 건강 상태를 입력하고, 최신 병역 기준을 반영한 AI로 나의 공익 여부를 판단해봐요.
        </p>
        <button 
          className={`${styles.startButton} ${styles.animateBottom}`}
          onClick={handleStartClick}
        >
          판정 시작
        </button>
      </div>
    </main>
  );
}