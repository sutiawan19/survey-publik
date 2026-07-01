"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, Trash2, MapPin, Building2, User, Briefcase, Info, Sparkles } from "lucide-react";
import { deleteMultipleResponses } from "@/app/admin/responses/actions";
import { useRouter } from "next/navigation";

interface ResponseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null;
}

const DIMENSIONS = [
  {
    id: "tangibles",
    title: "Tangibles (Bukti Fisik)",
    questions: [
      { id: "tangibles_1", text: "Fasilitas pelayanan tersedia dalam kondisi baik dan memadai." },
      { id: "tangibles_2", text: "Ruang pelayanan bersih, nyaman, dan tertata rapi." },
      { id: "tangibles_3", text: "Peralatan yang digunakan dalam pelayanan berfungsi dengan baik." },
      { id: "tangibles_4", text: "Petugas pelayanan berpenampilan rapi dan profesional." },
      { id: "tangibles_5", text: "Informasi pelayanan mudah ditemukan dan dipahami." }
    ]
  },
  {
    id: "reliability",
    title: "Reliability (Keandalan)",
    questions: [
      { id: "reliability_1", text: "Pelayanan diberikan sesuai dengan prosedur yang berlaku." },
      { id: "reliability_2", text: "Petugas menyelesaikan pelayanan sesuai waktu yang dijanjikan." },
      { id: "reliability_3", text: "Hasil pelayanan yang diterima sudah sesuai dengan kebutuhan." },
      { id: "reliability_4", text: "Petugas memberikan pelayanan secara konsisten kepada setiap pengguna layanan." },
      { id: "reliability_5", text: "Kesalahan dalam proses pelayanan jarang terjadi." }
    ]
  },
  {
    id: "responsiveness",
    title: "Responsiveness (Daya Tanggap)",
    questions: [
      { id: "responsiveness_1", text: "Petugas segera melayani ketika masyarakat membutuhkan bantuan." },
      { id: "responsiveness_2", text: "Petugas cepat menanggapi pertanyaan atau keluhan." },
      { id: "responsiveness_3", text: "Informasi yang dibutuhkan diberikan dengan cepat." },
      { id: "responsiveness_4", text: "Petugas bersedia membantu ketika terjadi kendala dalam pelayanan." },
      { id: "responsiveness_5", text: "Waktu tunggu pelayanan tergolong cepat." }
    ]
  },
  {
    id: "assurance",
    title: "Assurance (Jaminan)",
    questions: [
      { id: "assurance_1", text: "Petugas memiliki kemampuan yang baik dalam memberikan pelayanan." },
      { id: "assurance_2", text: "Petugas memberikan informasi yang jelas dan dapat dipercaya." },
      { id: "assurance_3", text: "Saya merasa aman dalam menggunakan layanan yang diberikan." },
      { id: "assurance_4", text: "Petugas bersikap sopan dan menghormati pengguna layanan." },
      { id: "assurance_5", text: "Petugas mampu memberikan kepastian terhadap proses pelayanan." }
    ]
  },
  {
    id: "empathy",
    title: "Empathy (Empati)",
    questions: [
      { id: "empathy_1", text: "Petugas memberikan perhatian kepada setiap pengguna layanan." },
      { id: "empathy_2", text: "Petugas melayani tanpa membedakan latar belakang pengguna layanan." },
      { id: "empathy_3", text: "Petugas memahami kebutuhan masyarakat dengan baik." },
      { id: "empathy_4", text: "Petugas berkomunikasi dengan ramah dan santun." },
      { id: "empathy_5", text: "Petugas memberikan solusi yang sesuai terhadap permasalahan pengguna layanan." }
    ]
  }
];

