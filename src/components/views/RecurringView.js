'use client';

import React, { useState } from 'react';
import { Plus, Trash2, CalendarClock, Play, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './RecurringView.module.css';

export default function RecurringView() {
  const { recurring, categories, members, addRecurring, deleteRecurring, triggerRecurringExpense } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [rawAmount, setRawAmount] = useState(''); // holds formatted string
  const [cat, setCat] = useState('cat-2');
  const [mId, setMId] = useState('m-1');
  const [freq, setFreq] = useState('monthly');
  const [nextDue, setNextDue] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handleAmountChange = (e) => {
    setRawAmount(formatNumberString(e.target.value));
  };

  const handleAddRecurring = (e) => {
    e.preventDefault();
    const numericAmount = Number(rawAmount.replace(/\./g, ''));
    if (!name.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    addRecurring({
      name,
      amount: numericAmount,
      category: cat,
      memberId: mId,
      frequency: freq,
      nextDue
    });

    setName('');
    setRawAmount('');
    setCat(categories[0]?.id || 'cat-1');
    setMId(members[0]?.id || 'm-1');
    setFreq('monthly');
    setNextDue(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Chi tiêu định kỳ</h1>
          <p className={styles.subtitle}>Quản lý các hóa đơn cố định lặp lại hàng tuần hoặc hàng tháng (Netflix, Internet, Tiền nhà...).</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.btnAdd}
          id="btn-toggle-add-recurring"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'Đóng' : 'Thêm định kỳ'}</span>
        </button>
      </header>

      {/* Add Form */}
      {showAddForm && (
        <section className={`${styles.formCard} glass-card`}>
          <h3 className={styles.formTitle}>Đăng ký hóa đơn định kỳ mới</h3>
          <form onSubmit={handleAddRecurring} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Tên hóa đơn</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Netflix Premium, Tiền mạng..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  id="rec-name-input"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Số tiền (VND)</label>
                <input 
                  type="text" 
                  required
                  placeholder="0" 
                  value={rawAmount}
                  onChange={handleAmountChange}
                  className={styles.input}
                  id="rec-amount-input"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Tần suất</label>
                <select 
                  value={freq} 
                  onChange={(e) => setFreq(e.target.value)}
                  className={styles.input}
                  id="rec-freq-select"
                >
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Ngày thanh toán tiếp theo</label>
                <input 
                  type="date" 
                  required
                  value={nextDue}
                  onChange={(e) => setNextDue(e.target.value)}
                  className={styles.input}
                  id="rec-due-input"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Danh mục chi</label>
                <select 
                  value={cat} 
                  onChange={(e) => setCat(e.target.value)}
                  className={styles.input}
                  id="rec-cat-select"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Người chịu trách nhiệm</label>
                <select 
                  value={mId} 
                  onChange={(e) => setMId(e.target.value)}
                  className={styles.input}
                  id="rec-member-select"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.btnSubmit}
              id="btn-submit-add-recurring"
            >
              Lưu hóa đơn định kỳ
            </button>
          </form>
        </section>
      )}

      {/* List of Recurring Expenses */}
      <section className={styles.listGrid}>
        {recurring.map((rec) => {
          const category = categories.find(c => c.id === rec.category);
          const member = members.find(m => m.id === rec.memberId);
          
          return (
            <div key={rec.id} className={`${styles.recCard} glass-card`}>
              <div className={styles.recCardLeft}>
                <div className={styles.iconBox}>
                  <CalendarClock size={20} color="var(--primary)" />
                </div>
                
                <div className={styles.recDetails}>
                  <h3 className={styles.recName}>{rec.name}</h3>
                  <div className={styles.recMeta}>
                    <span className={styles.metaBadge}>{category?.name || 'Chi tiêu'}</span>
                    <span>• Tần suất: {rec.frequency === 'monthly' ? 'Hàng tháng' : 'Hàng tuần'}</span>
                    <span>• Người đóng: {member?.name}</span>
                  </div>
                  <p className={styles.recNextDue}>
                    Ngày đóng tiếp theo: <strong>{rec.nextDue}</strong>
                  </p>
                </div>
              </div>

              <div className={styles.recCardRight}>
                <span className={styles.recAmount}>{formatVND(rec.amount)}</span>
                
                <div className={styles.recActions}>
                  <button 
                    onClick={() => triggerRecurringExpense(rec)}
                    className={styles.btnTrigger}
                    title="Ghi nhận hóa đơn này ngay bây giờ"
                    id={`btn-trigger-recurring-${rec.id}`}
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Ghi nhận</span>
                  </button>
                  
                  <button 
                    onClick={() => deleteRecurring(rec.id)}
                    className={styles.btnDelete}
                    title="Xóa hóa đơn định kỳ"
                    id={`btn-delete-recurring-${rec.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {recurring.length === 0 && (
          <div className={`${styles.emptyState} glass-card`}>
            <p>Không có hóa đơn định kỳ nào được đăng ký.</p>
          </div>
        )}
      </section>
    </div>
  );
}
