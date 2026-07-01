"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx-js-style";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, RotateCcw, ChevronLeft, ChevronRight, Loader2, Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResponseDetailDrawer } from "@/components/admin/ResponseDetailDrawer";
import { Select } from "@/components/ui/Select";
import { deleteMultipleResponses } from "./actions";

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const QUESTION_MAPPING: Record<string, string> = {
  tangibles_1: "Fasilitas pelayanan tersedia dalam kondisi baik dan memadai.",
  tangibles_2: "Ruang pelayanan bersih, nyaman, dan tertata rapi.",
  tangibles_3: "Peralatan yang digunakan dalam pelayanan berfungsi dengan baik.",
  tangibles_4: "Petugas pelayanan berpenampilan rapi dan profesional.",
  tangibles_5: "Informasi pelayanan mudah ditemukan dan dipahami.",
  reliability_1: "Pelayanan diberikan sesuai dengan prosedur yang berlaku.",
  reliability_2: "Petugas menyelesaikan pelayanan sesuai waktu yang dijanjikan.",
  reliability_3: "Hasil pelayanan yang diterima sudah sesuai dengan kebutuhan.",
  reliability_4: "Petugas memberikan pelayanan secara konsisten kepada setiap pengguna layanan.",
  reliability_5: "Kesalahan dalam proses pelayanan jarang terjadi.",
  responsiveness_1: "Petugas segera melayani ketika masyarakat membutuhkan bantuan.",
  responsiveness_2: "Petugas cepat menanggapi pertanyaan atau keluhan.",
  responsiveness_3: "Informasi yang dibutuhkan diberikan dengan cepat.",
  responsiveness_4: "Petugas bersedia membantu ketika terjadi kendala dalam pelayanan.",
  responsiveness_5: "Waktu tunggu pelayanan tergolong cepat.",
  assurance_1: "Petugas memiliki kemampuan yang baik dalam memberikan pelayanan.",
  assurance_2: "Petugas memberikan informasi yang jelas dan dapat dipercaya.",
  assurance_3: "Saya merasa aman dalam menggunakan layanan yang diberikan.",
  assurance_4: "Petugas bersikap sopan dan menghormati pengguna layanan.",
  assurance_5: "Petugas mampu memberikan kepastian terhadap proses pelayanan.",
  empathy_1: "Petugas memberikan perhatian kepada setiap pengguna layanan.",
  empathy_2: "Petugas melayani tanpa membedakan latar belakang pengguna layanan.",
  empathy_3: "Petugas memahami kebutuhan masyarakat dengan baik.",
  empathy_4: "Petugas berkomunikasi dengan ramah dan santun.",
  empathy_5: "Petugas memberikan solusi yang sesuai terhadap permasalahan pengguna layanan."
};

interface ResponsesClientProps {
  initialResponses: any[];
  institutions: any[];
}