function getScoreData(score100: number) {
  if (score100 <= 20) {
    return { status: "Sangat Tidak Baik", recommendation: "Kondisi sangat jauh dari harapan dan hampir tidak mendukung pelayanan. Indikator tidak berjalan dengan baik, sering menimbulkan hambatan, keluhan, atau kegagalan dalam proses pelayanan.", rekomendasi: "Menyusun ulang visi, misi serta tujuan yang berbasis kualitas pelayanan publik.", rekomendasiDetail: "Menambahkan komitmen pelayanan prima dalam visi dan misi, menetapkan target kepuasan masyarakat sebagai indikator kinerja, serta menyusun rencana strategis yang berfokus pada peningkatan kualitas pelayanan.", color: "text-rose-600", bg: "bg-rose-50" };
  } else if (score100 <= 40) {
    return { status: "Tidak Baik", recommendation: "Kondisi masih kurang memadai dan belum mampu mendukung pelayanan secara optimal. Indikator sudah ada atau diterapkan, tetapi pelaksanaannya masih banyak kekurangan sehingga pelayanan sering terganggu.", rekomendasi: "Melakukan survei kepuasan masyarakat sebagai dasar perbaikan pelayanan.", rekomendasiDetail: "Menyebarkan kuesioner kepuasan secara berkala, menyediakan kotak saran atau kanal pengaduan digital, serta mengevaluasi hasil survei untuk memperbaiki aspek pelayanan yang masih lemah.", color: "text-amber-600", bg: "bg-amber-50" };
  } else if (score100 <= 60) {
    return { status: "Cukup", recommendation: "Kondisi cukup memadai dan mampu mendukung pelayanan pada tingkat dasar. Indikator telah berjalan sesuai standar minimum, namun masih terdapat beberapa kelemahan yang perlu diperbaiki.", rekomendasi: "Menguatkan kualitas SDM melalui berbagai pelatihan berbasis kompetensi.", rekomendasiDetail: "Menyelenggarakan pelatihan pelayanan prima (service excellence), komunikasi publik, etika pelayanan, penggunaan teknologi informasi, dan peningkatan kompetensi sesuai bidang tugas pegawai.", color: "text-violet-600", bg: "bg-violet-50" };
  } else if (score100 <= 80) {
    return { status: "Baik", recommendation: "Kondisi sudah berjalan dengan baik dan mendukung pelayanan secara efektif. Indikator terlaksana secara konsisten, hanya terdapat sedikit kendala yang tidak terlalu memengaruhi kualitas pelayanan.", rekomendasi: "Mengembangkan sistem serta inovasi pelayanan publik.", rekomendasiDetail: "Menerapkan layanan berbasis digital (e-service), sistem antrean elektronik, aplikasi pengaduan masyarakat, layanan terpadu satu pintu, serta penyederhanaan prosedur pelayanan.", color: "text-blue-600", bg: "bg-blue-50" };
  } else {
    return { status: "Sangat Baik", recommendation: "Kondisi sangat optimal dan menjadi pendukung utama kualitas pelayanan. Indikator berjalan secara maksimal, efektif, efisien, dan mampu memberikan dampak positif yang signifikan terhadap pelayanan.", rekomendasi: "Mempertahankan dan mengembangkan inovasi pelayanan publik secara berkelanjutan.", rekomendasiDetail: "Melakukan evaluasi inovasi secara berkala, mengembangkan fitur layanan digital baru, memberikan penghargaan kepada unit kerja berprestasi, serta menjadikan inovasi yang berhasil sebagai praktik terbaik (best practice) yang diterapkan di seluruh unit pelayanan.", color: "text-emerald-600", bg: "bg-emerald-50" };
  }
}

export function ResponseDetailDrawer({ isOpen, onClose, data }: ResponseDetailDrawerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!data) return null;

  const handleConfirmDelete = async () => {
    if (!window.confirm("Yakin ingin menghapus data ini secara permanen?")) return;
    setIsDeleting(true);
    try {
      await deleteMultipleResponses([data.db_id]);
      onClose();
      router.refresh();
    } catch (err: any) {
      alert("Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  const score100 = data ? (data.score / 5) * 100 : 0;
  const scoreInfo = getScoreData(score100);

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full bg-neutral-50 font-sans">

        {/* Detail Header */}
        <div className="bg-white px-8 pt-10 pb-8 border-b border-neutral-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1 uppercase tracking-widest">Detail Penilaian SERVQUAL</p>
              <h2 className="text-3xl font-bold text-neutral-950 font-mono tracking-tight">{data.response_code.replace(/^ASM-/, "")}</h2>
              <p className="text-neutral-500 mt-1">{data.date}</p>
            </div>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus
            </button>
          </div>

          <div className="bg-neutral-950 rounded-md p-6 text-white mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-neutral-400 text-sm font-medium mb-1">Skor Keseluruhan</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tighter">{data.score.toFixed(2)}</span>
                <span className="text-xl text-neutral-500">/ 5.0</span>
                <span className="ml-2 text-2xl font-semibold text-neutral-400">({score100.toFixed(0)}%)</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <Badge className={`px-4 py-1.5 text-sm border-transparent ${scoreInfo.bg} ${scoreInfo.color}`}>
                {scoreInfo.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 space-y-10">

          <section className="space-y-4">
            <div className={`p-5 rounded-xl border ${scoreInfo.bg} border-white/50 shadow-sm relative overflow-hidden`}>
              <div className="flex items-start gap-4 relative z-10">
                <div className={`mt-0.5 w-10 h-10 rounded-full flex shrink-0 items-center justify-center bg-white shadow-sm ${scoreInfo.color}`}>
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-1 ${scoreInfo.color}`}>Informasi Hasil</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                    {scoreInfo.recommendation}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${scoreInfo.bg} border-white/50 shadow-sm relative overflow-hidden`}>
              <div className="flex items-start gap-4 relative z-10">
                <div className={`mt-0.5 w-10 h-10 rounded-full flex shrink-0 items-center justify-center bg-white shadow-sm ${scoreInfo.color}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${scoreInfo.color}`}>Rekomendasi</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed font-medium text-justify mb-2">
                    {scoreInfo.rekomendasi}
                  </p>
                  <p className="text-sm text-neutral-700 leading-relaxed font-medium text-justify">
                    {scoreInfo.rekomendasiDetail}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Metadata Grid */}
          <section>
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">Informasi Penilai</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 bg-white p-4 rounded-md border border-neutral-200 shadow-sm">
                <Briefcase className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Jabatan</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{data.jabatan}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-md border border-neutral-200 shadow-sm">
                <User className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Masa Jabatan</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{data.answers?._metadata_masa_jabatan || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-4 rounded-md border border-neutral-200 shadow-sm">
                <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Kecamatan</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">
                    {data.kecamatan}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">Instansi yang Dinilai</h3>
            <div className="bg-white p-4 rounded-md border border-neutral-200 shadow-sm">
              <p className="text-lg font-bold text-neutral-900">{data.inst}</p>
            </div>
          </section>

          {/* Scores Breakdown */}
          <section>
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">Rincian Penilaian per Dimensi</h3>
            <div className="space-y-6">
              {DIMENSIONS.map((dim) => {
                const total = dim.questions.reduce((sum, q) => sum + (data.answers[q.id] || 0), 0);
                const dimScore = (total / dim.questions.length).toFixed(1);

                return (
                  <div key={dim.id} className="bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm">
                    <div className="bg-neutral-50/80 px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
                      <h4 className="font-semibold text-neutral-900">{dim.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-500 font-medium">Skor: <span className="text-neutral-900 font-bold">{dimScore}</span> <span className="text-neutral-400">/ 5.0</span></span>
                        <span className="bg-neutral-900 text-white px-2.5 py-0.5 rounded text-sm font-bold">{(parseFloat(dimScore) / 5 * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {dim.questions.map((q, idx) => {
                        const val = data.answers[q.id] || 0;
                        return (
                          <div key={q.id} className="px-4 py-3 flex justify-between gap-4">
                            <p className="text-sm text-neutral-700 leading-relaxed">{idx + 1}. {q.text}</p>
                            <span className="font-semibold text-neutral-900 tabular-nums shrink-0">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </Drawer>
  );
}
