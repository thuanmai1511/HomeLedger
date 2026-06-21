'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  Users, 
  Target, 
  CalendarClock, 
  Settings,
  Sun,
  Moon,
  Home,
  Coins
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './Navigation.module.css';

export default function Navigation({ activeTab, setActiveTab }) {
  const { theme, toggleTheme, members } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Giao dịch', icon: ReceiptText },
    { id: 'budgets', label: 'Ngân sách', icon: PieChart },
    { id: 'members', label: 'Thành viên', icon: Users },
    { id: 'savings', label: 'Tiết kiệm', icon: Target },
    { id: 'recurring', label: 'Định kỳ', icon: CalendarClock },
    { id: 'debts', label: 'Khoản nợ', icon: Coins },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <>
      {/* Sidebar dành cho máy tính (Desktop Sidebar) */}
      <aside className={`${styles.sidebar} glass-card`}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <Home size={22} color="var(--primary)" />
          </div>
          <span className={styles.brandName}>HomeLedger</span>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                id={`nav-desktop-${item.id}`}
              >
                <Icon size={20} className={styles.icon} />
                <span className={styles.label}>{item.label}</span>
                {isActive && <div className={styles.activeIndicator} />}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {/* Quick theme toggle */}
          <button 
            onClick={toggleTheme} 
            className={styles.themeToggle}
            aria-label="Toggle Theme"
            id="theme-toggle-desktop"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={18} color="var(--warning)" />
                <span>Giao diện sáng</span>
              </>
            ) : (
              <>
                <Moon size={18} color="var(--text-secondary)" />
                <span>Giao diện tối</span>
              </>
            )}
          </button>
          
          {/* Active family list quick view */}
          <div className={styles.membersQuickView}>
            <p className={styles.quickViewTitle}>Gia đình</p>
            <div className={styles.avatarGroup}>
              {members.slice(0, 4).map((m) => (
                <span 
                  key={m.id} 
                  className={styles.miniAvatar} 
                  style={{ border: `2px solid ${m.color}` }}
                  title={m.name}
                >
                  {m.avatar}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom Nav dành cho điện thoại (Mobile Bottom Nav) */}
      <nav className={`${styles.bottomNav} glass-card`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${styles.bottomNavItem} ${isActive ? styles.bottomActive : ''}`}
              id={`nav-mobile-${item.id}`}
            >
              <Icon size={20} />
              <span className={styles.bottomLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
