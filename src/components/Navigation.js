'use client';

import React, { useState } from 'react';
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
  Coins,
  Plus,
  MoreHorizontal,
  X,
  Notebook,
  Briefcase
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './Navigation.module.css';

export default function Navigation({ activeTab, setActiveTab, onOpenAddTransaction }) {
  const { theme, toggleTheme, members, contractorMode } = useStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Giao dịch', icon: ReceiptText },
    { id: 'budgets', label: 'Ngân sách', icon: PieChart },
    { id: 'members', label: 'Thành viên', icon: Users },
    { id: 'savings', label: 'Tiết kiệm', icon: Target },
    { id: 'recurring', label: 'Định kỳ', icon: CalendarClock },
    { id: 'debts', label: 'Khoản nợ', icon: Coins },
    { id: 'huis', label: 'Dây Hụi', icon: Notebook },
    ...(contractorMode ? [{ id: 'projects', label: 'Công trình', icon: Briefcase }] : []),
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  // Mobile main tab bar items (excl. center plus and more button)
  const mobileMainItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Giao dịch', icon: ReceiptText },
    // Center: Plus button (custom action)
    { id: 'budgets', label: 'Ngân sách', icon: PieChart },
    // Right: More menu (opens bottom sheet)
  ];

  const moreItems = [
    { id: 'members', label: 'Thành viên', icon: Users },
    { id: 'savings', label: 'Tiết kiệm', icon: Target },
    { id: 'recurring', label: 'Định kỳ', icon: CalendarClock },
    { id: 'debts', label: 'Khoản nợ', icon: Coins },
    { id: 'huis', label: 'Dây Hụi', icon: Notebook },
    ...(contractorMode ? [{ id: 'projects', label: 'Công trình', icon: Briefcase }] : []),
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const isMoreActive = moreItems.some(item => item.id === activeTab);

  return (
    <>
      {/* Sidebar dành cho máy tính (Desktop Sidebar) */}
      <aside className={`${styles.sidebar} glass-card`}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <circle cx="13" cy="9" r="2.5" />
              <path d="M13 11.5v4.5" />
            </svg>
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
        {/* Tab 1 & Tab 2 */}
        {mobileMainItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMoreOpen(false);
              }}
              className={`${styles.bottomNavItem} ${isActive ? styles.bottomActive : ''}`}
              id={`nav-mobile-${item.id}`}
            >
              <Icon size={20} />
              <span className={styles.bottomLabel}>{item.label}</span>
            </button>
          );
        })}

        {/* Nút cộng thêm giao dịch nhanh ở giữa (FAB) */}
        <button 
          onClick={onOpenAddTransaction}
          className={styles.fabAdd}
          aria-label="Thêm giao dịch"
          id="nav-mobile-add"
        >
          <Plus size={24} color="#ffffff" />
        </button>

        {/* Tab 3 */}
        {mobileMainItems.slice(2, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMoreOpen(false);
              }}
              className={`${styles.bottomNavItem} ${isActive ? styles.bottomActive : ''}`}
              id={`nav-mobile-${item.id}`}
            >
              <Icon size={20} />
              <span className={styles.bottomLabel}>{item.label}</span>
            </button>
          );
        })}

        {/* Tab 4: Tiện ích mở rộng (More) */}
        <button
          onClick={() => setIsMoreOpen(prev => !prev)}
          className={`${styles.bottomNavItem} ${isMoreActive || isMoreOpen ? styles.bottomActive : ''}`}
          id="nav-mobile-more"
        >
          <MoreHorizontal size={20} />
          <span className={styles.bottomLabel}>Tiện ích</span>
        </button>
      </nav>

      {/* Mobile Bottom Sheet Overlay */}
      {isMoreOpen && (
        <div className={styles.overlay} onClick={() => setIsMoreOpen(false)}>
          <div className={`${styles.bottomSheet} glass-card`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.bottomSheetHeader}>
              <div className={styles.dragHandle} />
              <h3 className={styles.bottomSheetTitle}>Tiện ích mở rộng</h3>
              <button className={styles.closeBtn} onClick={() => setIsMoreOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.bottomSheetGrid}>
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`${styles.bottomSheetItem} ${isActive ? styles.sheetItemActive : ''}`}
                    id={`nav-sheet-${item.id}`}
                  >
                    <div className={styles.sheetIconWrapper}>
                      <Icon size={22} />
                    </div>
                    <span className={styles.sheetLabel}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.bottomSheetFooter}>
              {/* Quick theme toggle in sheet */}
              <button 
                onClick={() => {
                  toggleTheme();
                }} 
                className={styles.sheetThemeToggle}
                id="theme-toggle-mobile"
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
