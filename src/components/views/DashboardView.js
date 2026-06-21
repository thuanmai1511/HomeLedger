'use client';

import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Plus, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Sparkles,
  CheckCircle,
  BellRing
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './DashboardView.module.css';

export default function DashboardView({ onNavigateToTab, onOpenAddTransaction }) {
  const { transactions, categories, members, goals } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // 1. Get available months from transactions to display filter
  const availableMonths = useMemo(() => {
    const months = new Set();
    const today = new Date();
    months.add(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    
    transactions.forEach(t => {
      if (t.date) {
        months.add(t.date.substring(0, 7));
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // 2. Filter transactions for the selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // 3. Stats calculations
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;

    monthlyTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
      } else {
        expense += amt;
      }
    });

    const net = income - expense;
    return { income, expense, net };
  }, [monthlyTransactions]);

  // 4. Calculations for categories spending & budgets
  const categoryStats = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      map[c.id] = { ...c, spent: 0 };
    });

    monthlyTransactions.forEach(t => {
      if (t.type === 'expense' && map[t.category]) {
        map[t.category].spent += Number(t.amount) || 0;
      }
    });

    return Object.values(map).sort((a, b) => b.spent - a.spent);
  }, [categories, monthlyTransactions]);

  // 5. Daily spending logic for SVG line chart (last 7 days of the selected month or current days)
  const chartData = useMemo(() => {
    const dayMap = {};
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      days.push(str);
      dayMap[str] = 0;
    }

    monthlyTransactions.forEach(t => {
      if (t.type === 'expense' && dayMap[t.date] !== undefined) {
        dayMap[t.date] += Number(t.amount) || 0;
      }
    });

    return days.map(day => ({
      dateLabel: day.substring(8, 10) + '/' + day.substring(5, 7),
      amount: dayMap[day]
    }));
  }, [monthlyTransactions]);

  // Helper for formatting currency in VND
  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // SVG Chart parameters
  const maxSpendOnChart = Math.max(...chartData.map(d => d.amount), 100000); // at least 100k scale
  const points = chartData.map((d, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const y = 90 - (d.amount / maxSpendOnChart) * 80;
    return `${x},${y}`;
  }).join(' ');

  // Compute donut slices
  const totalExpense = stats.expense || 1;
  const activeCategories = categoryStats.filter(c => c.spent > 0);
  const donutSlices = [];
  let accumulatedPercent = 0;

  for (let i = 0; i < activeCategories.length; i++) {
    const c = activeCategories[i];
    const percent = c.spent / totalExpense;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percent;

    const x1 = Math.cos(2 * Math.PI * startPercent);
    const y1 = Math.sin(2 * Math.PI * startPercent);
    const x2 = Math.cos(2 * Math.PI * accumulatedPercent);
    const y2 = Math.sin(2 * Math.PI * accumulatedPercent);

    const largeArcFlag = percent > 0.5 ? 1 : 0;
    const pathData = [
      `M ${x1} ${y1}`,
      `A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L 0 0`
    ].join(' ');

    donutSlices.push({
      path: pathData,
      color: c.color,
      name: c.name,
      spent: c.spent,
      percent: Math.round(percent * 100)
    });
  }

  // 6. Dynamic AI Financial Insights
  const aiInsights = useMemo(() => {
    const tips = [];
    
    // Tip 1: Check Food budget
    const foodCat = categoryStats.find(c => c.id === 'cat-1');
    if (foodCat && foodCat.spent > foodCat.budget * 0.8) {
      tips.push({
        id: 'tip-1',
        title: 'Cảnh báo Ăn uống',
        content: `Gia đình đã dùng đến ${Math.round((foodCat.spent / foodCat.budget) * 100)}% ngân sách ăn uống tháng này. Hãy lưu ý chi tiêu.`,
        type: 'warning'
      });
    }

    // Tip 2: Check active goals
    const activeGoals = goals.filter(g => g.current < g.target);
    if (activeGoals.length > 0) {
      const g = activeGoals[0];
      const pct = Math.round((g.current / g.target) * 100);
      tips.push({
        id: 'tip-2',
        title: 'Mục tiêu: ' + g.name,
        content: `Hũ tiết kiệm đã đạt ${pct}%. Bạn chỉ cần tích lũy thêm ${new Intl.NumberFormat('vi-VN').format(g.target - g.current)}đ để cán mốc.`,
        type: 'info'
      });
    }

    // Tip 3: Income vs expense balance
    if (stats.expense > stats.income * 0.8 && stats.income > 0) {
      tips.push({
        id: 'tip-3',
        title: 'Cảnh báo Thu - Chi',
        content: 'Tổng chi tiêu tháng này đã vượt quá 80% thu nhập. Hãy ưu tiên các nhu cầu thiết yếu trước.',
        type: 'danger'
      });
    } else {
      tips.push({
        id: 'tip-3',
        title: 'Tài chính Khỏe mạnh',
        content: 'Mức thu nhập đang lớn hơn chi tiêu tháng này rất tốt. Hãy tiếp tục duy trì thói quen tiết kiệm này.',
        type: 'success'
      });
    }

    return tips;
  }, [categoryStats, goals, stats]);

  // 7. Check if logged today
  const hasLoggedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return transactions.some(t => t.date === todayStr);
  }, [transactions]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tổng quan tài chính</h1>
          <p className={styles.subtitle}>Chào mừng quay trở lại, HomeLedger luôn sẵn sàng đồng hành.</p>
        </div>
        
        <div className={styles.actions}>
          <div className={styles.monthSelectorWrapper}>
            <Calendar size={16} color="var(--text-secondary)" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={styles.monthSelect}
              id="month-select"
            >
              {availableMonths.map(m => {
                const [y, mm] = m.split('-');
                return (
                  <option key={m} value={m}>
                    Tháng {mm}/{y}
                  </option>
                );
              })}
            </select>
          </div>

          <button 
            onClick={onOpenAddTransaction}
            className={styles.btnAdd}
            id="btn-quick-add"
          >
            <Plus size={18} />
            <span>Giao dịch mới</span>
          </button>
        </div>
      </header>

      {/* Daily Reminder Banner */}
      {!hasLoggedToday && (
        <section className={`${styles.reminderBanner} glass-card`}>
          <div className={styles.reminderContent}>
            <BellRing size={20} className={styles.reminderIcon} />
            <div>
              <h4 className={styles.reminderTitle}>Nhắc nhở ghi chép chi tiêu</h4>
              <p className={styles.reminderDesc}>Hôm nay gia đình mình chưa ghi chép khoản thu chi nào. Hãy lưu lại ngay để quản lý tài chính chuẩn xác nhé!</p>
            </div>
          </div>
          <button onClick={onOpenAddTransaction} className={styles.btnReminderAdd}>
            Ghi ngay
          </button>
        </section>
      )}

      {/* Overview Stats Grid */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon} style={{ background: 'rgba(52, 211, 153, 0.12)' }}>
            <ArrowUpRight size={22} color="var(--secondary)" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Tổng Thu Nhập</p>
            <p className={styles.statValue} style={{ color: 'var(--secondary)' }}>
              {formatVND(stats.income)}
            </p>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
            <ArrowDownRight size={22} color="var(--danger)" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Tổng Chi Tiêu</p>
            <p className={styles.statValue} style={{ color: 'var(--danger)' }}>
              {formatVND(stats.expense)}
            </p>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.12)' }}>
            <Wallet size={22} color="var(--primary)" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Số Dư Còn Lại</p>
            <p className={styles.statValue} style={{ color: stats.net >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
              {formatVND(stats.net)}
            </p>
          </div>
        </div>
      </section>

      {/* Main Charts & Breakdown Section */}
      <section className={styles.mainSection}>
        {/* Left Side: Charts and Insights */}
        <div className={styles.chartsColumn}>
          {/* Trend Chart */}
          <div className={`${styles.chartCard} glass-card`}>
            <div className={styles.chartHeader}>
              <h3 className={styles.cardTitle}>
                <TrendingUp size={18} color="var(--primary)" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Xu Hướng Chi Tiêu (7 Ngày Qua)
              </h3>
            </div>
            
            {maxSpendOnChart <= 100000 ? (
              <div className={styles.emptyChart}>Chưa có dữ liệu chi tiêu trong tuần này.</div>
            ) : (
              <div className={styles.chartContainer}>
                <svg viewBox="0 0 100 100" className={styles.lineChartSvg} preserveAspectRatio="none">
                  {/* Area fill */}
                  <polygon
                    points={`0,100 ${points} 100,100`}
                    fill="url(#chart-gradient)"
                    opacity="0.2"
                  />
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Chart Labels */}
                <div className={styles.chartXLabels}>
                  {chartData.map((d, i) => (
                    <div key={i} className={styles.chartXLabel}>
                      <span>{d.dateLabel}</span>
                      <span className={styles.chartValueTooltip}>{formatVND(d.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Financial Insights */}
          <div className={`${styles.chartCard} glass-card`}>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--primary)" />
              Gợi ý Tài chính Thông minh
            </h3>
            
            <div className={styles.insightsList}>
              {aiInsights.map((tip) => (
                <div key={tip.id} className={styles.insightItem}>
                  <div className={styles.insightHeader}>
                    <span className={styles.insightBadge} style={{ 
                      backgroundColor: tip.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                       tip.type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 
                                       tip.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: tip.type === 'warning' ? 'var(--warning)' :
                             tip.type === 'danger' ? 'var(--danger)' : 
                             tip.type === 'success' ? 'var(--secondary)' : 'var(--primary)'
                    }}>
                      {tip.title}
                    </span>
                  </div>
                  <p className={styles.insightContent}>{tip.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Donut Chart and Categories list */}
          <div className={`${styles.chartCard} glass-card`}>
            <h3 className={styles.cardTitle}>Phân Bổ Chi Tiêu</h3>
            {donutSlices.length === 0 ? (
              <div className={styles.emptyChart}>Chưa phát sinh khoản chi nào trong tháng.</div>
            ) : (
              <div className={styles.donutLayout}>
                {/* SVG Donut */}
                <div className={styles.donutSvgWrapper}>
                  <svg viewBox="-1.2 -1.2 2.4 2.4" className={styles.donutSvg}>
                    {donutSlices.map((slice, i) => (
                      <path 
                        key={i} 
                        d={slice.path} 
                        fill={slice.color} 
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                      />
                    ))}
                    {/* Inner hole */}
                    <circle cx="0" cy="0" r="0.65" fill="var(--bg-secondary)" />
                  </svg>
                  <div className={styles.donutCenter}>
                    <span className={styles.donutCenterLabel}>Tổng chi</span>
                    <span className={styles.donutCenterVal}>{formatVND(stats.expense)}</span>
                  </div>
                </div>

                {/* Slices legend */}
                <div className={styles.donutLegend}>
                  {donutSlices.slice(0, 5).map((slice, i) => (
                    <div key={i} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: slice.color }} />
                      <span className={styles.legendName}>{slice.name}</span>
                      <span className={styles.legendPercent}>{slice.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Budgets and Recent Transactions */}
        <div className={styles.listColumn}>
          {/* Budget Limits Progress */}
          <div className={`${styles.budgetCard} glass-card`}>
            <div className={styles.budgetHeader}>
              <h3 className={styles.cardTitle}>Ngân Sách Theo Danh Mục</h3>
              <button 
                onClick={() => onNavigateToTab('budgets')} 
                className={styles.cardHeaderLink}
                id="link-go-to-budgets"
              >
                Cài đặt
              </button>
            </div>
            
            <div className={styles.budgetList}>
              {categoryStats.slice(0, 4).map((c) => {
                const percent = Math.min(Math.round((c.spent / c.budget) * 100), 100) || 0;
                const isOver = c.spent > c.budget;
                const isWarning = c.spent > c.budget * 0.8 && !isOver;

                let progressColor = 'var(--primary)';
                if (isOver) progressColor = 'var(--danger)';
                else if (isWarning) progressColor = 'var(--warning)';

                return (
                  <div key={c.id} className={styles.budgetItem}>
                    <div className={styles.budgetItemInfo}>
                      <span className={styles.budgetItemName}>{c.name}</span>
                      <span className={styles.budgetItemValues}>
                        <strong>{formatVND(c.spent)}</strong> / {formatVND(c.budget)}
                      </span>
                    </div>
                    
                    <div className={styles.progressBarBg}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${percent}%`, backgroundColor: progressColor }}
                      />
                    </div>

                    <div className={styles.budgetMeta}>
                      <span>Đã dùng {percent}%</span>
                      {isOver && (
                        <span className={styles.overBudgetAlert}>
                          <AlertCircle size={12} /> Vượt ngân sách!
                        </span>
                      )}
                      {isWarning && (
                        <span className={styles.warningBudgetAlert}>
                          <AlertCircle size={12} /> Sắp vượt hạn mức
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${styles.recentCard} glass-card`}>
            <div className={styles.budgetHeader}>
              <h3 className={styles.cardTitle}>Giao Dịch Gần Đây</h3>
              <button 
                onClick={() => onNavigateToTab('transactions')} 
                className={styles.cardHeaderLink}
                id="link-go-to-transactions"
              >
                Xem tất cả
              </button>
            </div>

            <div className={styles.recentList}>
              {monthlyTransactions.slice(0, 5).map((t) => {
                const member = members.find(m => m.id === t.memberId);
                const category = categories.find(c => c.id === t.category);
                const isExpense = t.type === 'expense';
                
                return (
                  <div key={t.id} className={styles.recentItem}>
                    <div className={styles.recentItemLeft}>
                      <div className={styles.memberIndicator} style={{ background: member?.color || 'var(--text-muted)' }} title={member?.name}>
                        {member?.avatar || '👨'}
                      </div>
                      <div className={styles.recentItemDetails}>
                        <p className={styles.recentItemDesc}>{t.description}</p>
                        <span className={styles.recentItemSub}>
                          {t.date} • {category?.name || (t.category === 'income' ? 'Thu nhập' : 'Khác')}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`${styles.recentItemAmount} ${isExpense ? styles.expenseAmt : styles.incomeAmt}`}>
                      {isExpense ? '-' : '+'}{formatVND(t.amount)}
                    </span>
                  </div>
                );
              })}

              {monthlyTransactions.length === 0 && (
                <div className={styles.emptyRecent}>Chưa có giao dịch nào trong tháng này.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
