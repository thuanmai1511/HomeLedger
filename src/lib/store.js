'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

const INITIAL_MEMBERS = [
  { id: 'm-1', name: 'Bố Minh', role: 'admin', color: '#3b82f6', avatar: '👨' },
  { id: 'm-2', name: 'Mẹ Thảo', role: 'admin', color: '#ec4899', avatar: '👩' },
  { id: 'm-3', name: 'Gia Bảo', role: 'member', color: '#f59e0b', avatar: '👦' }
];

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Ăn uống', icon: 'Utensils', color: '#10b981', budget: 6000000 },
  { id: 'cat-2', name: 'Hóa đơn & Tiền nhà', icon: 'FileText', color: '#8b5cf6', budget: 5000000 },
  { id: 'cat-3', name: 'Di chuyển', icon: 'Car', color: '#3b82f6', budget: 1500000 },
  { id: 'cat-4', name: 'Mua sắm', icon: 'ShoppingBag', color: '#ec4899', budget: 4000000 },
  { id: 'cat-5', name: 'Giải trí', icon: 'Sparkles', color: '#f59e0b', budget: 2000000 },
  { id: 'cat-6', name: 'Sức khỏe', icon: 'HeartPulse', color: '#ef4444', budget: 1000000 },
  { id: 'cat-7', name: 'Khác', icon: 'HelpCircle', color: '#6b7280', budget: 1000000 }
];

const INITIAL_GOALS = [
  { id: 'g-1', name: 'Quỹ du lịch Phú Quốc', target: 20000000, current: 12500000, date: '2026-08-30' },
  { id: 'g-2', name: 'Mua máy giặt mới', target: 12000000, current: 4800000, date: '2026-10-15' }
];

const INITIAL_RECURRING = [
  { id: 'rec-1', name: 'Netflix Premium', amount: 260000, category: 'cat-5', frequency: 'monthly', nextDue: '2026-06-15', memberId: 'm-1' },
  { id: 'rec-2', name: 'Tiền Internet FPT', amount: 250000, category: 'cat-2', frequency: 'monthly', nextDue: '2026-06-20', memberId: 'm-2' },
  { id: 'rec-3', name: 'Đăng ký Spotify', amount: 59000, category: 'cat-5', frequency: 'monthly', nextDue: '2026-06-25', memberId: 'm-3' }
];

const INITIAL_DEBTS = [
  { id: 'd-1', name: 'Cô Út (Sửa bếp)', amount: 10000000, paidAmount: 4000000, dueDate: '2026-09-15', type: 'debt', status: 'active' },
  { id: 'd-2', name: 'Chú Tuấn (Mượn mua điện thoại)', amount: 5000000, paidAmount: 2000000, dueDate: '2026-07-30', type: 'loan', status: 'active' }
];

const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const INITIAL_TRANSACTIONS = [
  { id: 't-1', description: 'Lương tháng Bố Minh', amount: 25000000, category: 'income', date: getPastDate(1), memberId: 'm-1', type: 'income', notes: 'Lương công ty chuyển khoản' },
  { id: 't-2', description: 'Thu nhập từ bán hàng online Mẹ Thảo', amount: 8000000, category: 'income', date: getPastDate(3), memberId: 'm-2', type: 'income', notes: 'Tiền lãi đợt hàng mỹ phẩm' },
  { id: 't-3', description: 'Đi siêu thị Coopmart mua đồ ăn tuần', amount: 1250000, category: 'cat-1', date: getPastDate(0), memberId: 'm-2', type: 'expense', notes: 'Thịt cá, rau củ, đồ gia dụng nhỏ' },
  { id: 't-4', description: 'Thanh toán tiền điện tháng 5', amount: 1850000, category: 'cat-2', date: getPastDate(2), memberId: 'm-1', type: 'expense', notes: 'Nắng nóng dùng nhiều điều hòa' },
  { id: 't-5', description: 'Đổ xăng ô tô gia đình', amount: 800000, category: 'cat-3', date: getPastDate(2), memberId: 'm-1', type: 'expense', notes: 'Xăng RON 95' },
  { id: 't-6', description: 'Mua giày thể thao mới cho Bảo', amount: 1200000, category: 'cat-4', date: getPastDate(4), memberId: 'm-2', type: 'expense', notes: 'Giày chạy bộ Thượng Đình cao cấp' },
  { id: 't-7', description: 'Gia đình ăn tối nhà hàng lẩu', amount: 1500000, category: 'cat-1', date: getPastDate(5), memberId: 'm-1', type: 'expense', notes: 'Mừng sinh nhật Gia Bảo' },
  { id: 't-8', description: 'Tiền nước sinh hoạt', amount: 280000, category: 'cat-2', date: getPastDate(6), memberId: 'm-2', type: 'expense', notes: 'Hóa đơn nước' },
  { id: 't-9', description: 'Nạp thẻ điện thoại Gia Bảo', amount: 100000, category: 'cat-3', date: getPastDate(7), memberId: 'm-3', type: 'expense', notes: 'Viettel trả trước' },
  { id: 't-10', description: 'Mua thuốc bổ và vitamin', amount: 650000, category: 'cat-6', date: getPastDate(8), memberId: 'm-2', type: 'expense', notes: 'Mua tại hiệu thuốc Pharmacity' },
  { id: 't-11', description: 'Xem phim rạp CGV cả nhà', amount: 480000, category: 'cat-5', date: getPastDate(10), memberId: 'm-3', type: 'expense', notes: 'Xem phim hoạt hình Doraemon' },
  { id: 't-12', description: 'Mua sách tham khảo lớp 7', amount: 350000, category: 'cat-4', date: getPastDate(12), memberId: 'm-3', type: 'expense', notes: 'Sách Toán, Văn nâng cao' }
];