export function ResponsesClient({ initialResponses, institutions }: ResponsesClientProps) {
  const [search, setSearch] = useState("");
  const [instFilter, setInstFilter] = useState("Semua Instansi");
  const [dateFilter, setDateFilter] = useState("Semua Waktu");

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map(row => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedIds.length} data penilaian? Data yang dihapus tidak dapat dikembalikan.`)) return;

    setIsDeleting(true);
    try {
      await deleteMultipleResponses(selectedIds);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    const worksheetData = filteredData.map(row => {
      const exportRow: any = {
        "ID Penilaian": row.response_code.replace(/^ASM-/, ""),
        "Tanggal": row.date,
        "Jabatan": row.jabatan,
        "Kecamatan": row.kecamatan,
        "Instansi yang Dinilai": row.inst,
        "Skor Rata-rata": row.score
      };

      // Append SERVQUAL answers
      Object.keys(row.answers || {}).forEach(k => {
        const title = QUESTION_MAPPING[k] || k;
        exportRow[title] = row.answers[k];
      });

      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // 1. Set column widths
    const wscols = [
      { wch: 15 }, // ID Penilaian
      { wch: 15 }, // Tanggal
      { wch: 20 }, // Jabatan
      { wch: 20 }, // Kecamatan
      { wch: 30 }, // Instansi
      { wch: 15 }  // Skor Rata-rata
    ];
    // Add widths for the question columns
    for (let i = 0; i < Object.keys(QUESTION_MAPPING).length; i++) {
      wscols.push({ wch: 50 }); // Give question columns wide width
    }
    worksheet['!cols'] = wscols;

    // 2. Style cells (Headers and Content)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        if (R === 0) {
          // Header styling
          worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "171717" } }, // Dark neutral background
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } }
            }
          };
        } else {
          // Data row styling
          let hAlign = "left";
          if (C > 4) {
            hAlign = "center"; // Skor Rata-rata and Questions
          }

          worksheet[cellAddress].s = {
            alignment: { vertical: "center", horizontal: hAlign, wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "E5E5E5" } },
              bottom: { style: "thin", color: { rgb: "E5E5E5" } },
              left: { style: "thin", color: { rgb: "E5E5E5" } },
              right: { style: "thin", color: { rgb: "E5E5E5" } }
            }
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Penilaian");

    XLSX.writeFile(workbook, `Data_Penilaian_Restrukturisasi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleReset = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSearch("");
      setInstFilter("Semua Instansi");
      setDateFilter("Semua Waktu");
      setCurrentPage(1);
      setIsLoading(false);
    }, 400);
  };

  const filteredData = useMemo(() => {
    return initialResponses.filter((item) => {
      const matchSearch = item.inst.toLowerCase().includes(search.toLowerCase()) ||
        item.response_code.toLowerCase().includes(search.toLowerCase()) ||
        item.nama_penilai.toLowerCase().includes(search.toLowerCase());
      const matchInst = instFilter === "Semua Instansi" || item.inst === instFilter;
      const matchDate = dateFilter === "Semua Waktu" || true;

      return matchSearch && matchInst && matchDate;
    });
  }, [initialResponses, search, instFilter, dateFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-20">

      {/* Header Section */}
      <div className="pt-12 pb-6 px-6 md:px-12 max-w-[1400px] mx-auto border-b border-neutral-100 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Data Penilaian</h1>
          <p className="text-neutral-500 text-base max-w-2xl leading-relaxed pb-4">
            Kelola dan ekspor keseluruhan data hasil penilaian yang masuk ke sistem.
          </p>
        </div>
        <div className="flex gap-3 pb-4">
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting || selectedIds.length === 0}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all shadow-sm ${selectedIds.length > 0
                ? "bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              }`}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Hapus {selectedIds.length > 0 ? `${selectedIds.length} Terpilih` : "Terpilih"}
          </button>
          <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-full hover:bg-black transition-all shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1400px] mx-auto space-y-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex flex-col gap-6"
        >
          {/* Advanced Toolbar (Minimalist) */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 justify-between">
            <div className="flex items-center gap-3 text-neutral-900">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <Filter className="w-4 h-4 text-neutral-700" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Saring Data</span>
            </div>

            <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 w-full xl:w-auto">

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari ID, Nama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm bg-neutral-50 focus:bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
                />
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-3 relative z-30">
                {/* Institution Filter */}
                <div className="w-full sm:w-56 z-20">
                  <Select
                    value={instFilter}
                    onChange={setInstFilter}
                    options={[
                      { label: "Semua Instansi Dinilai", value: "Semua Instansi" },
                      ...institutions.map(inst => ({ label: inst.name, value: inst.name }))
                    ]}
                  />
                </div>

                {/* Date Filter */}
                <div className="w-full md:w-48">
                  <Select
                    value={dateFilter}
                    onChange={setDateFilter}
                    icon={<Calendar className="w-4 h-4" />}
                    options={[
                      { label: "Semua Waktu", value: "Semua Waktu" },
                      { label: "Hari Ini", value: "Hari Ini" },
                      { label: "7 Hari Terakhir", value: "7 Hari Terakhir" },
                      { label: "Bulan Ini", value: "Bulan Ini" }
                    ]}
                  />
                </div>

                {/* Reset */}
                <button onClick={handleReset} className="px-4 py-2.5 shrink-0 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all flex items-center gap-2 text-sm font-medium">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-neutral-200 rounded-3xl p-1 relative min-h-[400px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
              </div>
            )}

            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider relative z-0">
                <tr>
                  <th className="py-4 px-6 font-medium rounded-tl-2xl w-10">
                    <input
                      type="checkbox"
                      className="rounded-sm border-neutral-300 w-4 h-4 cursor-pointer"
                      checked={paginatedData.length > 0 && paginatedData.every(row => selectedIds.includes(row.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-6 font-medium w-24">ID Penilaian</th>
                  <th className="py-4 px-6 font-medium">Tanggal</th>
                  <th className="py-4 px-6 font-medium">Jabatan</th>
                  <th className="py-4 px-6 font-medium">Kecamatan</th>
                  <th className="py-4 px-6 font-medium">Instansi Dinilai</th>
                  <th className="py-4 px-6 font-medium w-20 text-center">Skor</th>
                  <th className="py-4 px-6 font-medium rounded-tr-2xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedData.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-neutral-500">
                      <div className="flex flex-col items-center">
                        <Filter className="w-8 h-8 text-neutral-300 mb-3" />
                        <p>Tidak ada data yang sesuai dengan filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedResponse(row)}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded-sm border-neutral-300 w-4 h-4 cursor-pointer"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-900 font-medium group-hover:text-neutral-700 transition-colors">{row.response_code.replace(/^ASM-/, "")}</td>
                      <td className="px-6 py-4 text-neutral-700">{row.date}</td>
                      <td className="px-6 py-4 text-neutral-500 max-w-[150px] truncate">{row.jabatan}</td>
                      <td className="px-6 py-4 text-neutral-500 max-w-[150px] truncate">{row.kecamatan}</td>
                      <td className="px-6 py-4 font-medium text-neutral-900 max-w-[300px] truncate" title={row.inst}>{row.inst}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center px-2.5 py-1 bg-neutral-100 rounded-lg font-bold text-neutral-900">
                          {row.score.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResponse(row);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-sm px-2 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-neutral-500 font-medium">
              <span className="whitespace-nowrap">Menampilkan {filteredData.length === 0 ? 0 : Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredData.length, currentPage * itemsPerPage)} dari <span className="text-neutral-900 font-bold">{filteredData.length}</span> data</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span>Tampilkan</span>
                <div className="w-[85px] z-20">
                  <Select
                    value={String(itemsPerPage)}
                    onChange={(val) => {
                      setItemsPerPage(Number(val));
                      setCurrentPage(1);
                    }}
                    options={[
                      { label: "10", value: "10" },
                      { label: "25", value: "25" },
                      { label: "50", value: "50" },
                      { label: "100", value: "100" }
                    ]}
                    position="top"
                  />
                </div>
                <span>per halaman</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center justify-center w-10 h-10 border border-neutral-200 text-neutral-500 bg-white rounded-full hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="inline-flex items-center justify-center w-10 h-10 border border-neutral-200 text-neutral-500 bg-white rounded-full hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Response Detail Drawer */}
      <ResponseDetailDrawer
        isOpen={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
        data={selectedResponse}
      />

    </div>
  );
}
