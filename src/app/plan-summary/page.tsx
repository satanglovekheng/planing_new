"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Loader2, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const PlanSummaryDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Filters
  const [filters, setFilters] = useState({
    department_name: '',
    item_type_name: '',
    bdg_year: ''
  });

  // Fetch main data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3009/api/plan-summary');
      const result = await response.json();
      console.log('Fetched plan summary data:', result); // Debugging log
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detail data
  const fetchDetail = async (plan) => {
    try {
      setDetailLoading(true);
      setSelectedPlan(plan);
      setShowModal(true);

      const params = new URLSearchParams({
        stock_plan_id: plan.stock_plan_id,
        item_type_name: plan.item_type_name,
        input_type: plan.input_type
      });

      const response = await fetch(`http://localhost:3009/api/plan-summary/detail?${params}`);
      const result = await response.json();
      console.log('Fetched plan detail data:', result); // Debugging log
      setDetailData(result);
    } catch (err) {
      setError('ไม่สามารถโหลดรายละเอียดได้');
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Filter data
  const filteredData = data.filter(item => {
    return (
      (!filters.department_name || item.department_name.includes(filters.department_name)) &&
      (!filters.item_type_name || item.item_type_name.includes(filters.item_type_name)) &&
      (!filters.bdg_year || item.bdg_year.toString().includes(filters.bdg_year))
    );
  });

  const closeModal = () => {
    setShowModal(false);
    setDetailData(null);
    setSelectedPlan(null);
  };


  const handleApprove = async () => {
    if (!selectedPlan) return;
    console.log('Approving plan:', selectedPlan); // Debugging log
    const officerName = localStorage.getItem("officer_name");
    if (!officerName) {
      alert("ไม่พบข้อมูลผู้ใช้งาน");
      return;
    }

    if (!confirm("ยืนยันการอนุมัติแผนนี้ ?")) return;

    const listIds = detailData?.data?.map(
      (item) => item.stock_plan_list_id
    );
    
    try {
      const res = await fetch("/api/approved/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_plan_list_ids: listIds,
          officer_name: officerName,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      alert(result.message);
      fetchData();       // refresh list
      closeModal();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    }
  };

  // Get unique values for filters
  const uniqueDepartments = [...new Set(data.map(item => item.department_name))];
  const uniqueItemTypes = [...new Set(data.map(item => item.item_type_name))];
  const uniqueYears = [...new Set(data.map(item => item.bdg_year))];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#fefefe] to-gray-50 transition-all duration-300">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-80" : "ml-0"
          }`}
      >
        {/* Header */}
        <div className="bg-[#008374] text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-2">ระบบแสดงข้อมูลแผนพัสดุ</h1>
            <p className="text-[#89ba16] text-sm">จัดการและติดตามแผนการจัดซื้อพัสดุ</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#008374]" />
              <h2 className="text-lg font-semibold text-gray-800">ตัวกรองข้อมูล</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หน่วยงาน</label>
                <select
                  value={filters.department_name}
                  onChange={(e) => setFilters({ ...filters, department_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008374] focus:border-transparent outline-none transition"
                >
                  <option value="">ทั้งหมด</option>
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทพัสดุ</label>
                <select
                  value={filters.item_type_name}
                  onChange={(e) => setFilters({ ...filters, item_type_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008374] focus:border-transparent outline-none transition"
                >
                  <option value="">ทั้งหมด</option>
                  {uniqueItemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ปีงบประมาณ</label>
                <select
                  value={filters.bdg_year}
                  onChange={(e) => setFilters({ ...filters, bdg_year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008374] focus:border-transparent outline-none transition"
                >
                  <option value="">ทั้งหมด</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-[#008374] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#008374] text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">รหัสแผน</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">ปีงบประมาณ</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">หน่วยงาน</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">ประเภทพัสดุ</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">งบประมาณ (บาท)</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">ผู้อนุมัติ</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">{item.stock_plan_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.bdg_year}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.department_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#89ba16] bg-opacity-10 text-white">
                            {item.item_type_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                          {parseFloat(item.total_amount_sum).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => fetchDetail(item)} // ใช้ modal เดิม
                            className={`px-3 py-1 rounded-full text-xs font-semibold
      ${item.approve_count === 3
                                ? "bg-green-100 text-green-700"
                                : item.approve_count > 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {item.approve_count}/3
                          </button>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => fetchDetail(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#008374] text-white rounded-lg hover:bg-[#006d61] transition-colors duration-200 text-sm font-medium shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {!loading && filteredData.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">จำนวนรายการ</p>
                  <p className="text-3xl font-bold text-[#008374]">{filteredData.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">งบประมาณรวม</p>
                  <p className="text-3xl font-bold text-[#89ba16]">
                    {filteredData.reduce((sum, item) => sum + parseFloat(item.total_amount_sum), 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">หน่วยงานที่เกี่ยวข้อง</p>
                  <p className="text-3xl font-bold text-[#008374]">
                    {new Set(filteredData.map(item => item.department_id)).size}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-[#008374] text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">รายละเอียดแผนพัสดุ</h3>
                  {selectedPlan && (
                    <p className="text-sm mt-1">
                      {selectedPlan.department_name} - {selectedPlan.item_type_name}
                    </p>
                  )}
                  {selectedPlan && (
                    <div className="mt-2 flex gap-2 text-xs">
                      {[1, 2, 3].map((n) => {
                        const user = selectedPlan[`app_user_${n}`];
                        const date = selectedPlan[`app_date_${n}`];
                        const time = selectedPlan[`app_time_${n}`];

                        return (
                          <div
                            key={n}
                            className={`px-3 py-1 rounded-full border
            ${user
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-gray-100 text-gray-500 border-gray-300"
                              }`}
                          >
                            {user ? (
                              <>
                                ✅ {user}
                                <br />
                                <span className="text-[10px]">
                                  {date} {time}
                                </span>
                              </>
                            ) : (
                              <>⏳ รออนุมัติ</>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                <div className="flex gap-2">
                  {selectedPlan?.approve_count < 3 && (
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-[#89ba16] text-white rounded-lg hover:bg-[#7aa513] text-sm font-semibold"
                    >
                      ✅ อนุมัติแผน
                    </button>
                  )}

                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                      <div className="w-16 h-16 border-4 border-[#89ba16] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="mt-4 text-gray-600">กำลังโหลดรายละเอียด...</p>
                  </div>
                ) : detailData ? (
                  <div className="space-y-6">
                    {/* Summary Card */}
                    {selectedPlan && (
                      <div className="bg-gradient-to-r from-[#008374] to-[#006d61] text-white rounded-xl p-6 shadow-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-200 mb-1">รหัสแผน</p>
                            <p className="text-2xl font-bold">{selectedPlan.stock_plan_id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-200 mb-1">ปีงบประมาณ</p>
                            <p className="text-2xl font-bold">{selectedPlan.bdg_year}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-200 mb-1">รหัสหน่วยงาน</p>
                            <p className="text-2xl font-bold">{selectedPlan.department_id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-200 mb-1">งบประมาณรวม</p>
                            <p className="text-2xl font-bold text-[#89ba16]">
                              {parseFloat(selectedPlan.total_amount_sum).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detail Information */}
                    {detailData.success && detailData.data && detailData.data.length > 0 ? (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <div className="w-1 h-6 bg-[#89ba16] rounded"></div>
                          รายการพัสดุทั้งหมด ({detailData.data.length} รายการ)
                        </h4>

                        <div className="space-y-3">
                          {detailData.data.map((item, index) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 text-lg mb-1">
                                    {item.item_name || item.description || `รายการที่ ${index + 1}`}
                                  </h5>
                                  {item.item_code && (
                                    <p className="text-sm text-gray-500">รหัส: {item.item_code}</p>
                                  )}
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#89ba16] bg-opacity-10 text-white">
                                  #{index + 1}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {item.quantity && (
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">จำนวน</p>
                                    <p className="font-semibold text-gray-900">{item.quantity}</p>
                                  </div>
                                )}
                                {item.unit && (
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">หน่วย</p>
                                    <p className="font-semibold text-gray-900">{item.unit}</p>
                                  </div>
                                )}
                                {item.unit_price && (
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">ราคาต่อหน่วย</p>
                                    <p className="font-semibold text-gray-900">
                                      {parseFloat(item.unit_price).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                                    </p>
                                  </div>
                                )}
                                {item.total_amount && (
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">ราคารวม</p>
                                    <p className="font-bold text-[#008374]">
                                      {parseFloat(item.total_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Display all other fields */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  {Object.entries(item).map(([key, value]) => {
                                    // Skip already displayed fields
                                    if (['item_name', 'description', 'item_code', 'quantity', 'unit', 'unit_price', 'total_amount'].includes(key)) {
                                      return null;
                                    }
                                    return (
                                      <div key={key} className="flex">
                                        <span className="text-gray-500 font-medium min-w-[120px]">{key}:</span>
                                        <span className="text-gray-700 ml-2">{value !== null && value !== undefined ? value.toString() : '-'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total Summary */}
                        <div className="mt-6 bg-gray-50 rounded-lg p-4 border-2 border-[#008374]">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">รวมทั้งหมด</span>
                            <span className="text-2xl font-bold text-[#008374]">
                              {detailData.data.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500">ไม่พบข้อมูลรายละเอียด</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    ไม่พบข้อมูลรายละเอียด
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlanSummaryDashboard;