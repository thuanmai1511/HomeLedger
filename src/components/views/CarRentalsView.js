'use client';

import React, { useState, useMemo } from 'react';
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
  Hash,
  ChevronRight,
  Info,
  History,
  Play,
  Filter,
  Search,
  ChevronDown
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

  // Trips filtering tabs: 'active' (Active/Pending) vs 'history' (Completed/Cancelled)
  const [tripTab, setTripTab] = useState('active');

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(5); // Default display 5 items for performance & mobile scrolling

  // Month-by-month filter: 'all' or 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Form states
  const [vehicleForm, setVehicleForm] = useState({ name: '', licensePlate: '' });
  const [tripForm, setTripForm] = useState({
    vehicleId: '',
    customerName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  });
  const [rawAmount, setRawAmount] = useState(''); // Formatted amount for display in input

  // Formatting helper for amount input
  const formatNumberString = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handleAmountChange = (e) => {
    setRawAmount(formatNumberString(e.target.value));
  };

  // Calculate days helper
  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = end - start;
    if (diffTime < 0) return 0;
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
    const { vehicleId, customerName, startDate, endDate } = tripForm;
    if (!vehicleId || !customerName.trim() || !startDate || !endDate) return;

    const days = calculateDays(startDate, endDate);
    const numericAmount = Number(rawAmount.replace(/\./g, '')) || 0;

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
      amount: numericAmount,
      status
    });

    // Reset Form
    setTripForm({
      vehicleId: '',
      customerName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    });
    setRawAmount('');
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

  // Get unique months list for dropdown filter
  const uniqueMonths = useMemo(() => {
    if (!carTrips) return [];
    const monthsSet = new Set();
    carTrips.forEach(t => {
      if (t.startDate) {
        monthsSet.add(t.startDate.substring(0, 7)); // YYYY-MM
      }
    });
    return Array.from(monthsSet).sort().reverse(); // Latest month first
  }, [carTrips]);

  // Format Month Label helper
  const formatMonthLabel = (yyyyMm) => {
    const [year, month] = yyyyMm.split('-');
    return `Tháng ${month}/${year}`;
  };

  // Reset display limit when changing tabs or filters
  const handleTabChange = (newTab) => {
    setTripTab(newTab);
    setDisplayLimit(5); // Reset limit to prevent layout jump
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setDisplayLimit(5);
  };

  // Stats calculation (reacting to month filter)
  const totalVehicles = vehicles ? vehicles.length : 0;
  const rentedVehicles = vehicles ? vehicles.filter(v => v.status === 'rented').length : 0;
  const availableVehicles = totalVehicles - rentedVehicles;
  
  const activeTripsCount = useMemo(() => {
    if (!carTrips) return 0;
    let trips = carTrips.filter(t => t.status === 'active');
    if (selectedMonth !== 'all') {
      trips = trips.filter(t => t.startDate && t.startDate.startsWith(selectedMonth));
    }
    return trips.length;
  }, [carTrips, selectedMonth]);

  const totalRevenue = useMemo(() => {
    if (!carTrips) return 0;
    let trips = carTrips.filter(t => t.status === 'completed' || t.status === 'active');
    if (selectedMonth !== 'all') {
      trips = trips.filter(t => t.startDate && t.startDate.startsWith(selectedMonth));
    }
    return trips.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [carTrips, selectedMonth]);

  // Filtered and searched trips based on selected tab, month, and search query
  const filteredAndSearchedTrips = useMemo(() => {
    if (!carTrips) return [];
    let trips = carTrips;
    
    // 1. Filter by Tab (Active/Pending vs History)
    if (tripTab === 'active') {
      trips = trips.filter(t => t.status === 'active' || t.status === 'pending');
    } else {
      trips = trips.filter(t => t.status === 'completed' || t.status === 'cancelled');
    }

    // 2. Filter by Month Select
    if (selectedMonth !== 'all') {
      trips = trips.filter(t => t.startDate && t.startDate.startsWith(selectedMonth));
    }

    // 3. Filter by Search Query (Customer Name or License Plate)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      trips = trips.filter(t => {
        const vehicle = vehicles ? vehicles.find(v => v.id === t.vehicleId) : null;
        const vehicleMatch = vehicle ? (
          vehicle.name.toLowerCase().includes(query) || 
          vehicle.licenseplate.toLowerCase().includes(query)
        ) : false;
        const customerMatch = t.customerName.toLowerCase().includes(query);
        return customerMatch || vehicleMatch;
      });
    }

    return trips;
  }, [carTrips, tripTab, selectedMonth, searchQuery, vehicles]);

  // Paginated/limited trips for actual rendering
  const displayedTrips = useMemo(() => {
    return filteredAndSearchedTrips.slice(0, displayLimit);
  }, [filteredAndSearchedTrips, displayLimit]);

  const hasMoreTrips = filteredAndSearchedTrips.length > displayLimit;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Thuê xe</h1>
          <p className={styles.subtitle}>Giao diện tối ưu cuộn trang và tìm kiếm nhanh khi danh sách dữ liệu lớn.</p>
        </div>
        <div className={styles.actionButtons}>
          <button onClick={() => setIsAddVehicleOpen(true)} className={styles.primaryBtn}>
            <Plus size={18} />
            <span>Thêm xe</span>
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
            <span>Tạo chuyến</span>
          </button>
        </div>
      </header>

      {/* Month Filter Selector Toolbar */}
      <section className={`${styles.filterToolbar} glass-card`}>
        <div className={styles.filterTitle}>
          <Filter size={16} />
          <span>Lọc doanh thu & chuyến đi theo tháng:</span>
        </div>
        <select 
          value={selectedMonth} 
          onChange={handleMonthChange}
          className={styles.monthSelect}
        >
          <option value="all">Tất cả các tháng</option>
          {uniqueMonths.map(m => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
        </select>
      </section>

      {/* Quick Statistics Widget */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Đội xe</span>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              <Car size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{totalVehicles} xe</div>
          <div className={styles.statDesc}>
            <span className={styles.availableText}>{availableVehicles} trống</span> • <span className={styles.rentedText}>{rentedVehicles} bận</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>
              {selectedMonth === 'all' ? 'Đang chạy' : `Chạy trong ${formatMonthLabel(selectedMonth).toLowerCase()}`}
            </span>
            <div className={`${styles.statIcon} ${styles.orangeIcon}`}>
              <Clock size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{activeTripsCount} chuyến</div>
          <div className={styles.statDesc}>Số chuyến đang thực hiện</div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>
              {selectedMonth === 'all' ? 'Doanh thu thu về' : `Doanh thu ${formatMonthLabel(selectedMonth).toLowerCase()}`}
            </span>
            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{formatVND(totalRevenue)}</div>
          <div className={styles.statDesc}>Tính từ chuyến Đang chạy & Hoàn thành</div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className={styles.mainGrid}>
        
        {/* Vehicles Section */}
        <section className={`${styles.sectionCard} glass-card`}>
          <h2 className={styles.sectionTitle}>
            <Car size={18} />
            <span>Đội xe hiện có ({totalVehicles})</span>
          </h2>

          {!vehicles || vehicles.length === 0 ? (
            <div className={`${styles.emptyState} glass-card`}>
              <Car size={32} className={styles.emptyIcon} />
              <p>Chưa có xe nào.</p>
              <button onClick={() => setIsAddVehicleOpen(true)} className={styles.inlineBtn}>Thêm ngay</button>
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
                        <Hash size={12} />
                        <span>{vehicle.licenseplate}</span>
                      </p>
                    </div>
                    <div className={styles.vehicleFooter}>
                      <span className={`${styles.statusBadge} ${isRented ? styles.badgeRented : styles.badgeAvailable}`}>
                        {isRented ? 'Đang thuê' : 'Sẵn sàng'}
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

        {/* Trips Section with History Tabs & Search/Limit */}
        <section className={`${styles.sectionCard} glass-card`}>
          <div className={styles.sectionHeaderWithTabs}>
            <h2 className={styles.sectionTitle}>
              <Calendar size={18} />
              <span>Chuyến xe ({filteredAndSearchedTrips.length})</span>
            </h2>
            <div className={styles.tabGroup}>
              <button 
                onClick={() => handleTabChange('active')} 
                className={`${styles.tabBtn} ${tripTab === 'active' ? styles.tabBtnActive : ''}`}
              >
                <Play size={14} />
                <span>Chuyến đi</span>
              </button>
              <button 
                onClick={() => handleTabChange('history')} 
                className={`${styles.tabBtn} ${tripTab === 'history' ? styles.tabBtnActive : ''}`}
              >
                <History size={14} />
                <span>Lịch sử</span>
              </button>
            </div>
          </div>

          {/* Search Bar Widget */}
          <div className={styles.searchBarWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Tìm theo tên khách hoặc biển số xe..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(5); // Reset display limit on new search
              }}
              className={styles.searchInput}
            />
          </div>

          {filteredAndSearchedTrips.length === 0 ? (
            <div className={`${styles.emptyState} glass-card`}>
              {searchQuery.trim() !== '' ? <Search size={32} className={styles.emptyIcon} /> : (tripTab === 'active' ? <Clock size={32} className={styles.emptyIcon} /> : <History size={32} className={styles.emptyIcon} />)}
              <p>
                {searchQuery.trim() !== '' 
                  ? 'Không tìm thấy chuyến xe khớp với từ khóa.' 
                  : (tripTab === 'active' ? 'Không có chuyến xe nào đang hoạt động.' : 'Lịch sử thuê trống.')}
              </p>
            </div>
          ) : (
            <div className={styles.tripsContainer}>
              
              {/* DESKTOP TABLE VIEW */}
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
                    {displayedTrips.map((trip) => {
                      const vehicle = vehicles ? vehicles.find(v => v.id === trip.vehicleId) : null;
                      return (
                        <tr key={trip.id} className={styles.tripRow}>
                          <td><span className={styles.customerName}>{trip.customerName}</span></td>
                          <td>
                            {vehicle ? (
                              <div className={styles.vehicleCell}>
                                <span className={styles.cellVehicleName}>{vehicle.name}</span>
                                <span className={styles.cellLicensePlate}>{vehicle.licenseplate}</span>
                              </div>
                            ) : (
                              <span className={styles.deletedVehicle}>Xe đã xóa</span>
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
                                    title="Hoàn thành"
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
                                  if (confirm("Xóa lịch sử chuyến này?")) {
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

              {/* MOBILE CARD VIEW */}
              <div className={styles.mobileTripsList}>
                {displayedTrips.map((trip) => {
                  const vehicle = vehicles ? vehicles.find(v => v.id === trip.vehicleId) : null;
                  return (
                    <div key={trip.id} className={`${styles.tripMobileCard} glass-card`}>
                      <div className={styles.tripMobileHeader}>
                        <span className={styles.customerMobileName}>{trip.customerName}</span>
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
                      </div>
                      
                      <div className={styles.tripMobileBody}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Xe thuê:</span>
                          <span className={styles.infoVal}>
                            {vehicle ? `${vehicle.name} (${vehicle.licenseplate})` : 'Xe đã xóa'}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Thời gian:</span>
                          <span className={styles.infoVal}>
                            {trip.startDate} → {trip.endDate} ({trip.days} ngày)
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Số tiền:</span>
                          <span className={`${styles.infoVal} ${styles.moneyText}`}>
                            {formatVND(trip.amount)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.tripMobileFooter}>
                        <div className={styles.mobileActionsGroup}>
                          {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                            <>
                              <button 
                                onClick={() => handleQuickStatusChange(trip, 'completed')} 
                                className={`${styles.mobileActionBtn} ${styles.mobileSuccessBtn}`}
                              >
                                <CheckCircle size={14} />
                                <span>Hoàn thành</span>
                              </button>
                              <button 
                                onClick={() => handleQuickStatusChange(trip, 'cancelled')} 
                                className={`${styles.mobileActionBtn} ${styles.mobileDangerBtn}`}
                              >
                                <XCircle size={14} />
                                <span>Hủy</span>
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm("Xóa lịch sử chuyến này?")) {
                                deleteCarTrip(trip.id);
                              }
                            }} 
                            className={`${styles.mobileActionBtn} ${styles.mobileDeleteBtn}`}
                          >
                            <Trash2 size={14} />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMoreTrips && (
                <div className={styles.loadMoreContainer}>
                  <button 
                    onClick={() => setDisplayLimit(prev => prev + 5)} 
                    className={styles.loadMoreBtn}
                  >
                    <span>Xem thêm chuyến xe</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}

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
                      {v.name} ({v.licenseplate}) - {v.status === 'rented' ? 'Đang bận' : 'Sẵn sàng'}
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
                  type="text" 
                  placeholder="Ví dụ: 1.200.000"
                  value={rawAmount}
                  onChange={handleAmountChange}
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
