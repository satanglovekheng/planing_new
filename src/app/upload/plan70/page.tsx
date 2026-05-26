"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/Sidebar";
// ========== ข้อมูลหน่วยงานทั้งหมด ==========
const ALL_DEPARTMENTS: Record<string, string> = {
    g0000: "คลังกลาง รพ.อต.",
    a0100: "ฝ่ายบริหารทั่วไป",
    a0101: "งานยานพาหนะ",
    a0102: "งานธุรการ",
    a0103: "สถานีบ่มเพาะ",
    a0104: "งานประชาสัมพันธ์",
    a0105: "งานรักษาความปลอดภัย",
    a0106: "งานสนาม",
    a0107: "งานซักฟอก",
    a0108: "งานตัดเย็บ",
    a0200: "กลุ่มงานพัสดุ",
    a0201: "สำนักงานพัสดุ",
    a0202: "งานคลังพัสดุ",
    a0300: "กลุ่มงานการเงิน",
    a0301: "สำนักงานการเงิน",
    a0400: "กลุ่มงานบัญชี",
    a0401: "สำนักงานบัญชี",
    a0500: "กลุ่มงานทรัพยากรบุคคล",
    a0501: "งานทรัพยากรบุคคล",
    a0600: "กลุ่มงานโครงสร้างพื้นฐานและวิศวะกรรมทางการแพทย์",
    a0601: "งานโครงสร้างพื้นฐาน",
    a0602: "งานวิศวกรรมทางการแพทย์",
    b2100: "กลุ่มงานผู้ป่วยนอก",
    b2101: "ห้องเฝือก",
    b2128: "ศูนย์บริการแพทย์ทางไกลและคลิคพบหมอออนไลน์",
    b2129: "คลินิกตรวจมวลกระดูก",
    b2200: "กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก (ในรพ.อต.)",
    b2201: "งานแพทย์แผนไทย-ในโรงพยาบาล",
    b2202: "แพทย์แผนไทย อต.1",
    b2300: "กลุ่มงานเวชกรรมสังคม",
    b2301: "กลุ่มงานเวชกรรมสังคม",
    b2302: "คลินิกกามโรค",
    b2303: "งานป้องกันควบคุมโรคและระบาดวิทยา",
    b2304: "งานพัฒนาระบบบริการปฐมภูมิและสนับสนุนเครือข่าย",
    b2305: "งานคุ้มครองผู้บริโภค",
    b2306: "งานส่งเสริมสุขภาพและฟื้นฟู",
    b2307: "งานเวชปฏิบัตจครอบครัวและชุมชนและศูนย์สุขภาพชุมชนเขตเมือง",
    b2308: "สำนักงานประสาน PCU",
    b2400: "กลุ่มงานสุขศึกษา",
    b2401: "สำนักงานสุขศึกษา",
    b2500: "กลุ่มงานอาชีวเวชกรรม",
    b2501: "สำนักงานอาชีวเวชกรรม",
    b2600: "กลุ่มงานการพยาบาลชุมชน",
    b2601: "งานการพยาบาลชุมชนในการบำบัดรักษายาเสพติด",
    b2602: "งานพยาบาลที่บ้านและชุมชน",
    b2603: "งานพยาบาลผู้จัดการสุขภาพชุมชน",
    b2604: "งานพัฒนาคุณภาพการพยาบาลชุมชน",
    c3100: "กลุ่มงานเวชศาสตร์ฉุกเฉิน",
    c3101: "งานเวชศาสตร์ฉุกเฉิน",
    c3200: "กลุ่มงานอายุรกรรม",
    c3201: "สำนักงานภาควิชาอายุรศาสตร์",
    c3300: "กลุ่มงานศัลยกรรม",
    c3400: "กลุ่มงานศัลยกรรมออร์โธปิดิกส์",
    c3401: "กลุ่มงานศัลยกรรมออร์โธปิดิกส์",
    c3500: "กลุ่มงานกุมารเวชกรรม",
    c3501: "งานกุมารเวชกรรม",
    c3600: "กลุ่มงานนิติเวช",
    c3601: "งานนิติเวช",
    c3700: "กลุ่มงานจักษุวิทยา",
    c3701: "สำนักงานจักษุวิทยา",
    c3800: "กลุ่มงานโสต ศอ นาสิก",
    c3801: "งานโสต ศอ นาสิก",
    c3900: "กลุ่มงานโภชนศาสตร์",
    c3901: "สำนักงานโภชนาการ",
    c4100: "กลุ่มงานพยาธิวิทยากายวิภาค",
    c4101: "สำนักงานพยาธิวิทยา",
    c4200: "กลุ่มงานสูติ-นรีเวชกรรม",
    c4201: "กลุ่มงานสูติ - นรีเวชกรรมและวางแผนครอบครัว",
    c4300: "กลุ่มงานวิสัญญีวิทยา",
    c4301: "กลุ่มงานวิสัญญีวิทยา",
    c4400: "กลุ่มงานจิตเวช",
    c4401: "สำนักงานจิตเวช",
    c4500: "กลุ่มงานทันตกรรม",
    c4501: "ทันตกรรม (OPD)",
    c4502: "ทันตกรรม ANC",
    c4503: "ทันตกรรม WBB",
    c4504: "ทันตกรรม อต2",
    c4505: "ทันตกรรมโรงเรียน",
    c4506: "ทันตกรรม อต1",
    c4507: "งานคลังทันตกรรมย่อย",
    c4508: "งานจัดซื้อ",
    c4600: "กลุ่มงานรังสีรักษา",
    c4601: "กลุ่มงานรังสีวิทยา",
    c4700: "กลุ่มงานเทคนิคการแพทย์และพยาธิวิทยาคลินิก",
    c4701: "งานโลหิตวิทยา",
    c4702: "งานจุลทรรศน์ศาสตร์คลีนิค",
    c4703: "งานภูมิคุ้มกันวิทยา",
    c4704: "งานธนาคารโลหิต",
    c4705: "งานจุลชีววิทยา",
    c4706: "งานจัดซื้อ",
    c4707: "งานบริการผู้ป่วยนอก",
    c4708: "ห้องตรวจคลื่นไฟฟ้าสมอง",
    c4800: "กลุ่มงานเวชกรรมฟื้นฟู",
    c4801: "งานกายภาพบำบัด",
    c4802: "งานกิจกรรมบำบัด / งานอาชีวบำบัด",
    c4803: "งานกายอุปกรณ์",
    c4804: "งานเวชกรรมฟื้นฟู",
    c4900: "กลุ่มงานสังคมสงเคราะห์",
    c4901: "งานสังคมสงเคราะห์",
    c5100: "กลุ่มงานเภสัชกรรม",
    c5101: "งานจัดซื้อ-คลังยา",
    c5102: "ห้องจ่ายยาผู้ป่วยนอก",
    c5103: "ห้องจ่ายยา PCU (จิตเวช)",
    c5104: "ห้องจ่ายยา รพ.อต. สาขา1",
    c5105: "ห้องจ่ายยาตึกอุบัติเหตุ",
    c5106: "ห้องจ่ายยาผู้ป่วยในอายุรกรรม",
    c5107: "ห้องจ่ายยาผู้ป่วยในศัลยกรรม",
    c5108: "งานคลังยาย่อย",
    c5109: "งานผลิตยาน้ำทั่วไป",
    c5110: "งานผลิตยาปราศจากเชื้อ",
    c5111: "งานผลิตยาเคมีบำบัด",
    c5112: "งานผลิตยายาสมุนไพร",
    c5113: "งานบริบาลและเภสัชกรรมปฐมภูมิ",
    c5114: "งานธุรการ - กลุ่มงานเภสัชกรรม",
    d6100: "กลุ่มงานพัฒนาทรัพยากรบุคคล",
    d6200: "กลุ่มงานสารสนเทศทางการแพทย์",
    d6201: "กลุ่มงานสารสนเทศทางการแพทย์",
    d6202: "ศูนย์คอมพิวเตอร์",
    d6300: "กลุ่มงานประกันสุขภาพ",
    d6301: "กลุ่มงานประกันสุขภาพ",
    d6400: "กลุ่มงานยุทธศาสตร์และแผนงานโครงการ",
    d6401: "กลุ่มงานยุทธศาสตร์และแผนงานโครงการ",
    d6500: "กลุ่มงานพัฒนาคุณภาพบริการและมาตรฐาน",
    d6501: "สำนักงานศูนย์รับรองคุณภาพการทำงาน",
    d6600: "งานห้องสมุด",
    d6700: "งานเวชนิทัศน์และโสตทัศนศึกษา",
    e7100: "กลุ่มงานการพยาบาล",
    e7101: "หอผู้ป่วย ตา หู คอ จมูก",
    e7102: "หอผู้ป่วยศัลยกรรมประสาท (ศป.)",
    e7103: "ห้องปฏิบัติการตรวจสวนหัวใจ (Cath lab)",
    e7104: "งานห้องคลอด (LR)",
    e7105: "หอผู้ป่วยสูติกรรมหลังคลอด (PP)",
    e7106: "หอผู้ป่วยนรีเวชกรรม (Gyne)",
    e7107: "ห้องตรวจคลื่นสะท้อนหัวใจ (Echo)",
    e7108: "หออภิบาลผู้ป่วยวิกฤตระบบทางเดินหายใจ (RICU)",
    e7109: "หอผู้ป่วยศัลยกรรมกระดูกชาย (ศกช.)",
    e7110: "หออภิบาลผู้ป่วยวิกฤตโรคหัวใจ (CCU)",
    e7111: "หออภิบาลผู้ป่วยวิกฤตกุมารเวชกรรม(NICU)",
    e7112: "หอแยกโรคผู้ป่วยติดเชื้อ",
    e7113: "หอผู้ป่วยกุมารเวชกรรม 2 (เด็ก 2)",
    e7114: "งานห้องผ่าตัด (OR)",
    e7115: "หออภิบาลผู้ป่วยวิกฤตศัลยกรรมอุบัติเหตุ (ICU Trauma.)",
    e7116: "หออภิบาลผู้ป่วยวิกฤตศัลยกรรม (ICU Surg.)",
    e7117: "หออภิบาลผู้ป่วยวิกฤตศัลยกรรมประสาท (ICU Neuro.)",
    e7118: "งานไตเทียม",
    e7119: "หอผู้ป่วยศัลยกรรมอุบัติเหตุ (ศอ.)",
    e7120: "งานส่องตรวจด้วยกล้อง",
    e7121: "หอผู้ป่วยจิตเวช",
    e7122: "หอผู้ป่วยระบบทางเดินหายใจ (RCW)",
    e7123: "หอผู้ป่วยศัลยกรรมหญิง (ศญ.)",
    e7124: "หออภิบาลผู้ป่วยวิกฤตอายุรกรรม (ICU Med.)",
    e7125: "หอผู้ป่วยอายุรกรรมหญิง",
    e7126: "ศูนย์เครื่องมือแพทย์",
    e7127: "หอผู้ป่วยศัลยกรรมกระดูกหญิง (ศกญ.)",
    e7128: "หอผู้ป่วยพิเศษ Premium 1 ชั้น 4 (กลุ่มฯ ศัลยกรรม)",
    e7129: "หอผู้ป่วยพิเศษ Premium 1 ชั้น 5 (กลุ่มฯ สูติ - นรีเวช)",
    e7130: "หอผู้ป่วยพิเศษ 1 ชั้น 2 (กลุ่มฯ อายุรกรรม)",
    e7131: "งานป้องกันและควบคุมโรคติดเชื้อในโรงพยาบาล (IC)",
    e7132: "สำนักงานกลุ่มการพยาบาล",
    e7133: "หอผู้ป่วยกุมารเวชกรรม 3 (เด็ก 3)",
    e7134: "หอผู้ป่วยอายุรกรรมชาย",
    e7135: "งานอุบัติเหตุและฉุกเฉิน (ER)",
    e7136: "ศูนย์ผ่าตัดแบบวันเดียวกลับ (ODS)",
    e7137: "หอผู้ป่วยพิเศษ 1 ชั้น 3 (กลุ่มฯ ออร์โธปิดิกส์)",
    e7138: "ห้องตรวจคลื่นไฟฟ้าสมอง (EEG)",
    e7139: "สำนักงานผู้ป่วยนอก",
    e7140: "ห้องตรวจโสต ศอ นาสิก",
    e7141: "ห้องฉีดยาทำแผล OPD เก่า",
    e7142: "ห้องฉีดยาทำแผล OPD ศัลย์",
    e7143: "หน่วยเคมีบำบัด",
    e7144: "งานฝากครรภ์",
    e7145: "งานล้างไตทางช่องท้อง",
    e7146: "หอผู้ป่วยศัลยกรรมกระดูกชาย (ศกช.)",
    e7147: "งานศูนย์จ่ายกลาง",
    e7148: "งานวิสัญญี",
    e7149: "Pre post cath+พิเศษอายุรกรรม",
    e7150: "หอผู้ป่วยโรคหลอดเลือดสมอง(Stroke Unit) (กลุ่มอายุรกรรม)",
    e7151: "ศูนย์โรคไต ( เรื้อรัง+ คลินิกไต)",
    e7152: "งานศูนย์เปล",
    e7153: "งานรังสีร่วมรักษา",
    e7159: "ศัลยกรรมชาย",
    f0000: "ด้านผลิตบุลากรทางการแพทย์",
    f8100: "ศูนย์แพทยศาสตร์ศึกษาชั้นคลินิก",
    a2601: "กลุ่มงานเทคโนโลยีสารสนเทศ",
    a2602: "กลุ่มงานสุขภาพดิจิทัล",
    a2603: "กลุ่มงานเวรระเบียนและข้อมูลทางการแพทย์",
    h0100: "สำนักงานองค์การแพทย์",
    h0200: "โรงพยาบาลอุตรดิตถ์ สาขา 1",
    h0300: "โรงพยาบาลอุตรดิตถ์ สาขา 2",
    h0400: "ศูนย์การดูแลแบบประคับประคอง",
    h0500: "สภาความปลอดภัย",
};

