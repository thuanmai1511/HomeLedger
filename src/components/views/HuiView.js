'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Users, X, Info, Check, ShieldAlert } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './HuiView.module.css';

export default function HuiView() {
  const { huis, members, addHui, updateHui, deleteHui } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeHuiId, setActiveHuiId] = useState(null);

  // Form states for new Hui Line
  const [name, setName] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [totalShares, setTotalShares] = useState(10);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState('monthly');

  // Modal / inline edit state for a specific round
  const [editingRound, setEditingRound] = useState(null); // { roundNumber, wonBy, bidAmount }
  const [selectedRoundNum, setSelectedRoundNum] = useState(null);
  const [roundWonBy, setRoundWonBy] = useState('');
  const [rawRoundBid, setRawRoundBid] = useState('');

  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handleAmountChange = (e) => {
    setRawAmount(formatNumberString(e.target.value));
  };

  const handleRoundBidChange = (e) => {
    setRawRoundBid(formatNumberString(e.target.value));
  };

  const handleCreateHui = (e) => {
    e.preventDefault();
    const amountVal = Number(rawAmount.replace(/\./g, ''));
    if (!name.trim() || isNaN(amountVal) || amountVal <= 0) return;

    // Generate empty rounds structure
    const rounds = [];
    for (let i = 1; i <= totalShares; i++) {
      rounds.push({
        round: i,
        wonBy: null,
        bidAmount: 0,
        date: '',
        status: 'pending' // 'pending' | 'completed'
      });
    }

    addHui({
      name,
      amount: amountVal,
      frequency,
      totalShares: Number(totalShares),
      startDate,
      roundsData: rounds
    });

    setName('');
    setRawAmount('');
    setTotalShares(10);
    setStartDate(new Date().toISOString().split('T')[0]);
    setFrequency('monthly');
    setShowAddForm(false);
  };

  const handleOpenRoundEdit = (hui, roundObj) => {
    setSelectedRoundNum(roundObj.round);
    setRoundWonBy(roundObj.wonBy || members[0]?.id || '');
    setRawRoundBid(roundObj.bidAmount ? new Intl.NumberFormat('vi-VN').format(roundObj.bidAmount) : '0');
    setEditingRound(roundObj);
  };

  const handleSaveRound = (hui) => {
    const bidVal = Number(rawRoundBid.replace(/\./g, '')) || 0;
    
    const updatedRounds = hui.roundsData.map(r => {
      if (r.round === selectedRoundNum) {
        return {
          ...r,
          wonBy: roundWonBy || null,
          bidAmount: bidVal,
          status: 'completed',
          date: new Date().toISOString().split('T')[0]
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

    setEditingRound(null);
    setSelectedRoundNum(null);
  };

  const handleResetRound = (hui, roundNum) => {
    const updatedRounds = hui.roundsData.map(r => {
      if (r.round === roundNum) {
        return {
          ...r,
          wonBy: null,
          bidAmount: 0,
          status: 'pending',
          date: ''
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
          <h1 className={styles.title}>Ghi chép Dây Hụi</h1>
          <p className={styles.subtitle}>Quản lý các dây hụi/họ của gia đình, theo dõi số tiền đóng và tính tiền hốt hụi chi tiết.</p>
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
          {activeHuiId ? 'Quay lại' : (showAddForm ? <X size={18} /> : <Plus size={18} />)}
          <span>{activeHuiId ? 'Quay lại' : (showAddForm ? 'Đóng' : 'Tạo dây hụi')}</span>
        </button>
      </header>

      {/* Add Hui Line Form */}
      {!activeHuiId && showAddForm && (
        <section className={`${styles.formCard} glass-card`}>
          <h3 className={styles.formTitle}>Mở dây hụi mới</h3>
          <form onSubmit={handleCreateHui} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Tên dây hụi</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: Hụi tháng 2 triệu Mẹ Thảo..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Số tiền đóng/chân (VND)</label>
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
                <label className={styles.inputLabel}>Tổng số chân (Kỳ hụi)</label>
                <input 
                  type="number" 
                  required
                  min="2"
                  max="100"
                  value={totalShares}
                  onChange={(e) => setTotalShares(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Tần suất khui</label>
                <select 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)}
                  className={styles.input}
                >
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                  <option value="daily">Hàng ngày</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Ngày mở hụi</label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <button type="submit" className={styles.btnSubmit}>Lưu</button>
          </form>
        </section>
      )}

      {/* Main Content Area */}
      {!activeHuiId ? (
        <section className={styles.listGrid}>
          {huis.map((hui) => {
            const completedRounds = (hui.roundsData || []).filter(r => r.status === 'completed').length;
            const totalRounds = hui.totalShares;
            const progressPct = Math.round((completedRounds / totalRounds) * 100) || 0;

            return (
              <div key={hui.id} className={`${styles.huiCard} glass-card`} onClick={() => setActiveHuiId(hui.id)}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    <Users size={20} color="var(--primary)" />
                  </div>
                  <div className={styles.huiInfo}>
                    <h3 className={styles.huiName}>{hui.name}</h3>
                    <div className={styles.huiMeta}>
                      <span>Chân hụi: <strong>{formatVND(hui.amount)}</strong></span>
                      <span>• {hui.frequency === 'monthly' ? 'Hàng tháng' : 'Hàng tuần'}</span>
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
                    <span>Tiến độ: {completedRounds}/{totalRounds} kỳ</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span>Ngày mở: {hui.startDate}</span>
                  <span className={hui.status === 'completed' ? styles.statusClosed : styles.statusActive}>
                    {hui.status === 'completed' ? 'Đã hoàn thành' : 'Đang chạy'}
                  </span>
                </div>
              </div>
            );
          })}

          {huis.length === 0 && !showAddForm && (
            <div className={`${styles.emptyState} glass-card`}>
              <Users size={40} className={styles.emptyIcon} />
              <p>Chưa có dây hụi nào được ghi chép. Hãy tạo dây hụi để theo dõi.</p>
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
                <span className={styles.statLabel}>Chân hụi</span>
                <span className={styles.statVal}>{formatVND(selectedHui.amount)}</span>
              </div>
              <div className={styles.detailStat}>
                <span className={styles.statLabel}>Số chân/kỳ</span>
                <span className={styles.statVal}>{selectedHui.totalShares}</span>
              </div>
              <div className={styles.detailStat}>
                <span className={styles.statLabel}>Tần suất</span>
                <span className={styles.statVal}>
                  {selectedHui.frequency === 'monthly' ? 'Hàng tháng' : selectedHui.frequency === 'weekly' ? 'Hàng tuần' : 'Hàng ngày'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.roundsSection}>
            <div className={styles.roundsHeader}>
              <h3>Danh sách các kỳ khui hụi</h3>
              <div className={styles.roundsInfoAlert}>
                <Info size={16} />
                <span>
                  <strong>Hụi sống:</strong> Người chưa hốt đóng (Chân hụi - Tiền thảo). <br />
                  <strong>Hụi chết:</strong> Người đã hốt đóng đủ 100% Chân hụi.
                </span>
              </div>
            </div>

            <div className={styles.roundsList}>
              {(selectedHui.roundsData || []).map((r, index) => {
                const roundNum = r.round;
                const isCompleted = r.status === 'completed';
                
                // Calculations for this round
                const deadShares = index; // number of people won in previous rounds
                const liveShares = selectedHui.totalShares - index; // includes the current winner in calculations

                const contributionDead = selectedHui.amount;
                const contributionLive = Math.max(selectedHui.amount - r.bidAmount, 0);

                // Total received for the winner in this round
                // Winner receives contribution from dead shares + live shares (excluding themselves)
                // Live shares excluding winner: liveShares - 1
                const totalReceived = (deadShares * contributionDead) + ((liveShares - 1) * contributionLive);

                const winnerMember = members.find(m => m.id === r.wonBy);

                return (
                  <div key={roundNum} className={`${styles.roundCard} glass-card ${isCompleted ? styles.roundCompleted : ''}`}>
                    <div className={styles.roundHeaderRow}>
                      <span className={styles.roundBadge}>Kỳ thứ {roundNum}</span>
                      {isCompleted ? (
                        <div className={styles.roundActions}>
                          <button 
                            onClick={() => handleResetRound(selectedHui, roundNum)}
                            className={styles.btnResetRound}
                          >
                            Cài lại
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenRoundEdit(selectedHui, r)}
                          className={styles.btnSetupRound}
                        >
                          Thiết lập hốt hụi
                        </button>
                      )}
                    </div>

                    {isCompleted ? (
                      <div className={styles.roundDetails}>
                        <div className={styles.winnerLine}>
                          <span>Người hốt hụi:</span>
                          <span className={styles.winnerName} style={{ color: winnerMember?.color }}>
                            {winnerMember?.avatar} {winnerMember?.name || 'Thành viên'}
                          </span>
                        </div>
                        <div className={styles.bidLine}>
                          <span>Tiền bỏ hụi (Thảo hụi):</span>
                          <strong>{formatVND(r.bidAmount)}</strong>
                        </div>
                        
                        <div className={styles.calculationsTable}>
                          <div className={styles.calcRow}>
                            <span>Hụi sống đóng ({liveShares - 1} người):</span>
                            <span>{formatVND(contributionLive)} / người</span>
                          </div>
                          {deadShares > 0 && (
                            <div className={styles.calcRow}>
                              <span>Hụi chết đóng ({deadShares} người):</span>
                              <span>{formatVND(contributionDead)} / người</span>
                            </div>
                          )}
                          <div className={`${styles.calcRow} ${styles.totalRow}`}>
                            <span>Tiền hốt thực tế nhận về:</span>
                            <span className={styles.totalVal}>{formatVND(totalReceived)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.roundPendingState}>
                        <p>Kỳ này chưa khui. Chờ thiết lập thông tin hốt hụi.</p>
                      </div>
                    )}

                    {/* Edit Form Inline for the round */}
                    {editingRound && selectedRoundNum === roundNum && (
                      <div className={styles.roundEditBox}>
                        <h4>Cập nhật kết quả Kỳ {roundNum}</h4>
                        <div className={styles.formGroup}>
                          <label className={styles.inputLabel}>Thành viên hốt hụi</label>
                          <select 
                            value={roundWonBy} 
                            onChange={(e) => setRoundWonBy(e.target.value)}
                            className={styles.input}
                          >
                            {members.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.inputLabel}>Tiền bỏ hụi (VND)</label>
                          <input 
                            type="text" 
                            placeholder="Nhập số tiền..."
                            value={rawRoundBid}
                            onChange={handleRoundBidChange}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.editActions}>
                          <button 
                            onClick={() => handleSaveRound(selectedHui)}
                            className={styles.btnSaveRound}
                          >
                            Xác nhận
                          </button>
                          <button 
                            onClick={() => {
                              setEditingRound(null);
                              setSelectedRoundNum(null);
                            }}
                            className={styles.btnCancelRound}
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
