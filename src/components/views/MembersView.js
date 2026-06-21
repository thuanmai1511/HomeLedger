'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Shield, User, AlertCircle, X, Award } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './MembersView.module.css';

const AVATAR_OPTIONS = ['👨', '👩', '👧', '👦', '👵', '👴', '👶', '🐱', '🐶'];
const COLOR_OPTIONS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function MembersView() {
  const { members, transactions, addMember, deleteMember } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [avatar, setAvatar] = useState('👨');
  const [color, setColor] = useState('#3b82f6');

  // Get current month for stats
  const currentMonth = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Calculate total expense per member in current month
  const memberExpenses = useMemo(() => {
    const map = {};
    members.forEach(m => {
      map[m.id] = 0;
    });

    transactions.forEach(t => {
      if (t.type === 'expense' && t.date && t.date.startsWith(currentMonth)) {
        if (map[t.memberId] !== undefined) {
          map[t.memberId] += Number(t.amount) || 0;
        }
      }
    });
    return map;
  }, [members, transactions, currentMonth]);

  const totalExpense = useMemo(() => {
    return Object.values(memberExpenses).reduce((acc, curr) => acc + curr, 0) || 1;
  }, [memberExpenses]);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMember({
      name,
      role,
      avatar,
      color
    });

    // Reset Form
    setName('');
    setRole('member');
    setAvatar('👨');
    setColor('#3b82f6');
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
          <h1 className={styles.title}>Quản lý thành viên</h1>
          <p className={styles.subtitle}>Quản lý danh sách thành viên trong gia đình và xem thống kê chi tiêu của từng người.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.btnAdd}
          id="btn-toggle-add-member"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'Đóng form' : 'Thêm thành viên'}</span>
        </button>
      </header>

      {/* Add Member Form (Collapsible) */}
      {showAddForm && (
        <section className={`${styles.formCard} glass-card`}>
          <h3 className={styles.formTitle}>Đăng ký thành viên mới</h3>
          <form onSubmit={handleAddMember} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Tên thành viên</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: Chị Lan, Bé Vy..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                id="member-name-input"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Vai trò</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.input}
                  id="member-role-select"
                >
                  <option value="member">Thành viên (chỉ xem & nhập chi tiêu)</option>
                  <option value="admin">Quản trị viên (có quyền sửa ngân sách)</option>
                </select>
              </div>
            </div>

            {/* Avatar picker */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Biểu tượng Avatar</label>
              <div className={styles.avatarList}>
                {AVATAR_OPTIONS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`${styles.avatarOption} ${avatar === a ? styles.avatarOptionActive : ''}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Màu nhận diện</label>
              <div className={styles.colorList}>
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`${styles.colorOption} ${color === c ? styles.colorOptionActive : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.btnSubmit}
              id="btn-submit-add-member"
            >
              Thêm vào gia đình
            </button>
          </form>
        </section>
      )}

      {/* Members Stats Grid */}
      <section className={styles.membersGrid}>
        {members.map((m) => {
          const spent = memberExpenses[m.id] || 0;
          const pct = Math.round((spent / totalExpense) * 100) || 0;
          
          return (
            <div key={m.id} className={`${styles.memberCard} glass-card`} style={{ borderTop: `4px solid ${m.color}` }}>
              <div className={styles.memberCardHeader}>
                <div className={styles.avatarCircle} style={{ background: `${m.color}20`, border: `1px solid ${m.color}` }}>
                  <span className={styles.avatarText}>{m.avatar}</span>
                </div>
                
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>{m.name}</h3>
                  <span className={styles.memberRole}>
                    <Shield size={12} className={styles.roleIcon} />
                    {m.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                  </span>
                </div>

                {members.length > 1 && (
                  <button 
                    onClick={() => deleteMember(m.id)}
                    className={styles.btnDelete}
                    title="Xóa thành viên"
                    id={`btn-delete-member-${m.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Spending progress bar */}
              <div className={styles.memberStats}>
                <div className={styles.statLine}>
                  <span className={styles.statLabel}>Đã tiêu dùng tháng này:</span>
                  <span className={styles.statValue}>{formatVND(spent)}</span>
                </div>

                <div className={styles.progressWrapper}>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                  <span className={styles.pctLabel}>{pct}% tổng chi gia đình</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
