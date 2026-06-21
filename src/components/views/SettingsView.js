'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Sun, 
  Moon, 
  Info, 
  ShieldAlert,
  Database,
  FileText
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './SettingsView.module.css';

export default function SettingsView() {
  const { 
    theme, 
    toggleTheme, 
    resetAllData, 
    clearAllData,
    importAllData, 
    members, 
    categories, 
    transactions, 
    goals, 
    recurring 
  } = useStore();

  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  // 1. Export JSON Data handler
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({
      members,
      categories,
      transactions,
      goals,
      recurring
    }, null, 2);

    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `homeledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 2. Export CSV Data handler (Exports transactions to CSV format)
  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Mã', 'Nội dung', 'Số tiền', 'Loại', 'Ngày', 'Danh mục', 'Thành viên', 'Ghi chú'];
    const rows = transactions.map(t => {
      const member = members.find(m => m.id === t.memberId)?.name || '';
      const category = categories.find(c => c.id === t.category)?.name || (t.type === 'income' ? 'Thu nhập' : 'Khác');
      return [
        t.id,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.type === 'expense' ? 'Chi tiêu' : 'Thu nhập',
        t.date,
        category,
        member,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `homeledger_giao_dich_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Import JSON Data file handler
  const handleImportFile = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      const result = importAllData(event.target.result);
      if (result.success) {
        setImportStatus({ type: 'success', msg: 'Nhập dữ liệu thành công! Ứng dụng đã được cập nhật.' });
        setTimeout(() => setImportStatus(null), 5000);
      } else {
        setImportStatus({ type: 'error', msg: `Lỗi: ${result.error}` });
      }
    };
    fileReader.readAsText(file);
    // Reset file input value
    e.target.value = null;
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu và cài đặt về trạng thái ban đầu? Hành động này không thể hoàn tác.')) {
      resetAllData();
      alert('Đã khôi phục cài đặt gốc thành công!');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA TRẮNG TOÀN BỘ dữ liệu để tự thiết lập từ đầu? Hành động này không thể hoàn tất phục hồi.')) {
      clearAllData();
      alert('Đã xóa trắng dữ liệu thành công!');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Thiết lập hệ thống</h1>
          <p className={styles.subtitle}>Tùy chỉnh chủ đề giao diện, quản lý sao lưu dữ liệu và thông tin ứng dụng.</p>
        </div>
      </header>

      {/* Main Settings Grid */}
      <section className={styles.grid}>
        {/* Theme Settings */}
        <div className={`${styles.settingCard} glass-card`}>
          <h3 className={styles.cardTitle}>Giao diện hiển thị</h3>
          <p className={styles.cardDesc}>Chuyển đổi giữa chế độ tối hiện đại và chế độ sáng trực quan.</p>
          
          <div className={styles.themeToggleGroup}>
            <button 
              onClick={() => theme !== 'light' && toggleTheme()} 
              className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
              id="theme-btn-light"
            >
              <Sun size={18} />
              <span>Giao diện sáng</span>
            </button>
            
            <button 
              onClick={() => theme !== 'dark' && toggleTheme()} 
              className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
              id="theme-btn-dark"
            >
              <Moon size={18} />
              <span>Giao diện tối</span>
            </button>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className={`${styles.settingCard} glass-card`}>
          <h3 className={styles.cardTitle}>Dữ liệu & Sao lưu</h3>
          <p className={styles.cardDesc}>Sao lưu dữ liệu chi tiêu ra file hoặc khôi phục từ bản sao lưu trước đó.</p>

          <div className={styles.backupActions}>
            <button 
              onClick={handleExportJSON} 
              className={styles.btnAction}
              id="btn-export-json"
            >
              <Download size={16} />
              <span>Xuất dự phòng (.JSON)</span>
            </button>

            <button 
              onClick={handleExportCSV} 
              className={styles.btnAction}
              id="btn-export-csv"
            >
              <FileText size={16} />
              <span>Xuất Excel (.CSV)</span>
            </button>

            <button 
              onClick={triggerFileInput} 
              className={styles.btnAction}
              id="btn-trigger-import"
            >
              <Upload size={16} />
              <span>Khôi phục dữ liệu</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              style={{ display: 'none' }}
              id="import-file-input"
            />
          </div>

          {importStatus && (
            <div className={`${styles.statusAlert} ${importStatus.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
              <Database size={16} />
              <span>{importStatus.msg}</span>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className={`${styles.settingCard} glass-card`} style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <h3 className={styles.cardTitle} style={{ color: 'var(--danger)' }}>Khu vực rủi ro cao</h3>
          <p className={styles.cardDesc}>Chọn khôi phục lại dữ liệu mẫu mặc định hoặc xóa trắng toàn bộ dữ liệu để tự thiết lập từ đầu.</p>
          
          <div className={styles.dangerActions}>
            <button 
              onClick={handleResetData} 
              className={styles.btnDangerSecondary}
              id="btn-reset-data"
            >
              <Trash2 size={16} />
              <span>Khôi phục dữ liệu mẫu</span>
            </button>
            
            <button 
              onClick={handleClearData} 
              className={styles.btnDanger}
              id="btn-clear-data"
            >
              <Trash2 size={16} />
              <span>Xóa sạch toàn bộ dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Architecture & Tech explanation */}
        <div className={`${styles.settingCard} glass-card`}>
          <h3 className={styles.cardTitle}>Thông tin ứng dụng</h3>
          <p className={styles.cardDesc}>HomeLedger được phát triển trên kiến trúc Next.js App Router bền vững.</p>
          
          <div className={styles.infoBox}>
            <Info size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div className={styles.infoText}>
              <p>• Sử dụng <strong>React Context API</strong> để phân phối dữ liệu realtime.</p>
              <p>• <strong>Offline-ready:</strong> Toàn bộ dữ liệu được lưu trữ an toàn trong trình duyệt.</p>
              <p>• <strong>Supabase/Firebase Ready:</strong> Kiến trúc hàm tại `store.js` đã tách biệt logic nghiệp vụ, sẵn sàng kết nối API database chỉ với 1 bước thay đổi.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
