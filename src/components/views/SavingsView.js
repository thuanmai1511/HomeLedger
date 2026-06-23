'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  PiggyBank, 
  X, 
  Check, 
  Home, 
  Car, 
  GraduationCap, 
  Percent, 
  TrendingUp, 
  Info,
  DollarSign
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './SavingsView.module.css';

const IconMap = {
  standard: PiggyBank,
  house: Home,
  car: Car,
  child: GraduationCap
};

const TypeLabels = {
  standard: 'Tích lũy thường',
  house: 'Kế hoạch mua nhà',
  car: 'Kế hoạch mua ô tô',
  child: 'Quỹ nuôi con / Giáo dục'
};

export default function SavingsView() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Goal Type
  const [goalType, setGoalType] = useState('standard'); // 'standard' | 'house' | 'car' | 'child'

  // Common fields
  const [name, setName] = useState('');
  const [rawTarget, setRawTarget] = useState(''); // holds formatted string
  const [rawCurrent, setRawCurrent] = useState(''); // holds formatted string
  const [date, setDate] = useState('');

  // House/Car specific inputs
  const [assetPrice, setAssetPrice] = useState(''); 
  const [ownAmount, setOwnAmount] = useState(''); 
  const [saveYears, setSaveYears] = useState('5'); 
  const [saveRate, setSaveRate] = useState('6'); 
  const [needLoan, setNeedLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanRate, setLoanRate] = useState('8'); 
  const [loanYears, setLoanYears] = useState('10'); 

  // Child specific inputs
  const [childAge, setChildAge] = useState('1');
  const [childTargetAge, setChildTargetAge] = useState('18');

  // Add fund state
  const [activeFundId, setActiveFundId] = useState(null);
  const [rawFundAmount, setRawFundAmount] = useState(''); 

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

  const handleAssetPriceChange = (e) => {
    setAssetPrice(formatNumberString(e.target.value));
  };

  const handleOwnAmountChange = (e) => {
    setOwnAmount(formatNumberString(e.target.value));
  };

  const handleLoanAmountChange = (e) => {
    setLoanAmount(formatNumberString(e.target.value));
  };

  const handleFundAmountChange = (e) => {
    setRawFundAmount(formatNumberString(e.target.value));
  };

  // Helper parser for Goal data
  const parsedGoals = useMemo(() => {
    return goals.map(g => {
      let displayName = g.name;
      let metadata = { type: 'standard' };
      if (g.name && g.name.includes(' |PLAN| ')) {
        const parts = g.name.split(' |PLAN| ');
        displayName = parts[0];
        try {
          metadata = JSON.parse(parts[1]);
        } catch (e) {
          metadata = { type: 'standard' };
        }
      }
      return {
        ...g,
        displayName,
        metadata
      };
    });
  }, [goals]);

  // Dynamic calculations for preview
  const calcResults = useMemo(() => {
    const price = Number(assetPrice.replace(/\./g, '')) || 0;
    const own = Number(ownAmount.replace(/\./g, '')) || 0;
    const years = Number(saveYears) || 1;
    const rate = Number(saveRate) || 0;
    const loan = needLoan ? (Number(loanAmount.replace(/\./g, '')) || 0) : 0;
    const lRate = Number(loanRate) || 0;
    const lYears = Number(loanYears) || 1;

    // Accumulate target before purchase
    const accumulateTarget = Math.max(price - own - loan, 0);
    const monthsToSave = years * 12;
    const monthlyRate = rate / 12 / 100;

    let monthlySaveNeeded = 0;
    if (monthlyRate > 0) {
      monthlySaveNeeded = (accumulateTarget * monthlyRate) / (Math.pow(1 + monthlyRate, monthsToSave) - 1);
    } else {
      monthlySaveNeeded = accumulateTarget / monthsToSave;
    }

    // Loan repayment
    const loanMonths = lYears * 12;
    const loanMonthlyRate = lRate / 12 / 100;
    let monthlyLoanRepayment = 0;
    if (loan > 0) {
      if (loanMonthlyRate > 0) {
        monthlyLoanRepayment = (loan * loanMonthlyRate * Math.pow(1 + loanMonthlyRate, loanMonths)) / (Math.pow(1 + loanMonthlyRate, loanMonths) - 1);
      } else {
        monthlyLoanRepayment = loan / loanMonths;
      }
    }

    // Child raising fund
    const cAge = Number(childAge) || 0;
    const tAge = Number(childTargetAge) || 18;
    const childYears = Math.max(tAge - cAge, 1);
    const childMonths = childYears * 12;
    const childRate = rate / 12 / 100;
    const childTargetVal = Number(rawTarget.replace(/\./g, '')) || 0;
    const childCurrentVal = Number(rawCurrent.replace(/\./g, '')) || 0;

    // Grow initial values to target age
    const futureOwnValue = childCurrentVal * Math.pow(1 + childRate, childMonths);
    const childRemainingTarget = Math.max(childTargetVal - futureOwnValue, 0);
    
    let childMonthlySaveNeeded = 0;
    if (childRate > 0) {
      childMonthlySaveNeeded = (childRemainingTarget * childRate) / (Math.pow(1 + childRate, childMonths) - 1);
    } else {
      childMonthlySaveNeeded = childRemainingTarget / childMonths;
    }

    return {
      accumulateTarget,
      monthlySaveNeeded: Math.round(monthlySaveNeeded),
      monthlyLoanRepayment: Math.round(monthlyLoanRepayment),
      childYears,
      childMonthlySaveNeeded: Math.round(childMonthlySaveNeeded),
      futureOwnValue: Math.round(futureOwnValue)
    };
  }, [goalType, assetPrice, ownAmount, saveYears, saveRate, needLoan, loanAmount, loanRate, loanYears, childAge, childTargetAge, rawTarget, rawCurrent]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    
    let dbName = name;
    let finalTarget = 0;
    let finalCurrent = 0;
    let finalDate = date;

    const metadata = { type: goalType };

    if (goalType === 'standard') {
      finalTarget = Number(rawTarget.replace(/\./g, ''));
      finalCurrent = Number(rawCurrent.replace(/\./g, '')) || 0;
      if (!finalDate) {
        finalDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
      }
    } else if (goalType === 'house' || goalType === 'car') {
      const price = Number(assetPrice.replace(/\./g, ''));
      const own = Number(ownAmount.replace(/\./g, '')) || 0;
      const loan = needLoan ? (Number(loanAmount.replace(/\./g, '')) || 0) : 0;
      
      finalTarget = price;
      finalCurrent = own;
      
      const years = Number(saveYears) || 1;
      finalDate = new Date(Date.now() + years*365*24*60*60*1000).toISOString().split('T')[0];
      
      metadata.assetPrice = price;
      metadata.ownAmount = own;
      metadata.saveYears = years;
      metadata.saveRate = Number(saveRate);
      metadata.needLoan = needLoan;
      metadata.loanAmount = loan;
      metadata.loanRate = Number(loanRate);
      metadata.loanYears = Number(loanYears);
      metadata.monthlySaveNeeded = calcResults.monthlySaveNeeded;
      metadata.monthlyLoanRepayment = calcResults.monthlyLoanRepayment;
    } else if (goalType === 'child') {
      finalTarget = Number(rawTarget.replace(/\./g, ''));
      finalCurrent = Number(rawCurrent.replace(/\./g, '')) || 0;
      
      const cAge = Number(childAge) || 0;
      const tAge = Number(childTargetAge) || 18;
      const childYears = Math.max(tAge - cAge, 1);
      
      finalDate = new Date(Date.now() + childYears*365*24*60*60*1000).toISOString().split('T')[0];
      
      metadata.childAge = cAge;
      metadata.childTargetAge = tAge;
      metadata.saveRate = Number(saveRate);
      metadata.monthlySaveNeeded = calcResults.childMonthlySaveNeeded;
    }

    if (!name.trim() || isNaN(finalTarget) || finalTarget <= 0) return;

    // Serialize plan metadata inside name field
    dbName = name + ' |PLAN| ' + JSON.stringify(metadata);

    addGoal({
      name: dbName,
      target: finalTarget,
      current: finalCurrent,
      date: finalDate
    });

    // Reset form
    setName('');
    setRawTarget('');
    setRawCurrent('');
    setDate('');
    setAssetPrice('');
    setOwnAmount('');
    setSaveYears('5');
    setSaveRate('6');
    setNeedLoan(false);
    setLoanAmount('');
    setLoanRate('8');
    setLoanYears('10');
    setChildAge('1');
    setChildTargetAge('18');
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
          <h1 className={styles.title}>Hoạch định tài chính dài hạn</h1>
          <p className={styles.subtitle}>Lên kế hoạch tiết kiệm mua nhà, ô tô, quỹ nuôi con và dự án tương lai.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.btnAdd}
          id="btn-toggle-add-goal"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'Đóng' : 'Kế hoạch mới'}</span>
        </button>
      </header>

      {/* Add Goal Form */}
      {showAddForm && (
        <section className={`${styles.formCard} glass-card`}>
          <h3 className={styles.formTitle}>Thiết lập kế hoạch mục tiêu tài chính mới</h3>
          
          <div className={styles.tabSelector}>
            {Object.keys(TypeLabels).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setGoalType(type)}
                className={`${styles.tabBtn} ${goalType === type ? styles.tabBtnActive : ''}`}
              >
                {type === 'standard' && <PiggyBank size={16} />}
                {type === 'house' && <Home size={16} />}
                {type === 'car' && <Car size={16} />}
                {type === 'child' && <GraduationCap size={16} />}
                <span>{TypeLabels[type]}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleAddGoal} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                {goalType === 'child' ? 'Tên con / Quỹ học vấn' : 'Tên kế hoạch mục tiêu'}
              </label>
              <input 
                type="text" 
                required
                placeholder={
                  goalType === 'house' ? 'Ví dụ: Mua chung cư Vinhomes' :
                  goalType === 'car' ? 'Ví dụ: Mua Mazda 3 Premium' :
                  goalType === 'child' ? 'Ví dụ: Học đại học Gia Bảo' :
                  'Ví dụ: Quỹ du lịch Châu Âu...'
                } 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                id="goal-name-input"
              />
            </div>

            {/* Standard saving type fields */}
            {goalType === 'standard' && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Số tiền cần tích lũy (VND)</label>
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
                  <label className={styles.inputLabel}>Hạn định thanh toán</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={styles.input}
                    id="goal-date-input"
                  />
                </div>
              </>
            )}

            {/* House/Car Type fields */}
            {(goalType === 'house' || goalType === 'car') && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>
                      Giá trị {goalType === 'house' ? 'nhà / đất' : 'ô tô'} (VND)
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="0" 
                      value={assetPrice}
                      onChange={handleAssetPriceChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Số tiền tự có hiện tại (VND)</label>
                    <input 
                      type="text" 
                      placeholder="0" 
                      value={ownAmount}
                      onChange={handleOwnAmountChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Thời gian tích lũy (năm)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="30"
                      value={saveYears}
                      onChange={(e) => setSaveYears(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Lãi suất tiết kiệm (%/năm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="20"
                      value={saveRate}
                      onChange={(e) => setSaveRate(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <input 
                    type="checkbox"
                    id="need-loan-check"
                    checked={needLoan}
                    onChange={(e) => setNeedLoan(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <label htmlFor="need-loan-check" className={styles.checkboxLabel}>
                    Tôi cần vay ngân hàng để mua trả góp tài sản này
                  </label>
                </div>

                {needLoan && (
                  <div className={`${styles.loanSection} glass-card`}>
                    <h4 className={styles.sectionSubTitle}>Thông tin vay trả góp ngân hàng</h4>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.inputLabel}>Số tiền dự kiến vay ngân hàng (VND)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="0" 
                        value={loanAmount}
                        onChange={handleLoanAmountChange}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.inputLabel}>Kỳ hạn vay (năm)</label>
                        <input 
                          type="number" 
                          min="1"
                          max="35"
                          value={loanYears}
                          onChange={(e) => setLoanYears(e.target.value)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.inputLabel}>Lãi suất vay dự kiến (%/năm)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          min="0"
                          max="25"
                          value={loanRate}
                          onChange={(e) => setLoanRate(e.target.value)}
                          className={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Child savings target */}
            {goalType === 'child' && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Mục tiêu số tiền tích lũy (VND)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: 500.000.000" 
                      value={rawTarget}
                      onChange={handleTargetChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Số tiền tích lũy sẵn có (VND)</label>
                    <input 
                      type="text" 
                      placeholder="0" 
                      value={rawCurrent}
                      onChange={handleCurrentChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Tuổi hiện tại của con</label>
                    <input 
                      type="number" 
                      min="0"
                      max="17"
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Tích lũy đến khi con bao nhiêu tuổi?</label>
                    <input 
                      type="number" 
                      min="1"
                      max="30"
                      value={childTargetAge}
                      onChange={(e) => setChildTargetAge(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Lãi suất tích lũy kỳ vọng (%/năm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="20"
                    value={saveRate}
                    onChange={(e) => setSaveRate(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </>
            )}

            {/* Calculated Plan Preview */}
            <div className={`${styles.previewCard} glass-card`}>
              <h4 className={styles.previewTitle}>
                <TrendingUp size={16} /> Lộ trình & Kế hoạch tài chính dự kiến
              </h4>

              {goalType === 'standard' && (
                <p className={styles.previewText}>
                  Thiết lập mục tiêu tích lũy thường. Số tiền tiết kiệm sẽ được cập nhật thủ công khi bạn nạp thêm tiền.
                </p>
              )}

              {(goalType === 'house' || goalType === 'car') && (
                <div className={styles.previewStats}>
                  <div className={styles.previewStatRow}>
                    <span>Hạn tích lũy mua tài sản:</span>
                    <strong>{saveYears} năm</strong>
                  </div>
                  <div className={styles.previewStatRow}>
                    <span>Tổng cần tích lũy trước:</span>
                    <strong style={{ color: 'var(--primary)' }}>{formatVND(calcResults.accumulateTarget)}</strong>
                  </div>
                  <div className={styles.previewStatRow}>
                    <span>Cần tích lũy hàng tháng:</span>
                    <strong style={{ color: 'var(--secondary)' }}>
                      {formatVND(calcResults.monthlySaveNeeded)} / tháng
                    </strong>
                  </div>
                  {needLoan && (
                    <>
                      <div className={`${styles.previewStatRow} ${styles.divider}`}>
                        <span>Khoản nợ trả góp ngân hàng:</span>
                        <strong>{formatVND(Number(loanAmount.replace(/\./g, '')) || 0)}</strong>
                      </div>
                      <div className={styles.previewStatRow}>
                        <span>Gốc + Lãi trả ngân hàng hàng tháng:</span>
                        <strong style={{ color: 'var(--danger)' }}>
                          ~ {formatVND(calcResults.monthlyLoanRepayment)} / tháng
                        </strong>
                      </div>
                      <div className={styles.previewStatRow}>
                        <span>Thời hạn trả góp:</span>
                        <strong>{loanYears} năm ({loanYears * 12} tháng)</strong>
                      </div>
                    </>
                  )}
                </div>
              )}

              {goalType === 'child' && (
                <div className={styles.previewStats}>
                  <div className={styles.previewStatRow}>
                    <span>Thời gian tích lũy:</span>
                    <strong>{calcResults.childYears} năm ({calcResults.childYears * 12} tháng)</strong>
                  </div>
                  <div className={styles.previewStatRow}>
                    <span>Ước tính giá trị tiền sẵn có ở tuổi {childTargetAge}:</span>
                    <strong>{formatVND(calcResults.futureOwnValue)}</strong>
                  </div>
                  <div className={styles.previewStatRow}>
                    <span>Cần tiết kiệm hàng tháng:</span>
                    <strong style={{ color: 'var(--secondary)' }}>
                      {formatVND(calcResults.childMonthlySaveNeeded)} / tháng
                    </strong>
                  </div>
                </div>
              )}

              <div className={styles.infoAlert}>
                <Info size={14} style={{ flexShrink: 0 }} />
                <span>Số liệu trên tính toán tự động dựa trên công thức lãi kép kỳ hạn gửi hàng tháng.</span>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.btnSubmit}
              id="btn-submit-add-goal"
            >
              Lưu kế hoạch
            </button>
          </form>
        </section>
      )}

      {/* Goals Grid */}
      <section className={styles.goalsGrid}>
        {parsedGoals.map((g) => {
          const pct = Math.min(Math.round((g.current / g.target) * 100), 100) || 0;
          const remain = Math.max(g.target - g.current, 0);
          const isFundOpen = activeFundId === g.id;

          const IconComponent = IconMap[g.metadata.type] || PiggyBank;

          return (
            <div key={g.id} className={`${styles.goalCard} glass-card`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <IconComponent size={22} color="var(--primary)" />
                </div>
                
                <div className={styles.goalInfo}>
                  <h3 className={styles.goalName}>{g.displayName}</h3>
                  <span className={styles.goalTypeLabel}>
                    {TypeLabels[g.metadata.type] || 'Tích lũy'}
                  </span>
                </div>

                <button 
                  onClick={() => deleteGoal(g.id)}
                  className={styles.btnDelete}
                  title="Xóa kế hoạch"
                  id={`btn-delete-goal-${g.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Specific planner details inside card */}
              {g.metadata.type !== 'standard' && (
                <div className={styles.cardPlanDetails}>
                  {g.metadata.type === 'child' && (
                    <div className={styles.planDetailRow}>
                      <span>Tích lũy cho con:</span>
                      <strong>{g.metadata.childAge} ➔ {g.metadata.childTargetAge} tuổi</strong>
                    </div>
                  )}
                  {(g.metadata.type === 'house' || g.metadata.type === 'car') && (
                    <>
                      <div className={styles.planDetailRow}>
                        <span>Thời hạn mua:</span>
                        <strong>{g.metadata.saveYears} năm</strong>
                      </div>
                      {g.metadata.needLoan && (
                        <div className={styles.planDetailRow}>
                          <span>Trả góp ngân hàng:</span>
                          <strong style={{ color: 'var(--danger)' }}>
                            {formatVND(g.metadata.monthlyLoanRepayment)}/tháng
                          </strong>
                        </div>
                      )}
                    </>
                  )}
                  <div className={styles.planDetailRow}>
                    <span>Cần để dành hàng tháng:</span>
                    <strong style={{ color: 'var(--secondary)' }}>
                      {formatVND(g.metadata.monthlySaveNeeded)}/tháng
                    </strong>
                  </div>
                </div>
              )}

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
                    <span className={styles.successLabel}>Hoàn thành! 🎉</span>
                  )}
                </div>
              </div>

              <div className={styles.goalDateFooter}>
                <Calendar size={12} />
                <span>Dự kiến: {g.date}</span>
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
                      <span>Nạp thêm tiền</span>
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
