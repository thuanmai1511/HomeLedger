'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Users, X, Check, Edit2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './HuiView.module.css';

export default function HuiView() {
  const { huis, addHui, updateHui, deleteHui } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeHuiId, setActiveHuiId] = useState(null);

  // New Hui Line Form
  const [name, setName] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [totalShares, setTotalShares] = useState(10);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Paying a round state
  const [payingRoundNum, setPayingRoundNum] = useState(null);
  const [rawPaidVal, setRawPaidVal] = useState('');

  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handleAmountChange = (e) => {
    setRawAmount(formatNumberString(e.target.value));
  };

  const handlePaidValChange = (e) => {
    setRawPaidVal(formatNumberString(e.target.value));
  };

  const handleCreateHui = (e) => {
    e.preventDefault();
    const amountVal = Number(rawAmount.replace(/\./g, ''));
    if (!name.trim() || isNaN(amountVal) || amountVal <= 0) return;

    // Create rounds array based on totalShares
    const rounds = [];
    for (let i = 1; i <= totalShares; i++) {
      rounds.push({
        round: i,
        amountPaid: 0,
        datePaid: '',
        status: 'pending' // 'pending' | 'completed'
      });
    }

    addHui({
      name,
      amount: amountVal,
      frequency: 'weekly', // Simple weekly tracker
      totalShares: Number(totalShares),
      startDate,
      roundsData: rounds
    });

    setName('');
    setRawAmount('');
    setTotalShares(10);
    setStartDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const handleOpenPayRound = (hui, roundObj) => {
    setPayingRoundNum(roundObj.round);
    // Suggest the base amount default
    setRawPaidVal(new Intl.NumberFormat('vi-VN').format(hui.amount));
  };

  const handleSavePayRound = (hui) => {
    const paidAmt = Number(rawPaidVal.replace(/\./g, '')) || 0;

    const updatedRounds = hui.roundsData.map(r => {
      if (r.round === payingRoundNum) {
        return {
          ...r,
          amountPaid: paidAmt,
          datePaid: new Date().toISOString().split('T')[0],
          status: 'completed'
        };
      }
      return r;
    });

    const isAllCompleted = updatedRounds.every(r => r.status === 'completed');

    updateHui({
      ...hui,
      roundsData: updatedRounds,
      status: isAllCompleted ? 'completed' : 'active'
    });

    setPayingRoundNum(null);
  };

  const handleResetRound = (hui, roundNum) => {
    const updatedRounds = hui.roundsData.map(r => {
      if (r.round === roundNum) {
        return {
          ...r,
          amountPaid: 0,
          datePaid: '',
          status: 'pending'
        };
      }
      return r;
    });

    updateHui({
      ...hui,
      roundsData: updatedRounds,
      status: 'active'
    });
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const selectedHui = huis.find(h => h.id === activeHuiId);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Sổ Ghi Hụi</h1>
          <p className={styles.subtitle}>Ghi chép các dây hụi bạn đang chơi, theo dõi số tuần đã đóng và số tiền còn lại.</p>
        </div>

        <button 
          onClick={() => {
            if (activeHuiId) {
              setActiveHuiId(null);
            } else {
              setShowAddForm(!showAddForm);
            }
          }}
          className={styles.btnAdd}
        >
          {activeHuiId ? null : (showAddForm ? <X size={18} /> : <Plus size={18} />)}
          <span>{activeHuiId ? 'Quay lại' : (showAddForm ? 'Đóng' : 'Thêm dây hụi')}</span>
        </button>
      </header>

      {/* Add Form */}
      {!activeHuiId && showAddForm && (
        <section className={`${styles.formCard} glass-card`}>
          <h3 className={styles.formTitle}>Thêm dây hụi bạn đang chơi</h3>
          <form onSubmit={handleCreateHui} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Tên dây hụi</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: Hụi tuần 2 triệu chị Lan..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Số tiền đóng/kỳ (Chân hụi)</label>
                <input 
                  type="text" 
                  required
                  placeholder="0" 
                  value={rawAmount}
                  onChange={handleAmountChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Tổng số tuần/kỳ</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max="200"
                  value={totalShares}
                  onChange={(e) => setTotalShares(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Ngày bắt đầu chơi</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.btnSubmit}>Lưu</button>
          </form>
        </section>
      )}

      {/* List of Hui lines */}
      {!activeHuiId ? (
        <section className={styles.listGrid}>
          {huis.map((hui) => {
            const completedRounds = (hui.roundsData || []).filter(r => r.status === 'completed');
            const paidCount = completedRounds.length;
            const totalRounds = hui.totalShares;
            
            // Total amount paid is the sum of actual amounts paid
            const totalPaid = completedRounds.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0);
            
            // Remaining rounds
            const remainRounds = Math.max(totalRounds - paidCount, 0);
            const totalRemaining = remainRounds * hui.amount;

            return (
              <div key={hui.id} className={`${styles.huiCard} glass-card`} onClick={() => setActiveHuiId(hui.id)}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    <Calendar size={20} color="var(--primary)" />
                  </div>
                  <div className={styles.huiInfo}>
                    <h3 className={styles.huiName}>{hui.name}</h3>
                    <div className={styles.huiMeta}>
                      <span>Chân hụi: <strong>{formatVND(hui.amount)}</strong></span>
                      <span>• {totalRounds} kỳ</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Bạn có chắc chắn muốn xóa dây hụi "${hui.name}"?`)) {
                        deleteHui(hui.id);
                      }
                    }}
                    className={styles.btnDelete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressLabel}>
                    <span>Đã đóng: <strong>{paidCount}/{totalRounds} tuần</strong></span>
                    <span>Còn lại: {remainRounds} tuần</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${Math.round((paidCount / totalRounds) * 100) || 0}%` }} 
                    />
                  </div>
                </div>

                <div className={styles.calculationsTable} style={{ marginTop: '0px', padding: '8px 12px' }}>
                  <div className={styles.calcRow}>
                    <span>Tổng đã đóng:</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{formatVND(totalPaid)}</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Dự kiến còn lại:</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{formatVND(totalRemaining)}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span>Bắt đầu: {hui.startDate}</span>
                  <span className={hui.status === 'completed' ? styles.statusClosed : styles.statusActive}>
                    {hui.status === 'completed' ? 'Đã xong' : 'Đang chơi'}
                  </span>
                </div>
              </div>
            );
          })}

          {huis.length === 0 && !showAddForm && (
            <div className={`${styles.emptyState} glass-card`}>
              <Calendar size={40} className={styles.emptyIcon} />
              <p>Chưa có dây hụi nào được ghi chép. Hãy tạo mới để theo dõi.</p>
            </div>
          )}
        </section>
      ) : (
        /* Detailed View of a specific Hui line */
        <section className={styles.detailContainer}>
          <div className={`${styles.detailHeaderCard} glass-card`}>
            <h2>{selectedHui.name}</h2>
            <div className={styles.detailStats}>
              <div className={styles.detailStat}>
                <span className={styles.statLabel}>Chân hụi cần đóng</span>
                <span className={styles.statVal}>{formatVND(selectedHui.amount)}</span>
              </div>
              <div className={styles.detailStat}>
                <span className={styles.statLabel}>Đã đóng</span>
                <span className={styles.statVal} style={{ color: 'var(--secondary)' }}>
                  {formatVND(selectedHui.roundsData.filter(r => r.status === 'completed').reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0))}
                </span>
              </div>
              <div className={styles.detailStat}>
                <span className={styles.statLabel}>Dự kiến còn lại</span>
                <span className={styles.statVal} style={{ color: 'var(--danger)' }}>
                  {formatVND(Math.max(selectedHui.totalShares - selectedHui.roundsData.filter(r => r.status === 'completed').length, 0) * selectedHui.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.roundsSection}>
            <div className={styles.roundsHeader}>
              <h3>Danh sách chi tiết theo từng tuần/kỳ</h3>
            </div>

            <div className={styles.roundsList}>
              {(selectedHui.roundsData || []).map((r) => {
                const roundNum = r.round;
                const isCompleted = r.status === 'completed';
                const isPaying = payingRoundNum === roundNum;

                return (
                  <div key={roundNum} className={`${styles.roundCard} glass-card ${isCompleted ? styles.roundCompleted : ''}`} style={{ padding: '14px 18px' }}>
                    <div className={styles.roundHeaderRow}>
                      <span className={styles.roundBadge}>Kỳ {roundNum}</span>
                      
                      {isCompleted ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Đã đóng: <strong style={{ color: 'var(--text-primary)' }}>{formatVND(r.amountPaid)}</strong>
                          </span>
                          <button 
                            onClick={() => handleResetRound(selectedHui, roundNum)}
                            className={styles.btnResetRound}
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Hủy đóng
                          </button>
                        </div>
                      ) : (
                        !isPaying && (
                          <button 
                            onClick={() => handleOpenPayRound(selectedHui, r)}
                            className={styles.btnSetupRound}
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          >
                            Đóng hụi
                          </button>
                        )
                      )}
                    </div>

                    {isPaying && (
                      <div className={styles.roundEditBox} style={{ margin: '8px 0 0 0', padding: '12px' }}>
                        <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Ghi nhận đóng hụi kỳ {roundNum}</h4>
                        <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
                          <label className={styles.inputLabel}>Số tiền thực tế đóng (VND)</label>
                          <input 
                            type="text" 
                            value={rawPaidVal}
                            onChange={handlePaidValChange}
                            className={styles.input}
                            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                            autoFocus
                          />
                        </div>
                        <div className={styles.editActions}>
                          <button 
                            onClick={() => handleSavePayRound(selectedHui)}
                            className={styles.btnSaveRound}
                            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          >
                            Lưu
                          </button>
                          <button 
                            onClick={() => setPayingRoundNum(null)}
                            className={styles.btnCancelRound}
                            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
