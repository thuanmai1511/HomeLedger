'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Briefcase, 
  X, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  DollarSign, 
  ArrowLeft,
  Hammer,
  HardHat,
  Users,
  Info
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './ProjectsView.module.css';

export default function ProjectsView() {
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject
  } = useStore();

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Project Form state
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [rawContractValue, setRawContractValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Add Project Payment state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payDesc, setPayDesc] = useState('');
  const [rawPayAmount, setRawPayAmount] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Add Project Expense state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expType, setExpType] = useState('materials'); // 'materials' | 'labor' | 'other'
  const [expDesc, setExpDesc] = useState('');
  const [rawExpAmount, setRawExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);

  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handleContractValueChange = (e) => {
    setRawContractValue(formatNumberString(e.target.value));
  };

  const handlePayAmountChange = (e) => {
    setRawPayAmount(formatNumberString(e.target.value));
  };

  const handleExpAmountChange = (e) => {
    setRawExpAmount(formatNumberString(e.target.value));
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  // Project financials calculation
  const projectStats = useMemo(() => {
    if (!selectedProject) return null;
    
    const totalPayments = (selectedProject.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalExpenses = (selectedProject.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    // Categorized costs
    const materialsCost = (selectedProject.expenses || [])
      .filter(e => e.type === 'materials')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const laborCost = (selectedProject.expenses || [])
      .filter(e => e.type === 'labor')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const otherCost = (selectedProject.expenses || [])
      .filter(e => e.type === 'other')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const remainingDebt = Math.max(Number(selectedProject.contractValue) - totalPayments, 0);
    const actualProfit = totalPayments - totalExpenses;
    const projectedProfit = Number(selectedProject.contractValue) - totalExpenses;

    return {
      totalPayments,
      totalExpenses,
      materialsCost,
      laborCost,
      otherCost,
      remainingDebt,
      actualProfit,
      projectedProfit
    };
  }, [selectedProject]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    const val = Number(rawContractValue.replace(/\./g, ''));
    if (!name.trim() || isNaN(val) || val <= 0) return;

    addProject({
      name,
      client,
      location,
      contractValue: val,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      status: 'in_progress', // 'in_progress' | 'completed'
      payments: [],
      expenses: []
    });

    setName('');
    setClient('');
    setLocation('');
    setRawContractValue('');
    setStartDate('');
    setEndDate('');
    setShowAddForm(false);
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    const amt = Number(rawPayAmount.replace(/\./g, ''));
    if (!payDesc.trim() || isNaN(amt) || amt <= 0 || !selectedProject) return;

    const newPayment = {
      id: 'pay-' + Date.now(),
      description: payDesc,
      amount: amt,
      date: payDate
    };

    updateProject({
      ...selectedProject,
      payments: [...(selectedProject.payments || []), newPayment]
    });

    setPayDesc('');
    setRawPayAmount('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setShowPaymentForm(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const amt = Number(rawExpAmount.replace(/\./g, ''));
    if (!expDesc.trim() || isNaN(amt) || amt <= 0 || !selectedProject) return;

    const newExpense = {
      id: 'exp-' + Date.now(),
      type: expType,
      description: expDesc,
      amount: amt,
      date: expDate
    };

    updateProject({
      ...selectedProject,
      expenses: [...(selectedProject.expenses || []), newExpense]
    });

    setExpDesc('');
    setRawExpAmount('');
    setExpDate(new Date().toISOString().split('T')[0]);
    setShowExpenseForm(false);
  };

  const handleDeletePayment = (payment) => {
    if (!selectedProject) return;
    if (confirm(`Bạn có chắc chắn muốn xóa đợt thu "${payment.description}"?`)) {
      updateProject({
        ...selectedProject,
        payments: selectedProject.payments.filter(p => p.id !== payment.id)
      });
    }
  };

  const handleDeleteExpense = (expense) => {
    if (!selectedProject) return;
    if (confirm(`Bạn có chắc chắn muốn xóa chi phí "${expense.description}"?`)) {
      updateProject({
        ...selectedProject,
        expenses: selectedProject.expenses.filter(e => e.id !== expense.id)
      });
    }
  };

  const handleToggleStatus = () => {
    if (!selectedProject) return;
    const nextStatus = selectedProject.status === 'completed' ? 'in_progress' : 'completed';
    updateProject({
      ...selectedProject,
      status: nextStatus
    });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      {!activeProjectId ? (
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Quản lý công trình thầu</h1>
            <p className={styles.subtitle}>Theo dõi hợp đồng, dòng tiền vật tư, nhân công thợ và lợi nhuận công trình.</p>
          </div>

          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={styles.btnAdd}
            id="btn-toggle-add-project"
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showAddForm ? 'Đóng' : 'Nhận công trình mới'}</span>
          </button>
        </header>
      ) : (
        <header className={styles.header}>
          <button 
            onClick={() => setActiveProjectId(null)} 
            className={styles.btnBack}
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>

          <div className={styles.headerActions}>
            <button 
              onClick={handleToggleStatus} 
              className={selectedProject?.status === 'completed' ? styles.btnStatusActive : styles.btnStatusComplete}
            >
              {selectedProject?.status === 'completed' ? 'Đánh dấu: Đang thi công' : 'Đánh dấu: Hoàn thành bàn giao'}
            </button>
            <button 
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xóa công trình "${selectedProject.name}"? Dòng tiền lưu trong dự án này sẽ mất.`)) {
                  deleteProject(selectedProject.id);
                  setActiveProjectId(null);
                }
              }}
              className={styles.btnDanger}
            >
              <Trash2 size={16} />
              <span>Xóa công trình</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      {!activeProjectId ? (
        <>
          {/* Add Project Form */}
          {showAddForm && (
            <section className={`${styles.formCard} glass-card`}>
              <h3 className={styles.formTitle}>Đăng ký công trình nhận thầu mới</h3>
              <form onSubmit={handleCreateProject} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Tên công trình</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ví dụ: Xây dựng nhà phố Q2 - Anh Tuấn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Chủ đầu tư (Tên khách hàng)</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Nguyễn Văn Tuấn"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Địa điểm xây dựng</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Thảo Điền, Quận 2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Giá trị hợp đồng thầu (VND)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="0"
                      value={rawContractValue}
                      onChange={handleContractValueChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Ngày khởi công</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Ngày hoàn thành dự kiến</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <button type="submit" className={styles.btnSubmit}>Lưu công trình</button>
              </form>
            </section>
          )}

          {/* List of projects */}
          <section className={styles.projectGrid}>
            {projects.map((p) => {
              const totalPayments = (p.payments || []).reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
              const totalExpenses = (p.expenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
              const debt = Math.max(Number(p.contractValue) - totalPayments, 0);
              const profit = totalPayments - totalExpenses;

              return (
                <div 
                  key={p.id} 
                  className={`${styles.projectCard} glass-card`} 
                  onClick={() => setActiveProjectId(p.id)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.iconBox}>
                      <HardHat size={22} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 className={styles.projectName}>{p.name}</h3>
                      <span className={p.status === 'completed' ? styles.statusClosed : styles.statusActive}>
                        {p.status === 'completed' ? 'Đã bàn giao' : 'Đang thi công'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardBriefDetails}>
                    <div className={styles.briefRow}>
                      <span>Giá trị thầu:</span>
                      <strong>{formatVND(p.contractValue)}</strong>
                    </div>
                    <div className={styles.briefRow}>
                      <span>Đã chi phí:</span>
                      <strong style={{ color: 'var(--danger)' }}>{formatVND(totalExpenses)}</strong>
                    </div>
                    <div className={styles.briefRow}>
                      <span>Chủ nhà nợ:</span>
                      <strong style={{ color: debt > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{formatVND(debt)}</strong>
                    </div>
                    <div className={styles.briefRow}>
                      <span>Thực lãi:</span>
                      <strong style={{ color: profit >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{formatVND(profit)}</strong>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <Calendar size={12} />
                    <span>Bắt đầu: {p.startDate}</span>
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && !showAddForm && (
              <div className={styles.emptyState}>
                <Hammer size={40} className={styles.emptyIcon} />
                <p>Chưa có công trình nào được ghi nhận. Nhấn "Nhận công trình mới" để bắt đầu thiết lập thầu.</p>
              </div>
            )}
          </section>
        </>
      ) : (
        /* Detailed view of active project */
        <div className={styles.detailContainer}>
          <div className={styles.detailTitleArea}>
            <h2 className={styles.detailTitle}>{selectedProject?.name}</h2>
            <p className={styles.detailMeta}>
              Chủ đầu tư: <strong>{selectedProject?.client || 'Khác'}</strong> • Địa điểm: <strong>{selectedProject?.location || 'Khác'}</strong>
            </p>
          </div>

          {/* Upgraded Financial calculations (P&L Card) */}
          <section className={`${styles.overviewCard} glass-card`}>
            <div className={styles.reportSectionHeader}>
              <h3 className={styles.cardTitle}>Báo cáo tài chính & Hiệu quả dự án</h3>
              <span className={styles.badgeReport}>Công trình độc lập</span>
            </div>

            <div className={styles.reportMainSections}>
              {/* Group 1: Revenue & Contract status */}
              <div className={styles.reportSubCard}>
                <h4 className={styles.subCardTitle}>💳 DOANH THU & HỢP ĐỒNG</h4>
                <div className={styles.subCardStat}>
                  <span className={styles.statLabel}>Giá trị hợp đồng ký kết</span>
                  <strong className={styles.statVal}>{formatVND(selectedProject.contractValue)}</strong>
                </div>
                <div className={styles.subCardStat}>
                  <span className={styles.statLabel}>Đã thu hồi (Doanh thu thực tế)</span>
                  <strong className={styles.statVal} style={{ color: 'var(--secondary)' }}>{formatVND(projectStats.totalPayments)}</strong>
                </div>
                <div className={styles.subCardStat}>
                  <span className={styles.statLabel}>Chủ nhà còn nợ (Công nợ)</span>
                  <strong className={styles.statVal} style={{ color: projectStats.remainingDebt > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {formatVND(projectStats.remainingDebt)}
                  </strong>
                </div>

                {/* Progress bar */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressLabel}>
                    <span>Tiến độ thu tiền:</span>
                    <strong>{selectedProject.contractValue > 0 ? Math.round((projectStats.totalPayments / selectedProject.contractValue) * 100) : 0}%</strong>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ 
                        width: `${Math.min(selectedProject.contractValue > 0 ? (projectStats.totalPayments / selectedProject.contractValue) * 100 : 0, 100)}%`,
                        backgroundColor: 'var(--secondary)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Expenses & Costs */}
              <div className={styles.reportSubCard}>
                <h4 className={styles.subCardTitle}>🧱 CHI PHÍ ĐÃ CHI</h4>
                <div className={styles.subCardStat}>
                  <span className={styles.statLabel}>Tổng chi phí xây dựng đã chi</span>
                  <strong className={styles.statVal} style={{ color: 'var(--danger)' }}>{formatVND(projectStats.totalExpenses)}</strong>
                </div>

                <div className={styles.costBreakdownMini}>
                  <div className={styles.breakdownRow}>
                    <span>🧱 Vật liệu xây tô</span>
                    <strong>{formatVND(projectStats.materialsCost)}</strong>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>👷 Nhân công & Tổ thợ</span>
                    <strong>{formatVND(projectStats.laborCost)}</strong>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>⚙️ Máy móc & Khác</span>
                    <strong>{formatVND(projectStats.otherCost)}</strong>
                  </div>
                </div>

                {/* Expense/Revenue Ratio */}
                <div className={styles.progressContainer} style={{ marginTop: '14px' }}>
                  <div className={styles.progressLabel}>
                    <span>Tỉ lệ chi phí / Doanh thu:</span>
                    <strong>{projectStats.totalPayments > 0 ? Math.round((projectStats.totalExpenses / projectStats.totalPayments) * 100) : 0}%</strong>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ 
                        width: `${Math.min(projectStats.totalPayments > 0 ? (projectStats.totalExpenses / projectStats.totalPayments) * 100 : 0, 100)}%`,
                        backgroundColor: 'var(--danger)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Profitability */}
              <div className={styles.reportSubCard} style={{ gridColumn: '1 / -1' }}>
                <h4 className={styles.subCardTitle}>📈 LỢI NHUẬN THỰC THẾ & DỰ KIẾN</h4>
                <div className={styles.profitHighlightGrid}>
                  <div className={styles.profitBox}>
                    <span className={styles.profitBoxLabel}>Lợi nhuận thực tế hiện tại (Tiền mặt đã thu - Đã chi)</span>
                    <strong className={styles.profitBoxVal} style={{ color: projectStats.actualProfit >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>
                      {formatVND(projectStats.actualProfit)}
                    </strong>
                  </div>
                  <div className={styles.profitBox}>
                    <span className={styles.profitBoxLabel}>Lợi nhuận ước tính khi bàn giao (Giá trị thầu - Đã chi)</span>
                    <strong className={styles.profitBoxVal} style={{ color: projectStats.projectedProfit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                      {formatVND(projectStats.projectedProfit)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action modules (Thu tiền & Chi phí) */}
          <div className={styles.actionsPanel}>
            {/* Record Revenue card */}
            <div className={`${styles.actionCard} glass-card`}>
              <div className={styles.actionCardHeader}>
                <h3 className={styles.actionCardTitle}>Ghi nhận thu tiền chủ nhà</h3>
                <button 
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className={styles.btnToggleForm}
                >
                  {showPaymentForm ? 'Hủy' : 'Ghi nhận đợt thu'}
                </button>
              </div>

              {showPaymentForm ? (
                <form onSubmit={handleAddPayment} className={styles.actionForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Nội dung đợt thu (Giai đoạn)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ví dụ: Tạm ứng đợt 1, Xong sàn 1..."
                      value={payDesc}
                      onChange={(e) => setPayDesc(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.inputLabel}>Số tiền nhận (VND)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="0"
                        value={rawPayAmount}
                        onChange={handlePayAmountChange}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.inputLabel}>Ngày nhận tiền</label>
                      <input 
                        type="date" 
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <button type="submit" className={styles.btnSaveAction}>Lưu đợt thu</button>
                </form>
              ) : (
                <div className={styles.dataList}>
                  {(selectedProject.payments || []).map((p) => (
                    <div key={p.id} className={styles.dataListItem}>
                      <div>
                        <span className={styles.dataListDesc}>{p.description}</span>
                        <span className={styles.dataListDate}>{p.date}</span>
                      </div>
                      <div className={styles.dataListRight}>
                        <span className={styles.dataListAmtPositive}>+ {formatVND(p.amount)}</span>
                        <button onClick={() => handleDeletePayment(p)} className={styles.btnDeleteMini}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(selectedProject.payments || []).length === 0 && (
                    <p className={styles.emptyListText}>Chưa ghi nhận đợt thu nào.</p>
                  )}
                </div>
              )}
            </div>

            {/* Record Expense card */}
            <div className={`${styles.actionCard} glass-card`}>
              <div className={styles.actionCardHeader}>
                <h3 className={styles.actionCardTitle}>Ghi nhận chi phí công trình</h3>
                <button 
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className={styles.btnToggleForm}
                >
                  {showExpenseForm ? 'Hủy' : 'Ghi nhận chi phí'}
                </button>
              </div>

              {showExpenseForm ? (
                <form onSubmit={handleAddExpense} className={styles.actionForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Loại chi phí công trình</label>
                    <select 
                      value={expType}
                      onChange={(e) => setExpType(e.target.value)}
                      className={styles.input}
                    >
                      <option value="materials">🧱 Vật liệu xây dựng (Vật tư)</option>
                      <option value="labor">👷 Nhân công / Tổ thợ</option>
                      <option value="other">⚙️ Thiết bị / Chi phí khác</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Nội dung chi tiết (Cửa hàng / Người nhận)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ví dụ: Mua thép Pomina - Đại lý sắt thép, Trả lương thợ nề..."
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.inputLabel}>Số tiền chi (VND)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="0"
                        value={rawExpAmount}
                        onChange={handleExpAmountChange}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.inputLabel}>Ngày chi phí</label>
                      <input 
                        type="date" 
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button type="submit" className={styles.btnSaveAction}>Lưu chi phí</button>
                </form>
              ) : (
                <div className={styles.dataList}>
                  {(selectedProject.expenses || []).map((exp) => {
                    const typeLabelMap = {
                      materials: '🧱 Vật tư',
                      labor: '👷 Nhân công',
                      other: '⚙️ Khác'
                    };
                    return (
                      <div key={exp.id} className={styles.dataListItem}>
                        <div>
                          <span className={styles.dataListDesc}>
                            <strong style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>[{typeLabelMap[exp.type]}]</strong> {exp.description}
                          </span>
                          <span className={styles.dataListDate}>{exp.date}</span>
                        </div>
                        <div className={styles.dataListRight}>
                          <span className={styles.dataListAmtNegative}>- {formatVND(exp.amount)}</span>
                          <button onClick={() => handleDeleteExpense(exp)} className={styles.btnDeleteMini}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(selectedProject.expenses || []).length === 0 && (
                    <p className={styles.emptyListText}>Chưa ghi nhận chi phí nào.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
