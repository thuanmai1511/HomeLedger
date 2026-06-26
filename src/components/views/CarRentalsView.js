'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  Car, 
  Plus, 
  Calendar, 
  DollarSign, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Hash,
  ChevronRight,
  Info
} from 'lucide-react';
import styles from './CarRentalsView.module.css';

export default function CarRentalsView() {
  const { 
    vehicles, 
    carTrips, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    addCarTrip, 
    updateCarTrip, 
    deleteCarTrip 
  } = useStore();

  // Mode states for modals/forms
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({ name: '', licensePlate: '' });
  const [tripForm, setTripForm] = useState({
    vehicleId: '',
    customerName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    amount: ''
  });

  // Calculate days helper for form
  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    // Count days (minimum 1 day)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  };

  const handleAddVehicleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleForm.name.trim() || !vehicleForm.licensePlate.trim()) return;

    addVehicle({
      name: vehicleForm.name.trim(),
      licenseplate: vehicleForm.licensePlate.trim(),
      status: 'available'
    });

    setVehicleForm({ name: '', licensePlate: '' });
    setIsAddVehicleOpen(false);
  };

  const handleAddTripSubmit = (e) => {
    e.preventDefault();
    const { vehicleId, customerName, startDate, endDate, amount } = tripForm;
    if (!vehicleId || !customerName.trim() || !startDate || !endDate) return;

    const days = calculateDays(startDate, endDate);
    const calculatedAmount = Number(amount) || 0;

    // Set trip status based on dates
    const todayStr = new Date().toISOString().split('T')[0];
    let status = 'pending';
    if (startDate <= todayStr && endDate >= todayStr) {
      status = 'active';
    } else if (endDate < todayStr) {
      status = 'completed';
    }

    addCarTrip({
      vehicleId,
      customerName: customerName.trim(),
      startDate,
      endDate,
      days,
      amount: calculatedAmount,
      status
    });

    // Reset Form
    setTripForm({
      vehicleId: '',
      customerName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      amount: ''
    });
    setIsAddTripOpen(false);
  };

  const handleQuickStatusChange = (trip, newStatus) => {
    updateCarTrip({
      ...trip,
      status: newStatus
    });
  };

  // Format currency VND helper
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Statistics
  const totalVehicles = vehicles ? vehicles.length : 0;
  const rentedVehicles = vehicles ? vehicles.filter(v => v.status === 'rented').length : 0;
  const availableVehicles = totalVehicles - rentedVehicles;
  
  const activeTripsCount = carTrips ? carTrips.filter(t => t.status === 'active').length : 0;
  const totalRevenue = carTrips
    ? carTrips
        .filter(t => t.status === 'completed' || t.status === 'active')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Cho thuê xe 4 bánh</h1>
          <p className={styles.subtitle}>Quản lý danh sách xe tự lái, theo dõi các chuyến đi và doanh thu độc lập.</p>
        </div>
        <div className={styles.actionButtons}>
          <button onClick={() => setIsAddVehicleOpen(true)} className={styles.primaryBtn}>
            <Plus size={18} />
            <span>Thêm xe mới</span>
          </button>
          <button 
            onClick={() => {
              if (!vehicles || vehicles.length === 0) {
                alert("Vui lòng thêm ít nhất một xe trước khi tạo chuyến đi.");
                return;
              }
              setTripForm(prev => ({ ...prev, vehicleId: vehicles[0].id }));
              setIsAddTripOpen(true);
            }} 
            className={styles.secondaryBtn}
          >
            <Plus size={18} />
            <span>Tạo chuyến đi</span>
          </button>
        </div>
      </header>

      {/* Quick Statistics Widget */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Tổng số xe</span>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              <Car size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{totalVehicles} xe</div>
          <div className={styles.statDesc}>
            <span className={styles.availableText}>{availableVehicles} trống</span> • <span className={styles.rentedText}>{rentedVehicles} đang thuê</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Chuyến đang chạy</span>
            <div className={`${styles.statIcon} ${styles.orangeIcon}`}>
              <Clock size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{activeTripsCount} chuyến</div>
          <div className={styles.statDesc}>Đang phục vụ khách hàng</div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Doanh thu ước tính</span>
            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{formatVND(totalRevenue)}</div>
          <div className={styles.statDesc}>Tính từ chuyến Đang chạy & Hoàn thành</div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        
        {/* Vehicles Section */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <Car size={20} />
            <span>Đội xe ({totalVehicles})</span>
          </h2>

          {!vehicles || vehicles.length === 0 ? (
            <div className={`${styles.emptyState} glass-card`}>
              <Car size={36} className={styles.emptyIcon} />
              <p>Chưa có xe nào trong danh sách.</p>
              <button onClick={() => setIsAddVehicleOpen(true)} className={styles.inlineBtn}>Thêm xe ngay</button>
            </div>
          ) : (
            <div className={styles.vehiclesList}>
              {vehicles.map((vehicle) => {
                const isRented = vehicle.status === 'rented';
                return (
                  <div key={vehicle.id} className={`${styles.vehicleCard} glass-card`}>
                    <div className={styles.vehicleInfo}>
                      <h3 className={styles.vehicleName}>{vehicle.name}</h3>
                      <p className={styles.licensePlate}>
                        <Hash size={14} />
                        <span>{vehicle.licenseplate}</span>
                      </p>
                    </div>
                    <div className={styles.vehicleFooter}>
                      <span className={`${styles.statusBadge} ${isRented ? styles.badgeRented : styles.badgeAvailable}`}>
                        {isRented ? 'Đang thuê' : 'Đang trống'}
                      </span>
                      <button 
                        onClick={() => {
                          if (confirm(`Bạn chắc chắn muốn xóa xe ${vehicle.name}? Toàn bộ lịch sử chuyến đi của xe này cũng sẽ bị xóa.`)) {
                            deleteVehicle(vehicle.id);
                          }
                        }} 
                        className={styles.deleteBtn}
                        title="Xóa xe"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Trips Section */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <Calendar size={20} />
            <span>Danh sách chuyến xe ({carTrips ? carTrips.length : 0})</span>
          </h2>

          {!carTrips || carTrips.length === 0 ? (
            <div className={`${styles.emptyState} glass-card`}>
              <Calendar size={36} className={styles.emptyIcon} />
              <p>Chưa ghi nhận chuyến xe nào.</p>
            </div>
          ) : (
            <div className={styles.tripsContainer}>
              <div className={styles.tableResponsive}>
                <table className={styles.tripsTable}>
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Xe thuê</th>
                      <th>Thời gian</th>
                      <th>Số ngày</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carTrips.map((trip) => {
                      const vehicle = vehicles ? vehicles.find(v => v.id === trip.vehicleId) : null;
                      return (
                        <tr key={trip.id} className={styles.tripRow}>
                          <td>
                            <span className={styles.customerName}>{trip.customerName}</span>
                          </td>
                          <td>
                            {vehicle ? (
                              <div className={styles.vehicleCell}>
                                <span className={styles.cellVehicleName}>{vehicle.name}</span>
                                <span className={styles.cellLicensePlate}>{vehicle.licenseplate}</span>
                              </div>
                            ) : (
                              <span className={styles.deletedVehicle}>Xe đã bị xóa</span>
                            )}
                          </td>
                          <td>
                            <div className={styles.dateCell}>
                              <span>{trip.startDate}</span>
                              <ChevronRight size={12} className={styles.dateArrow} />
                              <span>{trip.endDate}</span>
                            </div>
                          </td>
                          <td className={styles.daysCol}>{trip.days} ngày</td>
                          <td className={styles.amountCol}>{formatVND(trip.amount)}</td>
                          <td>
                            <span className={`${styles.tripStatusBadge} ${
                              trip.status === 'active' ? styles.tripActive :
                              trip.status === 'completed' ? styles.tripCompleted :
                              trip.status === 'cancelled' ? styles.tripCancelled : styles.tripPending
                            }`}>
                              {trip.status === 'active' && 'Đang chạy'}
                              {trip.status === 'completed' && 'Đã xong'}
                              {trip.status === 'cancelled' && 'Đã hủy'}
                              {trip.status === 'pending' && 'Sắp đi'}
                            </span>
                          </td>
                          <td className={styles.actionsCol}>
                            <div className={styles.tripActions}>
                              {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                                <>
                                  <button 
                                    onClick={() => handleQuickStatusChange(trip, 'completed')} 
                                    className={`${styles.iconActionBtn} ${styles.successBtn}`}
                                    title="Hoàn thành chuyến"
                                  >
                                    <CheckCircle size={15} />
                                  </button>
                                  <button 
                                    onClick={() => handleQuickStatusChange(trip, 'cancelled')} 
                                    className={`${styles.iconActionBtn} ${styles.dangerBtn}`}
                                    title="Hủy chuyến"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => {
                                  if (confirm("Xóa lịch sử chuyến xe này?")) {
                                    deleteCarTrip(trip.id);
                                  }
                                }} 
                                className={`${styles.iconActionBtn} ${styles.deleteTripBtn}`}
                                title="Xóa chuyến"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-card`}>
            <div className={styles.modalHeader}>
              <h3>Thêm xe mới</h3>
              <button onClick={() => setIsAddVehicleOpen(false)} className={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleAddVehicleSubmit}>
              <div className={styles.formGroup}>
                <label>Tên xe</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Toyota Fortuner 2023"
                  value={vehicleForm.name}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Biển số xe</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: 30K-123.45"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                  required
                />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsAddVehicleOpen(false)} className={styles.cancelBtn}>Hủy</button>
                <button type="submit" className={styles.primaryBtn}>Thêm xe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Trip Modal */}
      {isAddTripOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-card`}>
            <div className={styles.modalHeader}>
              <h3>Tạo chuyến đi mới</h3>
              <button onClick={() => setIsAddTripOpen(false)} className={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleAddTripSubmit}>
              <div className={styles.formGroup}>
                <label>Chọn xe</label>
                <select 
                  value={tripForm.vehicleId} 
                  onChange={(e) => setTripForm({ ...tripForm, vehicleId: e.target.value })}
                  required
                >
                  {vehicles && vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.licenseplate}) - {v.status === 'rented' ? 'Đang bận' : 'Đang trống'}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Tên khách hàng</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên khách hàng"
                  value={tripForm.customerName}
                  onChange={(e) => setTripForm({ ...tripForm, customerName: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    value={tripForm.startDate}
                    onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày kết thúc</label>
                  <input 
                    type="date" 
                    value={tripForm.endDate}
                    onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formInfoBlock}>
                <Info size={16} />
                <span>Số ngày thuê: {calculateDays(tripForm.startDate, tripForm.endDate)} ngày</span>
              </div>

              <div className={styles.formGroup}>
                <label>Số tiền thuê (Doanh thu)</label>
                <input 
                  type="number" 
                  placeholder="Nhập số tiền thuê"
                  value={tripForm.amount}
                  onChange={(e) => setTripForm({ ...tripForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsAddTripOpen(false)} className={styles.cancelBtn}>Hủy</button>
                <button type="submit" className={styles.primaryBtn}>Tạo chuyến</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
