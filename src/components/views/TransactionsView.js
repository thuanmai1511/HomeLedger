'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './TransactionsView.module.css';

export default function TransactionsView({ onOpenAdd, onOpenEdit }) {
  const { 
    transactions, 
    categories, 
    members, 
    deleteTransaction 
  } = useStore();

  // Filter and search states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Search Query
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
      // 2. Type
      const matchType = filterType === 'all' || t.type === filterType;
      // 3. Category
      const matchCat = filterCategory === 'all' || t.category === filterCategory;
      // 4. Member
      const matchMember = filterMember === 'all' || t.memberId === filterMember;

      return matchSearch && matchType && matchCat && matchMember;
    });
  }, [transactions, search, filterType, filterCategory, filterMember]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý giao dịch</h1>
          <p className={styles.subtitle}>Ghi chép và rà soát mọi dòng tiền của gia đình.</p>
        </div>
        
        <button 
          onClick={onOpenAdd}
          className={styles.btnAdd}
          id="btn-add-transaction-view"
        >
          <Plus size={18} />
          <span>Giao dịch mới</span>
        </button>
      </header>

      {/* Filter and Search Bar */}
      <section className={`${styles.filterBar} glass-card`}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm giao dịch, ghi chú..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              id="search-transactions"
            />
            {search && (
              <button onClick={() => setSearch('')} className={styles.btnClearSearch}>
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.btnToggleFilters} ${showFilters ? styles.btnFiltersActive : ''}`}
            id="btn-toggle-filters"
          >
            <SlidersHorizontal size={18} />
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* Collapsible filters panel */}
        {showFilters && (
          <div className={styles.filtersPanel} id="filters-panel">
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Phân loại</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
                id="filter-type"
              >
                <option value="all">Tất cả các loại</option>
                <option value="expense">Khoản chi tiêu</option>
                <option value="income">Khoản thu nhập</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Danh mục chi</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.filterSelect}
                id="filter-category"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Người thực hiện</label>
              <select 
                value={filterMember} 
                onChange={(e) => setFilterMember(e.target.value)}
                className={styles.filterSelect}
                id="filter-member"
              >
                <option value="all">Cả nhà</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Transactions List Grouped by Date */}
      <section className={styles.listSection}>
        {groupedTransactions.length === 0 ? (
          <div className={`${styles.emptyState} glass-card`}>
            <AlertCircle size={36} color="var(--text-muted)" />
            <p className={styles.emptyText}>Không tìm thấy giao dịch nào phù hợp bộ lọc.</p>
          </div>
        ) : (
          <div className={styles.groupsContainer}>
            {groupedTransactions.map(([dateString, list]) => {
              // Calculate daily total
              let dailyTotal = 0;
              list.forEach(t => {
                if (t.type === 'expense') dailyTotal -= t.amount;
                else dailyTotal += t.amount;
              });

              // Format date string header
              const dObj = new Date(dateString);
              const dayStr = `Ngày ${dObj.getDate()} thg ${dObj.getMonth() + 1}, ${dObj.getFullYear()}`;

              return (
                <div key={dateString} className={`${styles.dateGroup} glass-card`}>
                  <div className={styles.groupHeader}>
                    <span className={styles.groupDate}>{dayStr}</span>
                    <span className={`${styles.groupTotal} ${dailyTotal >= 0 ? styles.incomeText : styles.expenseText}`}>
                      {dailyTotal >= 0 ? '+' : ''}{formatVND(dailyTotal)}
                    </span>
                  </div>

                  <div className={styles.groupList}>
                    {list.map((t) => {
                      const member = members.find(m => m.id === t.memberId);
                      const catInfo = categories.find(c => c.id === t.category);
                      const isExpense = t.type === 'expense';

                      return (
                        <div key={t.id} className={styles.transactionRow}>
                          <div className={styles.rowLeft}>
                            <div 
                              className={styles.memberAvatar} 
                              style={{ background: member?.color || 'var(--text-muted)' }}
                              title={member?.name}
                            >
                              {member?.avatar || '👨'}
                            </div>
                            <div className={styles.rowDetails}>
                              <p className={styles.rowDesc}>{t.description}</p>
                              <div className={styles.rowMeta}>
                                <span className={styles.metaCategory}>
                                  {isExpense ? catInfo?.name || 'Chi tiêu' : 'Thu nhập'}
                                </span>
                                {t.notes && <span className={styles.metaDivider}>•</span>}
                                {t.notes && <span className={styles.metaNotes}>{t.notes}</span>}
                              </div>
                            </div>
                          </div>

                          <div className={styles.rowRight}>
                            <span className={`${styles.rowAmount} ${isExpense ? styles.expenseText : styles.incomeText}`}>
                              {isExpense ? '-' : '+'}{formatVND(t.amount)}
                            </span>
                            
                            <div className={styles.rowActions}>
                              <button 
                                onClick={() => onOpenEdit(t)}
                                className={styles.btnRowEdit}
                                title="Sửa giao dịch"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => deleteTransaction(t.id)}
                                className={styles.btnRowDel}
                                title="Xóa giao dịch"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
