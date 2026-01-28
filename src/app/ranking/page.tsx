"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { Search, GripVertical, Check, X, Save, AlertCircle } from 'lucide-react';

export default function RankingSystem() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('all');
    const [rankedItems, setRankedItems] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const officerId = localStorage.getItem("officer_id");

        if (!officerId) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [router, pathname]);

    useEffect(() => {
        setLoading(true);
        fetch("/api/ranking")
            .then((res) => res.json())
            .then((data) => {
                setData(data);

                // แยกรายการที่มี unit_cost (จัดอันดับแล้ว) ออกมา
                const rankedData = data
                    .filter(item => item.unit_cost !== null && item.unit_cost !== undefined)
                    .sort((a, b) => a.unit_cost - b.unit_cost)
                    .map(item => ({
                        ...item,
                        uniqueId: `${item.stock_plan_list_id}`
                    }));

                setRankedItems(rankedData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Filter data
    useEffect(() => {
        let filtered = data.filter((item) => {
            const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAgency = selectedAgency === 'all' || item.item_type_name === selectedAgency;
            // ไม่แสดงรายการที่จัดอันดับแล้ว (มี unit_cost)
            const notRanked = !rankedItems.find(r => r.stock_plan_list_id === item.stock_plan_list_id);
            return matchesSearch && matchesAgency && notRanked;
        });
        setFilteredData(filtered);
    }, [searchTerm, selectedAgency, data, rankedItems]);

    const agencies = ['all', ...new Set(data.map(item => item.item_type_name))];

    const addToRanking = (item) => {
        if (rankedItems.length >= 10) return;

        // ตรวจสอบว่ามีรายการนี้อยู่แล้วหรือไม่
        const alreadyRanked = rankedItems.find(r => r.stock_plan_list_id === item.stock_plan_list_id);
        if (alreadyRanked) return;

        setRankedItems([...rankedItems, {
            ...item,
            uniqueId: `${item.stock_plan_list_id}`
        }]);
    };

    const removeFromRanking = async (stock_plan_list_id) => {
        // ลบออกจาก state
        setRankedItems(rankedItems.filter(item => item.stock_plan_list_id !== stock_plan_list_id));

        // รีเซ็ต unit_cost ในฐานข้อมูล (ตั้งเป็น NULL)
        try {
            await fetch('/api/ranking', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock_plan_list_ids: [stock_plan_list_id] }),
            });
        } catch (error) {
            console.error('Error resetting rank:', error);
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === index) return;

        const newRankedItems = [...rankedItems];
        const draggedItemContent = newRankedItems[draggedItem];
        newRankedItems.splice(draggedItem, 1);
        newRankedItems.splice(index, 0, draggedItemContent);

        setRankedItems(newRankedItems);
        setDraggedItem(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    // Save ranking to database
    const saveRanking = async () => {
        if (rankedItems.length === 0) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
            return;
        }

        setSaving(true);
        setSaveStatus(null);

        try {
            // Prepare data with stock_plan_list_id and unit_cost
            const rankingData = rankedItems.map((item, index) => ({
                stock_plan_list_id: item.stock_plan_list_id,
                unit_cost: index + 1 // บันทึกลำดับอันดับ 1-10
            }));

            const response = await fetch('/api/ranking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rankingData),
            });

            const result = await response.json();

            if (response.ok) {
                setSaveStatus('success');
                // Optional: Reload data to refresh
                // fetch("/api/ranking").then(res => res.json()).then(setData);
            } else {
                setSaveStatus('error');
                console.error('Save error:', result);
            }
        } catch (error) {
            setSaveStatus('error');
            console.error('Save error:', error);
        } finally {
            setSaving(false);
            // Auto-hide status message after 3 seconds
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
                    <p className="mt-4 text-gray-600 font-light">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-3 tracking-tight">
                        จัดอันดับความสำคัญ
                    </h1>
                    <p className="text-gray-500 font-light text-lg">เลือกและจัดเรียงรายการ 10 อันดับแรก</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Side - Data List */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Filters */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-green-100 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหารายการ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all font-light bg-white"
                                    />
                                </div>

                                {/* Agency Filter */}
                                <select
                                    value={selectedAgency}
                                    onChange={(e) => setSelectedAgency(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-300 appearance-none bg-white font-light transition-all"
                                >
                                    {agencies.map(agency => (
                                        <option key={agency} value={agency}>
                                            {agency === 'all' ? 'ทุกหน่วยงาน' : agency}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Data Cards */}
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
                            {filteredData.map((item) => (
                                <button
                                    key={item.stock_plan_list_id}
                                    onClick={() => addToRanking(item)}
                                    disabled={rankedItems.length >= 10}
                                    className={`w-full bg-white/80 backdrop-blur-sm rounded-xl p-4 text-left transition-all border border-gray-100 hover:border-green-200 hover:shadow-md group ${rankedItems.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] cursor-pointer'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-normal text-gray-800 mb-1 group-hover:text-green-700 transition-colors truncate">
                                                {item.item_name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 font-light">
                                                <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs">
                                                    {item.item_type_name}
                                                </span>
                                                <span>{item.item_unit}</span>
                                                <span className="text-green-600">จำนวน: {item.period1_qty?.toLocaleString('th-TH')}</span>
                                                <span className="text-gray-700 font-normal">฿{item.total_qty?.toLocaleString('th-TH')}</span>
                                            </div>
                                        </div>
                                        {rankedItems.length < 10 && (
                                            <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                    <span className="text-green-600 text-lg">+</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}

                            {filteredData.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="font-light">ไม่พบรายการที่ค้นหา</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Ranking Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-green-100 p-5 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-normal text-gray-800">อันดับความสำคัญ</h2>
                                <div className="text-sm font-light text-gray-500">
                                    {rankedItems.length}/10
                                </div>
                            </div>

                            {rankedItems.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <p className="font-light text-sm mb-2">ยังไม่มีรายการ</p>
                                    <p className="font-light text-xs">คลิกเลือกรายการจากด้านซ้าย</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {rankedItems.map((item, index) => (
                                        <div
                                            key={item.uniqueId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`group relative flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-move ${index === 0
                                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                                    : index === 1
                                                        ? 'bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-100'
                                                        : index === 2
                                                            ? 'bg-gradient-to-br from-green-50/30 to-emerald-50/30 border-green-50'
                                                            : 'bg-white border-gray-100'
                                                } ${draggedItem === index ? 'opacity-50 scale-95' : 'hover:shadow-md'}`}
                                        >
                                            {/* Drag Handle */}
                                            <div className="flex-shrink-0 mt-1">
                                                <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                                            </div>

                                            {/* Rank Number */}
                                            <div className="flex-shrink-0">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-normal ${index === 0
                                                        ? 'bg-green-400 text-white'
                                                        : index === 1
                                                            ? 'bg-green-300 text-white'
                                                            : index === 2
                                                                ? 'bg-green-200 text-white'
                                                                : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-normal text-gray-800 text-sm mb-1 truncate">
                                                    {item.item_name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-light">
                                                    <span className="truncate">{item.item_type_name}</span>
                                                    <span>•</span>
                                                    <span className="text-green-600">฿{item.total_qty?.toLocaleString('th-TH')}</span>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromRanking(item.stock_plan_list_id)}
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors">
                                                    <X className="w-3.5 h-3.5 text-red-400" />
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Summary */}
                            {rankedItems.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="space-y-2 text-sm font-light">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">รายการทั้งหมด</span>
                                            <span className="text-gray-700">{rankedItems.length} รายการ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">งบประมาณรวม</span>
                                            <span className="text-green-600 font-normal">
                                                ฿{rankedItems.reduce((sum, item) => sum + (item.total_qty || 0), 0).toLocaleString('th-TH')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            {rankedItems.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={saveRanking}
                                        disabled={saving}
                                        className={`w-full py-3 rounded-xl font-light transition-all flex items-center justify-center gap-2 ${rankedItems.length === 10
                                                ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500 hover:shadow-lg'
                                                : 'bg-gradient-to-r from-green-300 to-emerald-300 text-white hover:from-green-400 hover:to-emerald-400'
                                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                กำลังบันทึก...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                บันทึกการจัดอันดับ {rankedItems.length < 10 && `(${rankedItems.length}/10)`}
                                            </>
                                        )}
                                    </button>

                                    {/* Status Messages */}
                                    {saveStatus === 'success' && (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-light">
                                            <Check className="w-4 h-4 flex-shrink-0" />
                                            <span>บันทึกการจัดอันดับเรียบร้อยแล้ว</span>
                                        </div>
                                    )}

                                    {saveStatus === 'error' && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-light">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #bbf7d0;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #86efac;
        }
      `}</style>
        </div>
    );
}