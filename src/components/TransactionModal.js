'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './TransactionModal.module.css';

export default function TransactionModal({ isOpen, onClose, editingTransaction }) {
  const { categories, members, addTransaction, updateTransaction } = useStore();

  const [desc, setDesc] = useState(() => editingTransaction ? editingTransaction.description : '');
  const [rawAmount, setRawAmount] = useState(() => editingTransaction ? new Intl.NumberFormat('vi-VN').format(editingTransaction.amount) : '');
  const [date, setDate] = useState(() => editingTransaction ? editingTransaction.date : new Date().toISOString().split('T')[0]);
  const [cat, setCat] = useState(() => editingTransaction ? editingTransaction.category : (categories[0]?.id || 'cat-1'));
  const [mId, setMId] = useState(() => editingTransaction ? editingTransaction.memberId : (members[0]?.id || 'm-1'));
  const [type, setType] = useState(() => editingTransaction ? editingTransaction.type : 'expense');
  const [notes, setNotes] = useState(() => editingTransaction ? (editingTransaction.notes || '') : '');

  // Helper to format raw number to VND style input (e.g. 1000000 -> 1.000.000)
  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  // Format amount on change
  const handleAmountChange = (e) => {
    const val = e.target.value;
    const formatted = formatNumberString(val);
    setRawAmount(formatted);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = Number(rawAmount.replace(/\./g, ''));
    if (!desc.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    const data = {
      description: desc,
      amount: numericAmount,
      date,
      category: type === 'income' ? 'income' : cat,
      memberId: mId,
      type,
      notes
    };

    if (editingTransaction) {
      updateTransaction({ ...data, id: editingTransaction.id });
    } else {
      addTransaction(data);
    }
    
    onClose();
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCat('income');
    } else {
      setCat(categories[0]?.id || 'cat-1');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} glass-card`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {editingTransaction ? 'Cập nhật giao dịch' : 'Ghi chép giao dịch mới'}
          </h3>
          <button onClick={onClose} className={styles.btnCloseModal}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Type Switcher */}
          <div className={styles.formGroup}>
            <div className={styles.typeSwitcher}>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`${styles.typeBtn} ${type === 'expense' ? styles.typeBtnActiveExpense : ''}`}
              >
                Khoản Chi
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`${styles.typeBtn} ${type === 'income' ? styles.typeBtnActiveIncome : ''}`}
              >
                Thu Nhập
              </button>
            </div>
          </div>

          {/* Amount (Formatted) */}
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>Số tiền (VND)</label>
            <div className={styles.inputAmountWrapper}>
              <input 
                type="text"
                required
                placeholder="0"
                value={rawAmount}
                onChange={handleAmountChange}
                className={styles.modalInput}
                style={{ fontWeight: 'bold', fontSize: '1.1rem', color: type === 'expense' ? 'var(--danger)' : 'var(--secondary)' }}
                id="form-amount"
              />
              <span className={styles.currencyBadge}>đ</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>Nội dung mô tả</label>
            <input 
              type="text"
              required
              placeholder="Ví dụ: Mua sắm siêu thị, Đi xe bus..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={styles.modalInput}
              id="form-desc"
            />
          </div>

          {/* Flex Grid inputs */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Ngày chi</label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.modalInput}
                id="form-date"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Người chi / nhận</label>
              <select 
                value={mId} 
                onChange={(e) => setMId(e.target.value)}
                className={styles.modalInput}
                id="form-member"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category selector (Only if Expense) */}
          {type === 'expense' && (
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Danh mục chi</label>
              <select 
                value={cat} 
                onChange={(e) => setCat(e.target.value)}
                className={styles.modalInput}
                id="form-category"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>Ghi chú thêm</label>
            <textarea 
              placeholder="Nhập ghi chú (nếu có)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.modalTextarea}
              id="form-notes"
            />
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.btnCancel}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className={styles.btnSubmit}
              id="btn-submit-transaction"
            >
              {editingTransaction ? 'Cập nhật' : 'Ghi chép'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
