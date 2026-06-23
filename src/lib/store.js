'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

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
  const [appState, setAppState] = useState({
    members: INITIAL_MEMBERS,
    categories: INITIAL_CATEGORIES,
    transactions: INITIAL_TRANSACTIONS,
    goals: INITIAL_GOALS,
    recurring: INITIAL_RECURRING,
    debts: INITIAL_DEBTS,
    huis: [],
    projects: [],
    contractorMode: false,
    theme: 'dark'
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (supabase) {
        try {
          const [
            resMembers,
            resCategories,
            resTransactions,
            resGoals,
            resRecurring,
            resDebts,
            resHuis,
            resProjects
          ] = await Promise.all([
            supabase.from('members').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('transactions').select('*').order('date', { ascending: false }),
            supabase.from('goals').select('*'),
            supabase.from('recurring').select('*'),
            supabase.from('debts').select('*'),
            supabase.from('huis').select('*'),
            supabase.from('projects').select('*')
          ]);

          if (resMembers.error) throw resMembers.error;
          if (resCategories.error) throw resCategories.error;
          if (resTransactions.error) throw resTransactions.error;
          if (resGoals.error) throw resGoals.error;
          if (resRecurring.error) throw resRecurring.error;
          if (resDebts.error) throw resDebts.error;
          if (resHuis.error) throw resHuis.error;
          if (resProjects.error) throw resProjects.error;

          let fetchedMembers = resMembers.data || [];
          let fetchedCategories = resCategories.data || [];
          let fetchedTransactions = resTransactions.data || [];
          let fetchedGoals = resGoals.data || [];
          let fetchedRecurring = resRecurring.data || [];
          let fetchedDebts = resDebts.data || [];
          let fetchedHuis = resHuis.data || [];
          let fetchedProjects = resProjects.data || [];

          if (fetchedMembers.length === 0 && fetchedCategories.length === 0) {
            console.log("Database trống, đang khởi tạo dữ liệu mẫu lên Supabase...");
            
            const dbSampleTransactions = INITIAL_TRANSACTIONS.map(t => {
              const dbT = { ...t, memberid: t.memberId };
              delete dbT.memberId;
              return dbT;
            });
            const dbSampleRecurring = INITIAL_RECURRING.map(r => {
              const dbR = { ...r, nextdue: r.nextDue, memberid: r.memberId };
              delete dbR.nextDue;
              delete dbR.memberId;
              return dbR;
            });
            const dbSampleDebts = INITIAL_DEBTS.map(d => {
              const dbD = { ...d, paidamount: d.paidAmount, duedate: d.dueDate };
              delete dbD.paidAmount;
              delete dbD.dueDate;
              return dbD;
            });

            await Promise.all([
              supabase.from('members').insert(INITIAL_MEMBERS),
              supabase.from('categories').insert(INITIAL_CATEGORIES),
              supabase.from('goals').insert(INITIAL_GOALS),
              supabase.from('recurring').insert(dbSampleRecurring),
              supabase.from('debts').insert(dbSampleDebts),
              supabase.from('transactions').insert(dbSampleTransactions)
            ]);
            fetchedMembers = INITIAL_MEMBERS;
            fetchedCategories = INITIAL_CATEGORIES;
            fetchedTransactions = INITIAL_TRANSACTIONS;
            fetchedGoals = INITIAL_GOALS;
            fetchedRecurring = INITIAL_RECURRING;
            fetchedDebts = INITIAL_DEBTS;
          } else {
            // Map DB lowercase columns to camelCase for the frontend
            fetchedTransactions = fetchedTransactions.map(t => ({
              ...t,
              memberId: t.memberid
            }));
            fetchedHuis = fetchedHuis.map(h => ({
              ...h,
              totalShares: h.totalshares,
              startDate: h.startdate,
              roundsData: h.roundsdata || []
            }));
            fetchedRecurring = fetchedRecurring.map(r => ({
              ...r,
              nextDue: r.nextdue,
              memberId: r.memberid
            }));
            fetchedDebts = fetchedDebts.map(d => ({
              ...d,
              paidAmount: d.paidamount,
              dueDate: d.duedate
            }));
            fetchedProjects = fetchedProjects.map(p => ({
              ...p,
              contractValue: Number(p.contractvalue),
              startDate: p.startdate,
              endDate: p.enddate
            }));
          }

          const savedTheme = localStorage.getItem('hl_theme') || 'dark';
          document.documentElement.setAttribute('data-theme', savedTheme);

          // Sync local storage projects if Supabase is empty
          let finalProjects = [];
          if (fetchedProjects.length > 0) {
            finalProjects = fetchedProjects;
            localStorage.setItem('hl_projects', JSON.stringify(finalProjects));
          } else {
            const savedProjects = localStorage.getItem('hl_projects');
            finalProjects = savedProjects ? JSON.parse(savedProjects) : [];
            if (finalProjects.length > 0) {
              const dbProjects = finalProjects.map(p => ({
                id: p.id,
                name: p.name,
                client: p.client,
                location: p.location,
                contractvalue: p.contractValue,
                startdate: p.startDate,
                enddate: p.endDate,
                status: p.status,
                payments: p.payments || [],
                expenses: p.expenses || []
              }));
              await supabase.from('projects').insert(dbProjects);
            }
          }

          const contractorMode = localStorage.getItem('hl_contractor_mode') === 'true';

          setAppState({
            members: fetchedMembers,
            categories: fetchedCategories,
            transactions: fetchedTransactions,
            goals: fetchedGoals,
            recurring: fetchedRecurring,
            debts: fetchedDebts,
            huis: fetchedHuis,
            projects: finalProjects,
            contractorMode,
            theme: savedTheme
          });
          setIsLoaded(true);
        } catch (error) {
          console.error("Lỗi nghiêm trọng khi tải dữ liệu từ Supabase:", error);
          setIsLoaded(true);
        }
      } else {
        console.error("Supabase chưa được cấu hình. Vui lòng kiểm tra file .env.local.");
        
        const savedTheme = localStorage.getItem('hl_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const savedProjects = localStorage.getItem('hl_projects');
        const parsedProjects = savedProjects ? JSON.parse(savedProjects) : [];
        const contractorMode = localStorage.getItem('hl_contractor_mode') === 'true';

        setAppState({
          members: INITIAL_MEMBERS,
          categories: INITIAL_CATEGORIES,
          transactions: INITIAL_TRANSACTIONS,
          goals: INITIAL_GOALS,
          recurring: INITIAL_RECURRING,
          debts: INITIAL_DEBTS,
          huis: [],
          projects: parsedProjects,
          contractorMode,
          theme: savedTheme
        });
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  const toggleTheme = () => {
    setAppState(prev => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('hl_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { ...prev, theme: nextTheme };
    });
  };

  const addTransaction = async (t) => {
    const newT = { ...t, id: 't-' + Date.now() };
    setAppState(prev => ({ ...prev, transactions: [newT, ...prev.transactions] }));

    if (supabase) {
      const dbT = { ...newT, memberid: newT.memberId };
      delete dbT.memberId;
      const { error } = await supabase.from('transactions').insert(dbT);
      if (error) console.error("Lỗi khi thêm giao dịch vào Supabase:", error);
    }
  };

  const updateTransaction = async (updatedT) => {
    setAppState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === updatedT.id ? updatedT : t)
    }));

    if (supabase) {
      const dbT = { ...updatedT, memberid: updatedT.memberId };
      delete dbT.memberId;
      const { error } = await supabase.from('transactions').update(dbT).eq('id', updatedT.id);
      if (error) console.error("Lỗi khi cập nhật giao dịch trên Supabase:", error);
    }
  };

  const deleteTransaction = async (id) => {
    setAppState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));

    if (supabase) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) console.error("Lỗi khi xóa giao dịch trên Supabase:", error);
    }
  };

  const updateCategoryBudget = async (catId, newBudget) => {
    const budgetVal = Number(newBudget);
    setAppState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, budget: budgetVal } : c)
    }));

    if (supabase) {
      const { error } = await supabase.from('categories').update({ budget: budgetVal }).eq('id', catId);
      if (error) console.error("Lỗi khi cập nhật ngân sách trên Supabase:", error);
    }
  };

  const addMember = async (m) => {
    const newM = { ...m, id: 'm-' + Date.now() };
    setAppState(prev => ({ ...prev, members: [...prev.members, newM] }));

    if (supabase) {
      const { error } = await supabase.from('members').insert(newM);
      if (error) console.error("Lỗi khi thêm thành viên vào Supabase:", error);
    }
  };

  const updateMember = async (updatedM) => {
    setAppState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === updatedM.id ? updatedM : m)
    }));

    if (supabase) {
      const { error } = await supabase.from('members').update(updatedM).eq('id', updatedM.id);
      if (error) console.error("Lỗi khi cập nhật thành viên trên Supabase:", error);
    }
  };

  const deleteMember = async (id) => {
    let canDelete = true;
    setAppState(prev => {
      if (prev.members.length <= 1) {
        canDelete = false;
        return prev;
      }
      const updated = prev.members.filter(m => m.id !== id);
      return { ...prev, members: updated };
    });

    if (supabase && canDelete) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) console.error("Lỗi khi xóa thành viên trên Supabase:", error);
    }
  };

  const addGoal = async (g) => {
    const newG = { ...g, id: 'g-' + Date.now(), current: Number(g.current) || 0, target: Number(g.target) };
    setAppState(prev => ({ ...prev, goals: [...prev.goals, newG] }));

    if (supabase) {
      const { error } = await supabase.from('goals').insert(newG);
      if (error) console.error("Lỗi khi thêm mục tiêu vào Supabase:", error);
    }
  };

  const updateGoal = async (updatedG) => {
    const formatted = { ...updatedG, target: Number(updatedG.target), current: Number(updatedG.current) };
    setAppState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === updatedG.id ? formatted : g)
    }));

    if (supabase) {
      const { error } = await supabase.from('goals').update(formatted).eq('id', updatedG.id);
      if (error) console.error("Lỗi khi cập nhật mục tiêu trên Supabase:", error);
    }
  };

  const deleteGoal = async (id) => {
    setAppState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));

    if (supabase) {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) console.error("Lỗi khi xóa mục tiêu trên Supabase:", error);
    }
  };

  const addRecurring = async (rec) => {
    const newRec = { ...rec, id: 'rec-' + Date.now(), amount: Number(rec.amount) };
    setAppState(prev => ({ ...prev, recurring: [...prev.recurring, newRec] }));

    if (supabase) {
      const dbRec = { ...newRec, nextdue: newRec.nextDue, memberid: newRec.memberId };
      delete dbRec.nextDue;
      delete dbRec.memberId;
      const { error } = await supabase.from('recurring').insert(dbRec);
      if (error) console.error("Lỗi khi thêm chi tiêu định kỳ vào Supabase:", error);
    }
  };

  const deleteRecurring = async (id) => {
    setAppState(prev => ({
      ...prev,
      recurring: prev.recurring.filter(r => r.id !== id)
    }));

    if (supabase) {
      const { error } = await supabase.from('recurring').delete().eq('id', id);
      if (error) console.error("Lỗi khi xóa chi tiêu định kỳ trên Supabase:", error);
    }
  };

  const triggerRecurringExpense = async (rec) => {
    let newT = null;
    let updatedRecurring = [];
    let updatedTransactions = [];

    setAppState(prev => {
      newT = {
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

      updatedRecurring = prev.recurring.map(r => r.id === rec.id ? { ...r, nextDue: formattedNextDate } : r);
      updatedTransactions = [newT, ...prev.transactions];

      return {
        ...prev,
        recurring: updatedRecurring,
        transactions: updatedTransactions
      };
    });

    if (supabase) {
      const nextDate = rec.nextDue ? new Date(rec.nextDue) : new Date();
      if (isNaN(nextDate.getTime())) {
        nextDate.setTime(Date.now());
      }
      nextDate.setMonth(nextDate.getMonth() + 1);
      const formattedNextDate = nextDate.toISOString().split('T')[0];

      const dbT = { ...newT, memberid: newT.memberId };
      delete dbT.memberId;

      await Promise.all([
        supabase.from('recurring').update({ nextdue: formattedNextDate }).eq('id', rec.id),
        supabase.from('transactions').insert(dbT)
      ]);
    }
  };

  const addDebt = async (d) => {
    const newD = { 
      ...d, 
      id: 'd-' + Date.now(), 
      amount: Number(d.amount), 
      paidAmount: Number(d.paidAmount) || 0, 
      status: Number(d.paidAmount) >= Number(d.amount) ? 'completed' : 'active' 
    };
    setAppState(prev => ({ ...prev, debts: [...prev.debts, newD] }));

    if (supabase) {
      const dbD = { ...newD, paidamount: newD.paidAmount, duedate: newD.dueDate };
      delete dbD.paidAmount;
      delete dbD.dueDate;
      const { error } = await supabase.from('debts').insert(dbD);
      if (error) console.error("Lỗi khi thêm khoản nợ vào Supabase:", error);
    }
  };

  const deleteDebt = async (id) => {
    setAppState(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));

    if (supabase) {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) console.error("Lỗi khi xóa khoản nợ trên Supabase:", error);
    }
  };

  const payDebt = async (id, amt, autoLog) => {
    let newT = null;
    let targetDebtObj = null;

    setAppState(prev => {
      const targetDebt = prev.debts.find(d => d.id === id);
      if (!targetDebt) return prev;

      targetDebtObj = targetDebt;
      const nextPaid = Number(targetDebt.paidAmount) + Number(amt);
      const completed = nextPaid >= targetDebt.amount;

      const updatedDebts = prev.debts.map(d => d.id === id ? {
        ...d,
        paidAmount: nextPaid,
        status: completed ? 'completed' : 'active'
      } : d);

      if (autoLog) {
        const isExpense = targetDebt.type === 'debt';
        newT = {
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

    if (supabase && targetDebtObj) {
      const nextPaid = Number(targetDebtObj.paidAmount) + Number(amt);
      const completed = nextPaid >= targetDebtObj.amount;
      
      const dbPromises = [
        supabase.from('debts').update({
          paidamount: nextPaid,
          status: completed ? 'completed' : 'active'
        }).eq('id', id)
      ];

      if (autoLog && newT) {
        const dbT = { ...newT, memberid: newT.memberId };
        delete dbT.memberId;
        dbPromises.push(supabase.from('transactions').insert(dbT));
      }

      await Promise.all(dbPromises);
    }
  };

  const resetAllData = async () => {
    if (supabase) {
      await Promise.all([
        supabase.from('members').delete().neq('id', ''),
        supabase.from('categories').delete().neq('id', ''),
        supabase.from('transactions').delete().neq('id', ''),
        supabase.from('goals').delete().neq('id', ''),
        supabase.from('recurring').delete().neq('id', ''),
        supabase.from('debts').delete().neq('id', ''),
        supabase.from('huis').delete().neq('id', '')
      ]);

      const dbSampleTransactions = INITIAL_TRANSACTIONS.map(t => {
        const dbT = { ...t, memberid: t.memberId };
        delete dbT.memberId;
        return dbT;
      });
      const dbSampleRecurring = INITIAL_RECURRING.map(r => {
        const dbR = { ...r, nextdue: r.nextDue, memberid: r.memberId };
        delete dbR.nextDue;
        delete dbR.memberId;
        return dbR;
      });
      const dbSampleDebts = INITIAL_DEBTS.map(d => {
        const dbD = { ...d, paidamount: d.paidAmount, duedate: d.dueDate };
        delete dbD.paidAmount;
        delete dbD.dueDate;
        return dbD;
      });

      await Promise.all([
        supabase.from('members').insert(INITIAL_MEMBERS),
        supabase.from('categories').insert(INITIAL_CATEGORIES),
        supabase.from('goals').insert(INITIAL_GOALS),
        supabase.from('recurring').insert(dbSampleRecurring),
        supabase.from('debts').insert(dbSampleDebts),
        supabase.from('transactions').insert(dbSampleTransactions)
      ]);
    }
    
    setAppState({
      members: INITIAL_MEMBERS,
      categories: INITIAL_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      goals: INITIAL_GOALS,
      recurring: INITIAL_RECURRING,
      debts: INITIAL_DEBTS,
      huis: [],
      theme: appState.theme
    });
  };

  const clearAllData = async () => {
    const defaultMember = [{ id: 'm-1', name: 'Thành viên 1', role: 'admin', color: '#3b82f6', avatar: '👨' }];
    const defaultCategories = INITIAL_CATEGORIES.map(c => ({ ...c, budget: 0 }));

    if (supabase) {
      await Promise.all([
        supabase.from('members').delete().neq('id', ''),
        supabase.from('categories').delete().neq('id', ''),
        supabase.from('transactions').delete().neq('id', ''),
        supabase.from('goals').delete().neq('id', ''),
        supabase.from('recurring').delete().neq('id', ''),
        supabase.from('debts').delete().neq('id', ''),
        supabase.from('huis').delete().neq('id', '')
      ]);

      await Promise.all([
        supabase.from('members').insert(defaultMember),
        supabase.from('categories').insert(defaultCategories)
      ]);
    }
    
    setAppState({
      members: defaultMember,
      categories: defaultCategories,
      transactions: [],
      goals: [],
      recurring: [],
      debts: [],
      huis: [],
      theme: appState.theme
    });
  };

  const importAllData = async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const nextState = { ...appState };
      
      const promises = [];

      if (data.members) {
        nextState.members = data.members;
        if (supabase) {
          promises.push(supabase.from('members').delete().neq('id', '').then(() => supabase.from('members').insert(data.members)));
        }
      }
      if (data.categories) {
        nextState.categories = data.categories;
        if (supabase) {
          promises.push(supabase.from('categories').delete().neq('id', '').then(() => supabase.from('categories').insert(data.categories)));
        }
      }
      if (data.transactions) {
        nextState.transactions = data.transactions;
        if (supabase) {
          const dbT = data.transactions.map(t => {
            const copy = { ...t, memberid: t.memberId };
            delete copy.memberId;
            return copy;
          });
          promises.push(supabase.from('transactions').delete().neq('id', '').then(() => supabase.from('transactions').insert(dbT)));
        }
      }
      if (data.goals) {
        nextState.goals = data.goals;
        if (supabase) {
          promises.push(supabase.from('goals').delete().neq('id', '').then(() => supabase.from('goals').insert(data.goals)));
        }
      }
      if (data.recurring) {
        nextState.recurring = data.recurring;
        if (supabase) {
          const dbRec = data.recurring.map(r => {
            const copy = { ...r, nextdue: r.nextDue, memberid: r.memberId };
            delete copy.nextDue;
            delete copy.memberId;
            return copy;
          });
          promises.push(supabase.from('recurring').delete().neq('id', '').then(() => supabase.from('recurring').insert(dbRec)));
        }
      }
      if (data.debts) {
        nextState.debts = data.debts;
        if (supabase) {
          const dbD = data.debts.map(d => {
            const copy = { ...d, paidamount: d.paidAmount, duedate: d.dueDate };
            delete copy.paidAmount;
            delete copy.dueDate;
            return copy;
          });
          promises.push(supabase.from('debts').delete().neq('id', '').then(() => supabase.from('debts').insert(dbD)));
        }
      }
      if (data.huis) {
        nextState.huis = data.huis;
        if (supabase) {
          const dbH = data.huis.map(h => {
            const copy = { 
              ...h, 
              roundsdata: h.roundsData,
              totalshares: h.totalShares,
              startdate: h.startDate
            };
            delete copy.roundsData;
            delete copy.totalShares;
            delete copy.startDate;
            return copy;
          });
          promises.push(supabase.from('huis').delete().neq('id', '').then(() => supabase.from('huis').insert(dbH)));
        }
      }
      
      if (supabase && promises.length > 0) {
        await Promise.all(promises);
      }

      setAppState(nextState);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // 8. Hụi Actions
  const addHui = async (h) => {
    const newH = { 
      ...h, 
      id: 'hui-' + Date.now(), 
      status: 'active',
      roundsData: h.roundsData || []
    };
    setAppState(prev => ({ ...prev, huis: [...prev.huis, newH] }));
    if (supabase) {
      const dbH = { 
        ...newH, 
        roundsdata: newH.roundsData,
        totalshares: newH.totalShares,
        startdate: newH.startDate
      };
      delete dbH.roundsData;
      delete dbH.totalShares;
      delete dbH.startDate;
      const { error } = await supabase.from('huis').insert(dbH);
      if (error) {
        console.error("Lỗi khi thêm dây hụi vào Supabase:", error);
        if (typeof window !== 'undefined') {
          alert("Lỗi khi thêm dây hụi vào Supabase: " + (error.message || JSON.stringify(error)));
        }
      }
    }
  };

  const updateHui = async (updatedH) => {
    setAppState(prev => ({
      ...prev,
      huis: prev.huis.map(h => h.id === updatedH.id ? updatedH : h)
    }));
    if (supabase) {
      const dbH = { 
        ...updatedH, 
        roundsdata: updatedH.roundsData,
        totalshares: updatedH.totalShares,
        startdate: updatedH.startDate
      };
      delete dbH.roundsData;
      delete dbH.totalShares;
      delete dbH.startDate;
      const { error } = await supabase.from('huis').update(dbH).eq('id', updatedH.id);
      if (error) {
        console.error("Lỗi khi cập nhật dây hụi trên Supabase:", error);
        if (typeof window !== 'undefined') {
          alert("Lỗi khi cập nhật dây hụi trên Supabase: " + (error.message || JSON.stringify(error)));
        }
      }
    }
  };

  const deleteHui = async (id) => {
    setAppState(prev => ({ ...prev, huis: prev.huis.filter(h => h.id !== id) }));
    if (supabase) {
      const { error } = await supabase.from('huis').delete().eq('id', id);
      if (error) {
        console.error("Lỗi khi xóa dây hụi trên Supabase:", error);
        if (typeof window !== 'undefined') {
          alert("Lỗi khi xóa dây hụi trên Supabase: " + (error.message || JSON.stringify(error)));
        }
      }
    }
  };

  const toggleContractorMode = () => {
    setAppState(prev => {
      const nextMode = !prev.contractorMode;
      localStorage.setItem('hl_contractor_mode', String(nextMode));
      return { ...prev, contractorMode: nextMode };
    });
  };

  const addProject = async (p) => {
    const newP = {
      ...p,
      id: 'p-' + Date.now(),
      payments: p.payments || [],
      expenses: p.expenses || []
    };

    if (supabase) {
      const dbP = {
        id: newP.id,
        name: newP.name,
        client: newP.client,
        location: newP.location,
        contractvalue: newP.contractValue,
        startdate: newP.startDate,
        enddate: newP.endDate,
        status: newP.status,
        payments: newP.payments,
        expenses: newP.expenses
      };
      const { error } = await supabase.from('projects').insert(dbP);
      if (error) console.error("Lỗi khi thêm dự án vào Supabase:", error);
    }

    setAppState(prev => {
      const nextProjects = [...prev.projects, newP];
      localStorage.setItem('hl_projects', JSON.stringify(nextProjects));
      return { ...prev, projects: nextProjects };
    });
  };

  const updateProject = async (updatedP) => {
    if (supabase) {
      const dbP = {
        name: updatedP.name,
        client: updatedP.client,
        location: updatedP.location,
        contractvalue: updatedP.contractValue,
        startdate: updatedP.startDate,
        enddate: updatedP.endDate,
        status: updatedP.status,
        payments: updatedP.payments,
        expenses: updatedP.expenses
      };
      const { error } = await supabase.from('projects').update(dbP).eq('id', updatedP.id);
      if (error) console.error("Lỗi khi cập nhật dự án trên Supabase:", error);
    }

    setAppState(prev => {
      const nextProjects = prev.projects.map(p => p.id === updatedP.id ? updatedP : p);
      localStorage.setItem('hl_projects', JSON.stringify(nextProjects));
      return { ...prev, projects: nextProjects };
    });
  };

  const deleteProject = async (id) => {
    if (supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) console.error("Lỗi khi xóa dự án trên Supabase:", error);
    }

    setAppState(prev => {
      const nextProjects = prev.projects.filter(p => p.id !== id);
      localStorage.setItem('hl_projects', JSON.stringify(nextProjects));
      return { ...prev, projects: nextProjects };
    });
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
      huis: appState.huis,
      projects: appState.projects,
      contractorMode: appState.contractorMode,
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
      addHui,
      updateHui,
      deleteHui,
      toggleContractorMode,
      addProject,
      updateProject,
      deleteProject,
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
