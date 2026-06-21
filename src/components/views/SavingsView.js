'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calendar, PiggyBank, X, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './SavingsView.module.css';

export default function SavingsView() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New goal form state
  const [name, setName] = useState('');
  const [rawTarget, setRawTarget] = useState(''); // holds formatted string
  const [rawCurrent, setRawCurrent] = useState(''); // holds formatted string
  const [date, setDate] = useState('');

  // Add fund state
  const [activeFundId, setActiveFundId] = useState(null);
  const [rawFundAmount, setRawFundAmount] = useState(''); // holds formatted string

  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handleTargetChange = (e) => {
    setRawTarget(formatNumberString(e.target.value));
  };

  const handleCurrentChange = (e) => {
    setRawCurrent(formatNumberString(e.target.value));
  };

  const handleFundAmountChange = (e) => {
    setRawFundAmount(formatNumberString(e.target.value));
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    const numericTarget = Number(rawTarget.replace(/\./g, ''));
    const numericCurrent = Number(rawCurrent.replace(/\./g, '')) || 0;

    if (!name.trim() || isNaN(numericTarget) || numericTarget <= 0) return;

    addGoal({
      name,
      target: numericTarget,
      current: numericCurrent,
      date: date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] // default 30 days
    });

    setName('');
    setRawTarget('');
    setRawCurrent('');
    setDate('');
    setShowAddForm(false);
  };

  const handleOpenFund = (id) => {
    setActiveFundId(id);
    setRawFundAmount('');
  };

  const handleSaveFund = (g) => {
    const amt = Number(rawFundAmount.replace(/\./g, ''));
    if (!isNaN(amt) && amt > 0) {
      const updated = {
        ...g,
        current: Number(g.current) + amt
      };
      updateGoal(updated);
    }
    setActiveFundId(null);
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Mục tiêu tiết kiệm</h1>
          <p className={styles.subtitle}>Đặt mục tiêu tích lũy tài chính cho các kế hoạch lớn của gia đình.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.btnAdd}
          id="btn-toggle-add-goal"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'Đóng' : 'Mục tiêu mới'}</span>
        </button>
      </header>

      {/* Add Goal Form */}
      {showAddForm && (
        <section className={`${styles.formCard} glass-card`}>
          <h3 className={styles.formTitle}>Thiết lập mục tiêu mới</h3>
          <form onSubmit={handleAddGoal} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Tên mục tiêu</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: Mua tivi mới, Đi du lịch..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                id="goal-name-input"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Số tiền cần tiết kiệm (VND)</label>
                <input 
                  type="text" 
                  required
                  placeholder="0" 
                  value={rawTarget}
                  onChange={handleTargetChange}
                  className={styles.input}
                  id="goal-target-input"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Số tiền đã có sẵn (VND)</label>
                <input 
                  type="text" 
                  placeholder="0" 
                  value={rawCurrent}
                  onChange={handleCurrentChange}
                  className={styles.input}
                  id="goal-current-input"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Hạn định hoàn thành</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                id="goal-date-input"
              />
            </div>

            <button 
              type="submit" 
              className={styles.btnSubmit}
              id="btn-submit-add-goal"
            >
              Tạo mục tiêu
            </button>
          </form>
        </section>
      )}

      {/* Goals Grid */}
      <section className={styles.goalsGrid}>
        {goals.map((g) => {
          const pct = Math.min(Math.round((g.current / g.target) * 100), 100) || 0;
          const remain = Math.max(g.target - g.current, 0);
          const isFundOpen = activeFundId === g.id;

          return (
            <div key={g.id} className={`${styles.goalCard} glass-card`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <PiggyBank size={22} color="var(--primary)" />
                </div>
                
                <div className={styles.goalInfo}>
                  <h3 className={styles.goalName}>{g.name}</h3>
                  <span className={styles.goalDate}>
                    <Calendar size={12} className={styles.calIcon} />
                    Hạn: {g.date}
                  </span>
                </div>

                <button 
                  onClick={() => deleteGoal(g.id)}
                  className={styles.btnDelete}
                  title="Xóa mục tiêu"
                  id={`btn-delete-goal-${g.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Stats values */}
              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <span className={styles.label}>Đã tích lũy</span>
                  <span className={styles.valSaved}>{formatVND(g.current)}</span>
                </div>
                <div className={styles.stat} style={{ textAlign: 'right' }}>
                  <span className={styles.label}>Mục tiêu</span>
                  <span className={styles.valTarget}>{formatVND(g.target)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressSection}>
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className={styles.progressMeta}>
                  <span>Tiến độ: {pct}%</span>
                  {remain > 0 ? (
                    <span>Còn thiếu: {formatVND(remain)}</span>
                  ) : (
                    <span className={styles.successLabel}>Đã hoàn thành! 🎉</span>
                  )}
                </div>
              </div>

              {/* Add funds quick box */}
              <div className={styles.fundingArea}>
                {isFundOpen ? (
                  <div className={styles.fundInputGroup}>
                    <input 
                      type="text" 
                      placeholder="Số tiền nạp (VND)..."
                      value={rawFundAmount}
                      onChange={handleFundAmountChange}
                      className={styles.fundInput}
                      autoFocus
                      id={`input-fund-${g.id}`}
                    />
                    <button onClick={() => handleSaveFund(g)} className={styles.btnSaveFund} id={`btn-save-fund-${g.id}`}>
                      <Check size={14} />
                    </button>
                    <button onClick={() => setActiveFundId(null)} className={styles.btnCancelFund}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  remain > 0 && (
                    <button 
                      onClick={() => handleOpenFund(g.id)}
                      className={styles.btnOpenFund}
                      id={`btn-open-fund-${g.id}`}
                    >
                      <Plus size={14} />
                      <span>Nạp thêm quỹ</span>
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
