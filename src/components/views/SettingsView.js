'use client';

import React from 'react';
import { 
  Sun, 
  Moon
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './SettingsView.module.css';

export default function SettingsView() {
  const { 
    theme, 
    toggleTheme
  } = useStore();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Thiết lập hệ thống</h1>
          <p className={styles.subtitle}>Tùy chỉnh chủ đề giao diện hiển thị sáng hoặc tối cho ứng dụng.</p>
        </div>
      </header>

      {/* Main Settings Grid */}
      <section className={styles.grid}>
        {/* Theme Settings */}
        <div className={`${styles.settingCard} glass-card`}>
          <h3 className={styles.cardTitle}>Giao diện hiển thị</h3>
          <p className={styles.cardDesc}>Chuyển đổi giữa chế độ tối hiện đại và chế độ sáng trực quan.</p>
          
          <div className={styles.themeToggleGroup}>
            <button 
              onClick={() => theme !== 'light' && toggleTheme()} 
              className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
              id="theme-btn-light"
            >
              <Sun size={18} />
              <span>Giao diện sáng</span>
            </button>
            
            <button 
              onClick={() => theme !== 'dark' && toggleTheme()} 
              className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
              id="theme-btn-dark"
            >
              <Moon size={18} />
              <span>Giao diện tối</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

