'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, Coins, ArrowUpRight, ArrowDownRight, Check, X, CreditCard } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './DebtsView.module.css';

export default function DebtsView() {
  const { debts, addDebt, deleteDebt, payDebt } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // New debt form state
  const [name, setName] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [rawPaid, setRawPaid] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('debt'); // 'debt' | 'loan'

  // Payment popup state
  const [activePayId, setActivePayId] = useState(null);
  const [rawPayAmount, setRawPayAmount] = useState('');
  const [autoLog, setAutoLog] = useState(true);

  // 1. Calculations
  const stats = useMemo(() => {
    let totalDebt = 0; // Chúng ta đang nợ người khác
    let totalLoan = 0; // Người khác đang nợ chúng ta

    debts.forEach(d => {
      const remain = Math.max(d.amount - d.paidAmount, 0);
      if (d.type === 'debt') {
        totalDebt += remain;
      } else {
        totalLoan += remain;
      }
    });

    return { totalDebt, totalLoan };
  }, [debts]);

  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handleAmountChange = (e) => {
    setRawAmount(formatNumberString(e.target.value));
  };

  const handlePaidChange = (e) => {
    setRawPaid(formatNumberString(e.target.value));
  };

  const handlePayAmountChange = (e) => {
    setRawPayAmount(formatNumberString(e.target.value));
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    const numericAmt = Number(rawAmount.replace(/\./g, ''));
    const numericPaid = Number(rawPaid.replace(/\./g, '')) || 0;

    if (!name.trim() || isNaN(numericAmt) || numericAmt <= 0) return;

    addDebt({
      name,
      amount: numericAmt,
      paidAmount: numericPaid,
      dueDate: date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      type
    });

    setName('');
    setRawAmount('');
    setRawPaid('');
    setDate('');
    setShowAddForm(false);
  };

  const handleOpenPay = (id) => {
    setActivePayId(id);
    setRawPayAmount('');
    setAutoLog(true);
  };

  const handleSavePay = (d) => {
    const amt = Number(rawPayAmount.replace(/\./g, ''));
    if (!isNaN(amt) && amt > 0) {
      payDebt(d.id, amt, autoLog);
    }
    setActivePayId(null);
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý nợ & Cho vay</h1>
          <p className={styles.subtitle}>Ghi nhớ các khoản vay mượn của người thân, bạn bè để theo dõi tiến độ hoàn trả.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.btnAdd}
          id="btn-toggle-add-debt"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'Đóng' : 'Thêm mới'}</span>
        </button>
      </header>

      {/* Stats Cards */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
            <ArrowDownRight size={22} color="var(--danger)" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Nợ bạn cần trả (Người khác cho mượn)</p>
            <p className={styles.statValue} style={{ color: 'var(--danger)' }}>
              {formatVND(stats.totalDebt)}
            </p>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon} style={{ background: 'rgba(52, 211, 153, 0.12)' }}>
            <ArrowUpRight size={22} color="var(--secondary)" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Tiền bạn cho vay (Chờ thu hồi)</p>
            <p className={styles.statValue} style={{ color: 'var(--secondary)' }}>
              {formatVND(stats.totalLoan)}
            </p>
          </div>
        </div>
      </section>

      {/* Add Debt Form */}
      {showAddForm && (
        <section className={`${styles.formCard} glass-card`}>
          <h3 className={styles.formTitle}>Đăng ký khoản vay mượn mới</h3>
          <form onSubmit={handleAddDebt} className={styles.form}>
            {/* Type Switcher */}
            <div className={styles.formGroup}>
              <div className={styles.typeSwitcher}>
                <button
                  type="button"
                  onClick={() => setType('debt')}
                  className={`${styles.typeBtn} ${type === 'debt' ? styles.typeBtnActiveExpense : ''}`}
                >
                  Nợ tôi cần trả (Đi mượn)
                </button>
                <button
                  type="button"
                  onClick={() => setType('loan')}
                  className={`${styles.typeBtn} ${type === 'loan' ? styles.typeBtnActiveIncome : ''}`}
                >
                  Tôi cho vay (Chờ thu nợ)
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Tên đối tác / Lý do vay mượn</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: Chú Hùng (Mua máy tính), Cô Út (Sửa bếp)..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                id="debt-name-input"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Số tiền vay mượn (VND)</label>
                <input 
                  type="text" 
                  required
                  placeholder="0" 
                  value={rawAmount}
                  onChange={handleAmountChange}
                  className={styles.input}
                  id="debt-amount-input"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Số tiền đã trả trước (VND)</label>
                <input 
                  type="text" 
                  placeholder="0" 
                  value={rawPaid}
                  onChange={handlePaidChange}
                  className={styles.input}
                  id="debt-paid-input"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Hạn định thanh toán</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                id="debt-date-input"
              />
            </div>

            <button 
              type="submit" 
              className={styles.btnSubmit}
              id="btn-submit-add-debt"
            >
              Lưu
            </button>
          </form>
        </section>
      )}

      {/* List Grid */}
      <section className={styles.listGrid}>
        {debts.map((d) => {
          const remain = Math.max(d.amount - d.paidAmount, 0);
          const pct = Math.min(Math.round((d.paidAmount / d.amount) * 100), 100) || 0;
          const isPayOpen = activePayId === d.id;
          const isDebt = d.type === 'debt';

          return (
            <div key={d.id} className={`${styles.debtCard} glass-card`} style={{ borderLeft: isDebt ? '4px solid var(--danger)' : '4px solid var(--secondary)' }}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox} style={{ background: isDebt ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)' }}>
                  <Coins size={20} color={isDebt ? 'var(--danger)' : 'var(--secondary)'} />
                </div>
                
                <div className={styles.debtInfo}>
                  <h3 className={styles.debtName}>{d.name}</h3>
                  <div className={styles.debtMeta}>
                    <span className={styles.metaBadge} style={{ background: isDebt ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isDebt ? 'var(--danger)' : 'var(--secondary)' }}>
                      {isDebt ? 'Nợ cần trả' : 'Cho vay'}
                    </span>
                    <span>• Hạn: {d.dueDate}</span>
                  </div>
                </div>

                <button 
                  onClick={() => deleteDebt(d.id)}
                  className={styles.btnDelete}
                  title="Xóa khoản nợ"
                  id={`btn-delete-debt-${d.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Progress and numbers */}
              <div className={styles.progressSection}>
                <div className={styles.valuesRow}>
                  <span className={styles.valLabel}>Đã trả: <strong>{formatVND(d.paidAmount)}</strong></span>
                  <span className={styles.valLabel}>Tổng: <strong>{formatVND(d.amount)}</strong></span>
                </div>
                
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${pct}%`, backgroundColor: isDebt ? 'var(--danger)' : 'var(--secondary)' }}
                  />
                </div>
                
                <div className={styles.progressFooter}>
                  <span>Hoàn thành {pct}%</span>
                  {remain > 0 ? (
                    <span className={styles.remainLabel}>Còn lại: {formatVND(remain)}</span>
                  ) : (
                    <span className={styles.successLabel}>Đã tất toán! 🎉</span>
                  )}
                </div>
              </div>

              {/* Quick payoff button */}
              <div className={styles.payoffArea}>
                {isPayOpen ? (
                  <div className={styles.payInputGroup}>
                    <div className={styles.payInputWrapper}>
                      <input 
                        type="text" 
                        placeholder="Số tiền đóng (VND)..."
                        value={rawPayAmount}
                        onChange={handlePayAmountChange}
                        className={styles.payInput}
                        autoFocus
                        id={`input-pay-debt-${d.id}`}
                      />
                    </div>
                    
                    <label className={styles.chkLabel}>
                      <input 
                        type="checkbox" 
                        checked={autoLog}
                        onChange={(e) => setAutoLog(e.target.checked)}
                      />
                      <span>Ghi giao dịch thu/chi</span>
                    </label>

                    <div className={styles.payActionButtons}>
                      <button onClick={() => handleSavePay(d)} className={styles.btnSavePay} id={`btn-save-pay-${d.id}`}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => setActivePayId(null)} className={styles.btnCancelPay}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  remain > 0 && (
                    <button 
                      onClick={() => handleOpenPay(d.id)}
                      className={styles.btnOpenPay}
                      id={`btn-open-pay-${d.id}`}
                    >
                      <CreditCard size={14} style={{ marginRight: '6px' }} />
                      <span>{isDebt ? 'Trả nợ' : 'Thu nợ'}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}

        {debts.length === 0 && (
          <div className={`${styles.emptyState} glass-card`}>
            <p>Gia đình hiện không có khoản nợ hay cho vay nào đang hoạt động.</p>
          </div>
        )}
      </section>
    </div>
  );
}
