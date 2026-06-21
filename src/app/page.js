'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import Navigation from '@/components/Navigation';
import DashboardView from '@/components/views/DashboardView';
import TransactionsView from '@/components/views/TransactionsView';
import BudgetsView from '@/components/views/BudgetsView';
import MembersView from '@/components/views/MembersView';
import SavingsView from '@/components/views/SavingsView';
import RecurringView from '@/components/views/RecurringView';
import SettingsView from '@/components/views/SettingsView';
import DebtsView from '@/components/views/DebtsView';
import HuiView from '@/components/views/HuiView';
import TransactionModal from '@/components/TransactionModal';
import styles from './page.module.css';

export default function Home() {
  const { isLoaded } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Đang tải dữ liệu HomeLedger...</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddTransactionOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTransaction(t);
    setIsAddTransactionOpen(true);
  };

  // Render active tab view
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            onNavigateToTab={setActiveTab} 
            onOpenAddTransaction={handleOpenAdd} 
          />
        );
      case 'transactions':
        return (
          <TransactionsView 
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
          />
        );
      case 'budgets':
        return <BudgetsView />;
      case 'members':
        return <MembersView />;
      case 'savings':
        return <SavingsView />;
      case 'recurring':
        return <RecurringView />;
      case 'debts':
        return <DebtsView />;
      case 'huis':
        return <HuiView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView 
            onNavigateToTab={setActiveTab} 
            onOpenAddTransaction={handleOpenAdd} 
          />
        );
    }
  };

  return (
    <div className={styles.appContainer}>
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAddTransaction={handleOpenAdd} 
      />
      
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {renderView()}
        </div>
      </main>

      {/* Global Transaction Modal */}
      <TransactionModal 
        key={isAddTransactionOpen ? (editingTransaction?.id || 'new') : 'closed'}
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
