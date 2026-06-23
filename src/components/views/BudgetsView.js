'use client';

import React, { useState, useMemo } from 'react';
import { 
  Edit2, 
  Check, 
  X, 
  AlertCircle, 
  AlertTriangle,
  Utensils,
  FileText,
  Car,
  ShoppingBag,
  Sparkles,
  HeartPulse,
  HelpCircle,
  Wallet,
  TrendingUp,
  PiggyBank
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './BudgetsView.module.css';

const IconMap = {
  Utensils,
  FileText,
  Car,
  ShoppingBag,
  Sparkles,
  HeartPulse,
  HelpCircle
};

export default function BudgetsView() {
  const { categories, transactions, updateCategoryBudget } = useStore();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState(''); // formatted string like "5.000.000"

  // 1. Get current month string
  const currentMonth = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // 2. Calculate actual spending per category in current month
  const categorySpending = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      map[c.id] = 0;
    });

    transactions.forEach(t => {
      if (t.type === 'expense' && t.date && t.date.startsWith(currentMonth)) {
        if (map[t.category] !== undefined) {
          map[t.category] += Number(t.amount) || 0;
        }
      }
    });
    return map;
  }, [categories, transactions, currentMonth]);

  // 3. Stats totals
  const totalStats = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;

    categories.forEach(c => {
      totalBudget += c.budget || 0;
      totalSpent += categorySpending[c.id] || 0;
    });

    return { totalBudget, totalSpent };
  }, [categories, categorySpending]);

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditValue(new Intl.NumberFormat('vi-VN').format(cat.budget));
  };

  const handleSaveEdit = (id) => {
    const numericVal = Number(editValue.replace(/\./g, ''));
    if (!isNaN(numericVal) && numericVal >= 0) {
      updateCategoryBudget(id, numericVal);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleBudgetChange = (e) => {
    const val = e.target.value;
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      setEditValue('');
      return;
    }
    setEditValue(new Intl.NumberFormat('vi-VN').format(Number(clean)));
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý ngân sách</h1>
          <p className={styles.subtitle}>Đặt hạn mức chi tiêu hàng tháng cho từng danh mục để tránh vung tay quá trán.</p>
        </div>
      </header>

      {/* Overview Card */}
      <section className={`${styles.overviewCard} glass-card`}>
        <div className={styles.overviewHeader}>
          <h3 className={styles.cardTitle}>Tình hình ngân sách tháng này</h3>
          <span className={styles.dateLabel}>Tháng {currentMonth.substring(5, 7)}/{currentMonth.substring(0, 4)}</span>
        </div>

        <div className={styles.overviewGrid}>
          <div className={`${styles.overviewCardMini} glass-card`}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)' }}>
              <Wallet size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Hạn mức tổng</span>
              <span className={styles.statValBudget}>{formatVND(totalStats.totalBudget)}</span>
            </div>
          </div>

          <div className={`${styles.overviewCardMini} glass-card`}>
            <div className={styles.iconWrapper} style={{ background: totalStats.totalSpent > totalStats.totalBudget ? 'rgba(239, 68, 68, 0.12)' : 'rgba(52, 211, 153, 0.12)', color: totalStats.totalSpent > totalStats.totalBudget ? 'var(--danger)' : 'var(--secondary)' }}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Thực chi tiêu</span>
              <span className={styles.statValSpent} style={{ color: totalStats.totalSpent > totalStats.totalBudget ? 'var(--danger)' : 'var(--primary)' }}>
                {formatVND(totalStats.totalSpent)}
              </span>
            </div>
          </div>

          <div className={`${styles.overviewCardMini} glass-card`}>
            <div className={styles.iconWrapper} style={{ background: totalStats.totalBudget - totalStats.totalSpent >= 0 ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: totalStats.totalBudget - totalStats.totalSpent >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>
              <PiggyBank size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Còn lại của tháng</span>
              <span className={`${styles.statValRemain} ${totalStats.totalBudget - totalStats.totalSpent >= 0 ? styles.positiveText : styles.negativeText}`}>
                {formatVND(totalStats.totalBudget - totalStats.totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className={styles.globalProgressWrapper}>
          <div className={styles.globalProgressBarBg}>
            <div 
              className={styles.globalProgressBarFill} 
              style={{ 
                width: `${Math.min((totalStats.totalSpent / (totalStats.totalBudget || 1)) * 100, 100)}%`,
                backgroundColor: totalStats.totalSpent > totalStats.totalBudget ? 'var(--danger)' : 'var(--primary)'
              }}
            />
          </div>
          <div className={styles.globalProgressMeta}>
            <span>Tỷ lệ sử dụng: {Math.round((totalStats.totalSpent / (totalStats.totalBudget || 1)) * 100)}%</span>
            {totalStats.totalSpent > totalStats.totalBudget && (
              <span className={styles.overWarning}>
                <AlertCircle size={14} /> Cảnh báo: Vượt hạn mức chi tiêu!
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Category List */}
      <section className={styles.categoryGrid}>
        {categories.map((c) => {
          const spent = categorySpending[c.id] || 0;
          const budget = c.budget || 0;
          const percent = Math.min(Math.round((spent / (budget || 1)) * 100), 100);
          const isOver = spent > budget;
          const isWarning = spent > budget * 0.8 && !isOver;
          const isEditing = editingId === c.id;

          let statusColor = 'var(--primary)';
          if (isOver) statusColor = 'var(--danger)';
          else if (isWarning) statusColor = 'var(--warning)';

          return (
            <div key={c.id} className={`${styles.catCard} glass-card`}>
              <div className={styles.catCardHeader}>
                <div className={styles.catTitle}>
                  <div className={styles.iconBox} style={{ background: `${c.color}15`, color: c.color }}>
                    {React.createElement(IconMap[c.icon] || HelpCircle, { size: 18 })}
                  </div>
                  <div className={styles.catMeta}>
                    <span className={styles.catName}>{c.name}</span>
                    <span className={styles.spentPercentageBadge} style={{ background: `${statusColor}15`, color: statusColor }}>
                      {percent}%
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className={styles.editActions}>
                    <input 
                      type="text" 
                      value={editValue} 
                      onChange={handleBudgetChange}
                      className={styles.editInput}
                      autoFocus
                      id={`input-budget-${c.id}`}
                    />
                    <button onClick={() => handleSaveEdit(c.id)} className={styles.btnSave} id={`btn-save-budget-${c.id}`}>
                      <Check size={14} />
                    </button>
                    <button onClick={handleCancelEdit} className={styles.btnCancel}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleStartEdit(c)} 
                    className={styles.btnEdit}
                    title="Chỉnh sửa ngân sách"
                    id={`btn-edit-budget-${c.id}`}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              {/* Budget Values */}
              <div className={styles.budgetValues}>
                <div className={styles.valRow}>
                  <span className={styles.valLabel}>Hạn mức:</span>
                  <span className={styles.valNumberBold}>{formatVND(budget)}</span>
                </div>
                <div className={styles.valRow}>
                  <span className={styles.valLabel}>Thực chi:</span>
                  <span className={styles.valNumber} style={{ color: isOver ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {formatVND(spent)}
                  </span>
                </div>
                <div className={styles.valRow}>
                  <span className={styles.valLabel}>Còn lại:</span>
                  <span className={`${styles.valNumber} ${budget - spent >= 0 ? styles.positiveText : styles.negativeText}`}>
                    {formatVND(budget - spent)}
                  </span>
                </div>
              </div>

              {/* Progress visual */}
              <div className={styles.progressSection}>
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${percent}%`, backgroundColor: statusColor }}
                  />
                </div>
                
                <div className={styles.progressFooter}>
                  <span>Đã dùng {percent}%</span>
                  {isOver && (
                    <span className={styles.alertText} style={{ color: 'var(--danger)' }}>
                      <AlertCircle size={12} /> Quá hạn mức!
                    </span>
                  )}
                  {isWarning && (
                    <span className={styles.alertText} style={{ color: 'var(--warning)' }}>
                      <AlertTriangle size={12} /> Sắp đầy
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