export function StoreProvider({ children }) {
  // Always initialize with SSR defaults to prevent hydration mismatch
  const [appState, setAppState] = useState({
    members: INITIAL_MEMBERS,
    categories: INITIAL_CATEGORIES,
    transactions: INITIAL_TRANSACTIONS,
    goals: INITIAL_GOALS,
    recurring: INITIAL_RECURRING,
    debts: INITIAL_DEBTS,
    theme: 'dark'
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronize and load actual client storage data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMembers = localStorage.getItem('hl_members');
      const savedCategories = localStorage.getItem('hl_categories');
      const savedTransactions = localStorage.getItem('hl_transactions');
      const savedGoals = localStorage.getItem('hl_goals');
      const savedRecurring = localStorage.getItem('hl_recurring');
      const savedDebts = localStorage.getItem('hl_debts');
      const savedTheme = localStorage.getItem('hl_theme');

      const nextMembers = savedMembers ? JSON.parse(savedMembers) : INITIAL_MEMBERS;
      const nextCategories = savedCategories ? JSON.parse(savedCategories) : INITIAL_CATEGORIES;
      const nextTransactions = savedTransactions ? JSON.parse(savedTransactions) : INITIAL_TRANSACTIONS;
      const nextGoals = savedGoals ? JSON.parse(savedGoals) : INITIAL_GOALS;
      const nextRecurring = savedRecurring ? JSON.parse(savedRecurring) : INITIAL_RECURRING;
      const nextDebts = savedDebts ? JSON.parse(savedDebts) : INITIAL_DEBTS;
      const nextTheme = savedTheme || 'dark';

      if (!savedMembers) localStorage.setItem('hl_members', JSON.stringify(INITIAL_MEMBERS));
      if (!savedCategories) localStorage.setItem('hl_categories', JSON.stringify(INITIAL_CATEGORIES));
      if (!savedTransactions) localStorage.setItem('hl_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      if (!savedGoals) localStorage.setItem('hl_goals', JSON.stringify(INITIAL_GOALS));
      if (!savedRecurring) localStorage.setItem('hl_recurring', JSON.stringify(INITIAL_RECURRING));
      if (!savedDebts) localStorage.setItem('hl_debts', JSON.stringify(INITIAL_DEBTS));
      if (!savedTheme) localStorage.setItem('hl_theme', nextTheme);

      document.documentElement.setAttribute('data-theme', nextTheme);
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppState({
        members: nextMembers,
        categories: nextCategories,
        transactions: nextTransactions,
        goals: nextGoals,
        recurring: nextRecurring,
        debts: nextDebts,
        theme: nextTheme
      });
      setIsLoaded(true);
    }
  }, []);

  const toggleTheme = () => {
    setAppState(prev => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('hl_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { ...prev, theme: nextTheme };
    });
  };

  // 1. Transactions Actions
  const addTransaction = (t) => {
    const newT = { ...t, id: 't-' + Date.now() };
    setAppState(prev => {
      const updated = [newT, ...prev.transactions];
      localStorage.setItem('hl_transactions', JSON.stringify(updated));
      return { ...prev, transactions: updated };
    });
  };

  const updateTransaction = (updatedT) => {
    setAppState(prev => {
      const updated = prev.transactions.map(t => t.id === updatedT.id ? updatedT : t);
      localStorage.setItem('hl_transactions', JSON.stringify(updated));
      return { ...prev, transactions: updated };
    });
  };

  const deleteTransaction = (id) => {
    setAppState(prev => {
      const updated = prev.transactions.filter(t => t.id !== id);
      localStorage.setItem('hl_transactions', JSON.stringify(updated));
      return { ...prev, transactions: updated };
    });
  };

  // 2. Budget Actions
  const updateCategoryBudget = (catId, newBudget) => {
    setAppState(prev => {
      const updated = prev.categories.map(c => c.id === catId ? { ...c, budget: Number(newBudget) } : c);
      localStorage.setItem('hl_categories', JSON.stringify(updated));
      return { ...prev, categories: updated };
    });
  };

  // 3. Member Actions
  const addMember = (m) => {
    const newM = { ...m, id: 'm-' + Date.now() };
    setAppState(prev => {
      const updated = [...prev.members, newM];
      localStorage.setItem('hl_members', JSON.stringify(updated));
      return { ...prev, members: updated };
    });
  };

  const updateMember = (updatedM) => {
    setAppState(prev => {
      const updated = prev.members.map(m => m.id === updatedM.id ? updatedM : m);
      localStorage.setItem('hl_members', JSON.stringify(updated));
      return { ...prev, members: updated };
    });
  };

  const deleteMember = (id) => {
    setAppState(prev => {
      if (prev.members.length <= 1) return prev;
      const updated = prev.members.filter(m => m.id !== id);
      localStorage.setItem('hl_members', JSON.stringify(updated));
      return { ...prev, members: updated };
    });
  };

  // 4. Savings Goals Actions
  const addGoal = (g) => {
    const newG = { ...g, id: 'g-' + Date.now(), current: Number(g.current) || 0, target: Number(g.target) };
    setAppState(prev => {
      const updated = [...prev.goals, newG];
      localStorage.setItem('hl_goals', JSON.stringify(updated));
      return { ...prev, goals: updated };
    });
  };

  const updateGoal = (updatedG) => {
    setAppState(prev => {
      const updated = prev.goals.map(g => g.id === updatedG.id ? { ...updatedG, target: Number(updatedG.target), current: Number(updatedG.current) } : g);
      localStorage.setItem('hl_goals', JSON.stringify(updated));
      return { ...prev, goals: updated };
    });
  };

  const deleteGoal = (id) => {
    setAppState(prev => {
      const updated = prev.goals.filter(g => g.id !== id);
      localStorage.setItem('hl_goals', JSON.stringify(updated));
      return { ...prev, goals: updated };
    });
  };

  // 5. Recurring Expenses Actions
  const addRecurring = (rec) => {
    const newRec = { ...rec, id: 'rec-' + Date.now(), amount: Number(rec.amount) };
    setAppState(prev => {
      const updated = [...prev.recurring, newRec];
      localStorage.setItem('hl_recurring', JSON.stringify(updated));
      return { ...prev, recurring: updated };
    });
  };

  const deleteRecurring = (id) => {
    setAppState(prev => {
      const updated = prev.recurring.filter(r => r.id !== id);
      localStorage.setItem('hl_recurring', JSON.stringify(updated));
      return { ...prev, recurring: updated };
    });
  };

  const triggerRecurringExpense = (rec) => {
    setAppState(prev => {
      const newT = {
        id: 't-' + Date.now(),
        description: `[Định kỳ] ${rec.name}`,
        amount: rec.amount,
        category: rec.category,
        date: new Date().toISOString().split('T')[0],
        memberId: rec.memberId || prev.members[0]?.id || 'm-1',
        type: 'expense',
        notes: `Thanh toán định kỳ phát sinh tự động`
      };

      const nextDate = rec.nextDue ? new Date(rec.nextDue) : new Date();
      if (isNaN(nextDate.getTime())) {
        nextDate.setTime(Date.now());
      }
      nextDate.setMonth(nextDate.getMonth() + 1);
      const formattedNextDate = nextDate.toISOString().split('T')[0];

      const updatedRecurring = prev.recurring.map(r => r.id === rec.id ? { ...r, nextDue: formattedNextDate } : r);
      const updatedTransactions = [newT, ...prev.transactions];

      localStorage.setItem('hl_recurring', JSON.stringify(updatedRecurring));
      localStorage.setItem('hl_transactions', JSON.stringify(updatedTransactions));

      return {
        ...prev,
        recurring: updatedRecurring,
        transactions: updatedTransactions
      };
    });
  };

  // 6. Debts Actions
  const addDebt = (d) => {
    const newD = { 
      ...d, 
      id: 'd-' + Date.now(), 
      amount: Number(d.amount), 
      paidAmount: Number(d.paidAmount) || 0, 
      status: Number(d.paidAmount) >= Number(d.amount) ? 'completed' : 'active' 
    };
    setAppState(prev => {
      const updated = [...prev.debts, newD];
      localStorage.setItem('hl_debts', JSON.stringify(updated));
      return { ...prev, debts: updated };
    });
  };

  const deleteDebt = (id) => {
    setAppState(prev => {
      const updated = prev.debts.filter(d => d.id !== id);
      localStorage.setItem('hl_debts', JSON.stringify(updated));
      return { ...prev, debts: updated };
    });
  };

  const payDebt = (id, amt, autoLog) => {
    setAppState(prev => {
      const targetDebt = prev.debts.find(d => d.id === id);
      if (!targetDebt) return prev;

      const nextPaid = Number(targetDebt.paidAmount) + Number(amt);
      const completed = nextPaid >= targetDebt.amount;

      const updatedDebts = prev.debts.map(d => d.id === id ? {
        ...d,
        paidAmount: nextPaid,
        status: completed ? 'completed' : 'active'
      } : d);

      localStorage.setItem('hl_debts', JSON.stringify(updatedDebts));

      if (autoLog) {
        const isExpense = targetDebt.type === 'debt';
        const newT = {
          id: 't-' + Date.now(),
          description: isExpense ? `[Trả nợ] ${targetDebt.name}` : `[Thu hồi nợ] ${targetDebt.name}`,
          amount: Number(amt),
          category: isExpense ? 'cat-7' : 'income',
          date: new Date().toISOString().split('T')[0],
          memberId: prev.members[0]?.id || 'm-1',
          type: isExpense ? 'expense' : 'income',
          notes: isExpense ? `Thanh toán nợ cho ${targetDebt.name}` : `Thu hồi khoản cho ${targetDebt.name} vay`
        };

        const updatedTransactions = [newT, ...prev.transactions];
        localStorage.setItem('hl_transactions', JSON.stringify(updatedTransactions));

        return {
          ...prev,
          debts: updatedDebts,
          transactions: updatedTransactions
        };
      }

      return {
        ...prev,
        debts: updatedDebts
      };
    });
  };

  // 7. Reset & Import/Export Data
  const resetAllData = () => {
    localStorage.removeItem('hl_members');
    localStorage.removeItem('hl_categories');
    localStorage.removeItem('hl_transactions');
    localStorage.removeItem('hl_goals');
    localStorage.removeItem('hl_recurring');
    localStorage.removeItem('hl_debts');
    
    setAppState({
      members: INITIAL_MEMBERS,
      categories: INITIAL_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      goals: INITIAL_GOALS,
      recurring: INITIAL_RECURRING,
      debts: INITIAL_DEBTS,
      theme: appState.theme
    });
  };

  const clearAllData = () => {
    const defaultMember = [{ id: 'm-1', name: 'Thành viên 1', role: 'admin', color: '#3b82f6', avatar: '👨' }];
    const defaultCategories = INITIAL_CATEGORIES.map(c => ({ ...c, budget: 0 }));

    localStorage.setItem('hl_members', JSON.stringify(defaultMember));
    localStorage.setItem('hl_categories', JSON.stringify(defaultCategories));
    localStorage.removeItem('hl_transactions');
    localStorage.removeItem('hl_goals');
    localStorage.removeItem('hl_recurring');
    localStorage.removeItem('hl_debts');
    
    setAppState({
      members: defaultMember,
      categories: defaultCategories,
      transactions: [],
      goals: [],
      recurring: [],
      debts: [],
      theme: appState.theme
    });
  };

  const importAllData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const nextState = { ...appState };
      
      if (data.members) {
        nextState.members = data.members;
        localStorage.setItem('hl_members', JSON.stringify(data.members));
      }
      if (data.categories) {
        nextState.categories = data.categories;
        localStorage.setItem('hl_categories', JSON.stringify(data.categories));
      }
      if (data.transactions) {
        nextState.transactions = data.transactions;
        localStorage.setItem('hl_transactions', JSON.stringify(data.transactions));
      }
      if (data.goals) {
        nextState.goals = data.goals;
        localStorage.setItem('hl_goals', JSON.stringify(data.goals));
      }
      if (data.recurring) {
        nextState.recurring = data.recurring;
        localStorage.setItem('hl_recurring', JSON.stringify(data.recurring));
      }
      if (data.debts) {
        nextState.debts = data.debts;
        localStorage.setItem('hl_debts', JSON.stringify(data.debts));
      }
      
      setAppState(nextState);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <StoreContext.Provider value={{
      isLoaded,
      members: appState.members,
      categories: appState.categories,
      transactions: appState.transactions,
      goals: appState.goals,
      recurring: appState.recurring,
      debts: appState.debts,
      theme: appState.theme,
      toggleTheme,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateCategoryBudget,
      addMember,
      updateMember,
      deleteMember,
      addGoal,
      updateGoal,
      deleteGoal,
      addRecurring,
      deleteRecurring,
      triggerRecurringExpense,
      addDebt,
      deleteDebt,
      payDebt,
      resetAllData,
      clearAllData,
      importAllData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