interface FileInfo {
    filename: string;
    departmentId: string;
    departmentName: string;
    fileType: string;
    timestamp: number;
    uploadedAt: string;
    sizeMB?: number;
}

interface DepartmentSubmission {
    departmentId: string;
    departmentName: string;
    fileCount: number;
    files: FileInfo[];
    latestUpload: string;
}

export default function UploadExcelPage() {
    const [department, setDepartment] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState("");
    const [templates, setTemplates] = useState([]);

    const [submissions, setSubmissions] = useState<DepartmentSubmission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(true);
    const [modalDept, setModalDept] = useState<DepartmentSubmission | null>(null);
    const [searchDept, setSearchDept] = useState("");

    useEffect(() => {
        fetch("/api/templates/plan70")
            .then((res) => res.json())
            .then(setTemplates);
    }, []);

    useEffect(() => {
        fetch("/api/submissions/plan70")
            .then((res) => res.json())
            .then((data) => {
                setSubmissions(data.departments || []);
                setSubmissionsLoading(false);
            })
            .catch(() => setSubmissionsLoading(false));
    }, []);

    useEffect(() => {
        const normalizedDepartmentId = departmentId.trim().toLowerCase();

        if (!normalizedDepartmentId) {
            setDepartment("");
            return;
        }

        setDepartment(ALL_DEPARTMENTS[normalizedDepartmentId] || "");
    }, [departmentId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!department || !file || !selectedFileType || !departmentId) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        const formData = new FormData();
        formData.append("departmentId", departmentId);
        formData.append("department", department);
        formData.append("file", file);
        formData.append("fileType", selectedFileType);

        const selectedTemplate = templates.find((t) => t.name === selectedFileType);
        if (selectedTemplate) {
            formData.append("folder", selectedTemplate.folder);
        }

        setLoading(true);
        const res = await fetch("/api/upload-excel/plan70", {
            method: "POST",
            body: formData,
        });
        setLoading(false);
        if (res.ok) {
            alert("อัปโหลดสำเร็จ 🎉");
            setDepartment("");
            setFile(null);
            setSelectedFileType("");
            setDepartmentId("");
            fetch("/api/submissions/plan70")
                .then((res) => res.json())
                .then((data) => setSubmissions(data.departments || []));
        } else {
            alert("อัปโหลดไม่สำเร็จ");
        }
    }

    function handleDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    }

    // Build submitted dept IDs set
    const submittedIds = new Set(submissions.map((s) => s.departmentId));

    // Build merged list: submitted first (green), then not-submitted (red)
    // Each entry: id, name, submitted, submissionData?
    type MergedDept = {
        departmentId: string;
        departmentName: string;
        submitted: boolean;
        submissionData?: DepartmentSubmission;
    };

    const allDeptEntries: MergedDept[] = [];

    // submitted ones first
    submissions.forEach((s) => {
        allDeptEntries.push({
            departmentId: s.departmentId,
            departmentName: s.departmentName,
            submitted: true,
            submissionData: s,
        });
    });

    // then not-submitted
    Object.entries(ALL_DEPARTMENTS).forEach(([id, name]) => {
        if (!submittedIds.has(id)) {
            allDeptEntries.push({
                departmentId: id,
                departmentName: name,
                submitted: false,
            });
        }
    });

    const filteredDepts = allDeptEntries.filter(
        (d) =>
            d.departmentId.toLowerCase().includes(searchDept.toLowerCase()) ||
            d.departmentName.toLowerCase().includes(searchDept.toLowerCase())
    );

    const totalAll = Object.keys(ALL_DEPARTMENTS).length;
    const totalSubmitted = submissions.length;
    const totalPending = totalAll - totalSubmitted;

    return (
        <div>
            <Navbar />
            <div className="flex min-h-screen">

                <Sidebar />
                <div className="max-w-0xl mx-auto px-30">
                    {/* Header Section */}
                    <div className="text-center mb-10 pt-10">
                        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                            จัดทำแผนปี 2570
                        </h1>
                        <p className="text-gray-500 text-sm">
                            อัปโหลดไฟล์ข้อมูลของหน่วยงาน
                        </p>
                        <p className="text-sm text-gray-700 mt-3">
                            กรุณาตรวจสอบ{" "}
                            <a
                                href="https://docs.google.com/spreadsheets/d/1I2RO08MkwjuPKkJhhRo-2c7Zvf6EL7UB/edit?gid=538192751#gid=538192751"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#89ba16] font-semibold underline underline-offset-2 hover:text-[#7aa614] transition-colors"
                            >
                                👉 รายการครุภัณฑ์ทดแทน
                            </a>{" "}
                            ว่าท่านยังต้องการรายการครุภัณฑ์นี้อยู่หรือไม่{" "}
                            เพื่อจัดทำแผนครุภัณฑ์ทดแทน ปี 2570
                        </p>
                    </div>

                    {/* Main Content - 3 column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ===== Column 1: Submissions Status ===== */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-[#89ba16] px-5 py-4">
                                <h2 className="text-base font-medium text-white flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    ตรวจสอบสถานะการส่งไฟล์
                                </h2>
                                <p className="text-white/80 text-xs mt-0.5">
                                    {submissionsLoading
                                        ? "กำลังโหลด..."
                                        : `ส่งแล้ว ${totalSubmitted} · ยังไม่ส่ง ${totalPending} · รวม ${totalAll} หน่วยงาน`}
                                </p>
                            </div>

                            {/* Stats bar */}
                            {!submissionsLoading && (
                                <div className="grid grid-cols-3 border-b border-gray-100 text-center">
                                    <div className="py-2.5 border-r border-gray-100">
                                        <p className="text-base font-bold text-[#89ba16]">{totalSubmitted}</p>
                                        <p className="text-[10px] text-gray-500">ส่งแล้ว</p>
                                    </div>
                                    <div className="py-2.5 border-r border-gray-100">
                                        <p className="text-base font-bold text-red-500">{totalPending}</p>
                                        <p className="text-[10px] text-gray-500">ยังไม่ส่ง</p>
                                    </div>
                                    <div className="py-2.5">
                                        <p className="text-base font-bold text-gray-700">{totalAll}</p>
                                        <p className="text-[10px] text-gray-500">ทั้งหมด</p>
                                    </div>
                                </div>
                            )}

                            {/* Search */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchDept}
                                        onChange={(e) => setSearchDept(e.target.value)}
                                        placeholder="ค้นหาหน่วยงาน..."
                                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#89ba16] focus:border-[#89ba16] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Department List */}
                            <div className="flex-1 overflow-y-auto" style={{ maxHeight: "520px" }}>
                                {submissionsLoading ? (
                                    <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span className="text-xs">กำลังโหลด...</span>
                                    </div>
                                ) : (
                                    <div className="p-3 space-y-1.5">
                                        {filteredDepts.map((dept) =>
                                            dept.submitted ? (
                                                // Submitted — clickable green card
                                                <button
                                                    key={dept.departmentId}
                                                    onClick={() => setModalDept(dept.submissionData!)}
                                                    className="w-full text-left px-3 py-2.5 rounded-lg border border-[#89ba16]/30 bg-[#89ba16]/5 hover:bg-[#89ba16]/10 hover:border-[#89ba16]/60 transition-all duration-150 group"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#89ba16]" />
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-mono text-gray-400 leading-none mb-0.5">{dept.departmentId}</p>
                                                                <p className="text-xs font-medium text-gray-800 truncate leading-snug">{dept.departmentName}</p>
                                                            </div>
                                                        </div>
                                                        <span className="flex-shrink-0 text-[10px] font-medium bg-[#89ba16] text-white px-1.5 py-0.5 rounded-full">
                                                            {dept.submissionData!.fileCount} ไฟล์
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1 ml-3.5 truncate">{dept.submissionData!.latestUpload}</p>
                                                </button>
                                            ) : (
                                                // Not submitted — red card (non-clickable)
                                                <div
                                                    key={dept.departmentId}
                                                    className="px-3 py-2.5 rounded-lg border border-red-200 bg-red-50"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-mono text-red-300 leading-none mb-0.5">{dept.departmentId}</p>
                                                            <p className="text-xs font-medium text-red-600 truncate leading-snug">{dept.departmentName}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-red-300 mt-1 ml-3.5">ยังไม่ได้ส่งไฟล์</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <style jsx>{`
              .flex-1::-webkit-scrollbar { width: 4px; }
              .flex-1::-webkit-scrollbar-track { background: transparent; }
              .flex-1::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
              .flex-1::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}</style>
                        </div>

                        {/* ===== Column 2: Templates List ===== */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-fit lg:sticky lg:top-6">
                            <div className="bg-gray-700 px-5 py-4">
                                <h2 className="text-base font-medium text-white flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    ดาวน์โหลดแบบฟอร์มเพื่อจัดทำแผน
                                </h2>
                                <p className="text-white/70 text-xs mt-0.5">ดาวน์โหลดไฟล์ตัวอย่างเพื่อใช้งาน</p>
                            </div>

                            <div className="max-h-[550px] overflow-y-auto">
                                <div className="p-4 space-y-2.5">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="border border-gray-200 rounded-xl p-3.5 hover:border-[#89ba16] hover:bg-[#89ba16]/5 transition-all duration-200"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xs font-medium text-gray-900 mb-0.5">{template.name}</h3>
                                                    <p className="text-[11px] text-gray-500 mb-2.5 line-clamp-2">{template.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
                                                            {template.size}
                                                        </span>
                                                        <a
                                                            href={template.url}
                                                            download
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#89ba16] text-white text-[11px] font-medium hover:bg-[#7aa614] transition-colors"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                            ดาวน์โหลด
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <style jsx>{`
              .max-h-\[550px\]::-webkit-scrollbar { width: 4px; }
              .max-h-\[550px\]::-webkit-scrollbar-track { background: transparent; }
              .max-h-\[550px\]::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
            `}</style>
                        </div>

                        {/* ===== Column 3: Upload Form ===== */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-fit">
                            <div className="bg-gray-900 px-5 py-4">
                                <h2 className="text-base font-medium text-white flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    ส่งไฟล์แผน
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* File Type Selection */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-900 mb-1.5">
                                        ประเภทไฟล์ <span className="text-[#89ba16]">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <select
                                            value={selectedFileType}
                                            onChange={(e) => setSelectedFileType(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89ba16] focus:border-[#89ba16] transition-all outline-none appearance-none bg-white cursor-pointer text-xs"
                                        >
                                            <option value="">เลือกประเภทไฟล์</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.name}>{template.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {selectedFileType && (
                                        <p className="mt-1.5 text-[11px] text-[#89ba16] flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            จัดเก็บใน: {templates.find((t) => t.name === selectedFileType)?.folder}
                                        </p>
                                    )}
                                </div>

                                {/* Department ID + Name */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-900 mb-1.5">
                                            รหัสหน่วยงาน <span className="text-[#89ba16]">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={departmentId}
                                                onChange={(e) => setDepartmentId(e.target.value.toLowerCase())}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89ba16] focus:border-[#89ba16] transition-all outline-none text-xs"
                                                placeholder="รหัสหน่วยงาน เช่น a0100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-900 mb-1.5">
                                            ชื่อหน่วยงาน <span className="text-[#89ba16]">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={department}
                                                readOnly
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89ba16] focus:border-[#89ba16] transition-all outline-none text-xs"
                                                placeholder="ระบุชื่อหน่วยงาน"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload Area */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-900 mb-1.5">
                                        ไฟล์ Excel <span className="text-[#89ba16]">*</span>
                                    </label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${dragActive
                                            ? "border-[#89ba16] bg-[#89ba16]/5"
                                            : file
                                                ? "border-[#89ba16] bg-[#89ba16]/5"
                                                : "border-gray-300 hover:border-gray-400"
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            id="file-upload"
                                        />
                                        <div className="p-6 text-center">
                                            {file ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-11 h-11 bg-[#89ba16] rounded-xl flex items-center justify-center mb-2">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-900 mb-0.5">{file.name}</p>
                                                    <p className="text-[11px] text-gray-500 mb-2">{(file.size / 1024).toFixed(2)} KB</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFile(null)}
                                                        className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors"
                                                    >
                                                        ลบไฟล์
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs text-gray-800 font-medium mb-0.5">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</p>
                                                    <p className="text-[11px] text-gray-400">รองรับไฟล์ .xlsx และ .xls</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !department || !file || !selectedFileType}
                                    className="w-full bg-[#89ba16] text-white py-3 rounded-xl font-medium hover:bg-[#7aa614] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            กำลังอัปโหลด...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            บันทึกไฟล์
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="mt-8 mb-10 bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-[#89ba16]/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#89ba16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-gray-900 mb-1.5">คำแนะนำการใช้งาน</h3>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-[#89ba16] mt-0.5">•</span>
                                        <span>เลือกประเภทไฟล์ที่ต้องการอัปโหลด ระบบจะจัดเก็บในโฟลเดอร์ที่เหมาะสม</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-[#89ba16] mt-0.5">•</span>
                                        <span>ดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบข้อมูลที่ถูกต้อง</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-[#89ba16] mt-0.5">•</span>
                                        <span>หน่วยงานที่แสดงเป็นสีแดงยังไม่ได้ส่งไฟล์ · หน่วยงานสีเขียวส่งแล้ว (คลิกดูรายละเอียดได้)</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-[#89ba16] mt-0.5">•</span>
                                        <span>ไฟล์ต้องเป็นนามสกุล .xlsx หรือ .xls เท่านั้น</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== MODAL ===== */}
                {
                    modalDept && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setModalDept(null);
                            }}
                        >
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                                {/* Modal Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-mono text-gray-400 mb-0.5">{modalDept.departmentId}</p>
                                        <h3 className="text-base font-semibold text-gray-900">{modalDept.departmentName}</h3>
                                    </div>
                                    <button
                                        onClick={() => setModalDept(null)}
                                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Modal Stats */}
                                <div className="grid grid-cols-3 border-b border-gray-100">
                                    <div className="px-5 py-3 border-r border-gray-100 text-center">
                                        <p className="text-lg font-semibold text-gray-900">{modalDept.fileCount}</p>
                                        <p className="text-xs text-gray-500">ไฟล์ทั้งหมด</p>
                                    </div>
                                    <div className="px-5 py-3 border-r border-gray-100 text-center">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Set(modalDept.files.map((f) => f.fileType)).size}
                                        </p>
                                        <p className="text-xs text-gray-500">ประเภท</p>
                                    </div>
                                    <div className="px-5 py-3 text-center">
                                        <p className="text-xs font-medium text-gray-900 leading-tight mt-1">{modalDept.latestUpload || "-"}</p>
                                        <p className="text-xs text-gray-500">ล่าสุด</p>
                                    </div>
                                </div>

                                {/* Modal File List */}
                                <div className="overflow-y-auto flex-1 p-5">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">รายการไฟล์</p>
                                    <div className="space-y-2">
                                        {modalDept.files.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-[#89ba16]/40 hover:bg-[#89ba16]/5 transition-all duration-150"
                                            >
                                                <div className="flex-shrink-0 w-9 h-9 bg-[#89ba16]/10 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-[#89ba16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.filename.replace(/^\d+_[^_]+_\d+_/, '')}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {file.fileType} · {file.uploadedAt}
                                                    </p>
                                                </div>
                                                {file.sizeMB != null && (
                                                    <span className="flex-shrink-0 text-xs text-gray-400 font-mono">{file.sizeMB} MB</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
            </div>
            );
}
