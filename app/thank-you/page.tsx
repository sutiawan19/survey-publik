"use client";

import Link from "next/link";
import { CheckCircle2, Info, Sparkles, Lightbulb, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import confetti from "canvas-confetti";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function getScoreData(score: number) {
  if (score <= 20) {
    return {
      status: "Sangat Tidak Baik",
      recommendation: "Kondisi sangat jauh dari harapan dan hampir tidak mendukung pelayanan. Indikator tidak berjalan dengan baik, sering menimbulkan hambatan, keluhan, atau kegagalan dalam proses pelayanan.",
      rekomendasi: "Menyusun ulang visi, misi serta tujuan yang berbasis kualitas pelayanan publik.",
      rekomendasiDetail: "Menambahkan komitmen pelayanan prima dalam visi dan misi, menetapkan target kepuasan masyarakat sebagai indikator kinerja, serta menyusun rencana strategis yang berfokus pada peningkatan kualitas pelayanan.",
      textColor: "text-rose-600",
      bgSoft: "bg-rose-50",
      borderSoft: "border-rose-100",
      barColor: "bg-rose-500",
    };
  } else if (score <= 40) {
    return {
      status: "Tidak Baik",
      recommendation: "Kondisi masih kurang memadai dan belum mampu mendukung pelayanan secara optimal. Indikator sudah ada atau diterapkan, tetapi pelaksanaannya masih banyak kekurangan sehingga pelayanan sering terganggu.",
      rekomendasi: "Melakukan survei kepuasan masyarakat sebagai dasar perbaikan pelayanan.",
      rekomendasiDetail: "Menyebarkan kuesioner kepuasan secara berkala, menyediakan kotak saran atau kanal pengaduan digital, serta mengevaluasi hasil survei untuk memperbaiki aspek pelayanan yang masih lemah.",
      textColor: "text-amber-600",
      bgSoft: "bg-amber-50",
      borderSoft: "border-amber-100",
      barColor: "bg-amber-500",
    };
  } else if (score <= 60) {
    return {
      status: "Cukup",
      recommendation: "Kondisi cukup memadai dan mampu mendukung pelayanan pada tingkat dasar. Indikator telah berjalan sesuai standar minimum, namun masih terdapat beberapa kelemahan yang perlu diperbaiki.",
      rekomendasi: "Menguatkan kualitas SDM melalui berbagai pelatihan berbasis kompetensi.",
      rekomendasiDetail: "Menyelenggarakan pelatihan pelayanan prima (service excellence), komunikasi publik, etika pelayanan, penggunaan teknologi informasi, dan peningkatan kompetensi sesuai bidang tugas pegawai.",
      textColor: "text-violet-600",
      bgSoft: "bg-violet-50",
      borderSoft: "border-violet-100",
      barColor: "bg-violet-500",
    };
  } else if (score <= 80) {
    return {
      status: "Baik",
      recommendation: "Kondisi sudah berjalan dengan baik dan mendukung pelayanan secara efektif. Indikator terlaksana secara konsisten, hanya terdapat sedikit kendala yang tidak terlalu memengaruhi kualitas pelayanan.",
      rekomendasi: "Mengembangkan sistem serta inovasi pelayanan publik.",
      rekomendasiDetail: "Menerapkan layanan berbasis digital (e-service), sistem antrean elektronik, aplikasi pengaduan masyarakat, layanan terpadu satu pintu, serta penyederhanaan prosedur pelayanan.",
      textColor: "text-blue-600",
      bgSoft: "bg-blue-50",
      borderSoft: "border-blue-100",
      barColor: "bg-blue-500",
    };
  } else {
    return {
      status: "Sangat Baik",
      recommendation: "Kondisi sangat optimal dan menjadi pendukung utama kualitas pelayanan. Indikator berjalan secara maksimal, efektif, efisien, dan mampu memberikan dampak positif yang signifikan terhadap pelayanan.",
      rekomendasi: "Mempertahankan dan mengembangkan inovasi pelayanan publik secara berkelanjutan.",
      rekomendasiDetail: "Melakukan evaluasi inovasi secara berkala, mengembangkan fitur layanan digital baru, memberikan penghargaan kepada unit kerja berprestasi, serta menjadikan inovasi yang berhasil sebagai praktik terbaik (best practice) yang diterapkan di seluruh unit pelayanan.",
      textColor: "text-emerald-600",
      bgSoft: "bg-emerald-50",
      borderSoft: "border-emerald-100",
      barColor: "bg-emerald-500",
    };
  }
}

function parseDims(dimsString: string | null) {
  if (!dimsString) return [];
  return dimsString.split('|').map(d => {
    const [title, pct] = d.split('_');
    return { title, pct: parseInt(pct, 10) || 0 };
  });
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get("score");
  const highestDim = searchParams.get("highest");
  const lowestDim = searchParams.get("lowest");
  const dimsString = searchParams.get("dims");
  const score = scoreParam ? parseFloat(scoreParam) : null;
  const data = score !== null ? getScoreData(score) : null;
  const dimsList = parseDims(dimsString);
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!data || score === null) return;
    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const marginLeft = 20;
      let currentY = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (marginLeft * 2);

      const getHex = (status: string) => {
        switch (status) {
          case 'Sangat Tidak Baik': return { bg: '#fff1f2', text: '#e11d48', bar: '#f43f5e' };
          case 'Tidak Baik': return { bg: '#fffbeb', text: '#d97706', bar: '#f59e0b' };
          case 'Cukup': return { bg: '#f5f3ff', text: '#7c3aed', bar: '#8b5cf6' };
          case 'Baik': return { bg: '#eff6ff', text: '#2563eb', bar: '#3b82f6' };
          default: return { bg: '#ecfdf5', text: '#059669', bar: '#10b981' };
        }
      };
      
      const colors = getHex(data.status);

      // TITLE
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Hasil Penilaian Kualitas Pelayanan Publik", pageWidth/2, currentY, { align: "center" });
      currentY += 15;

      // SCORE BOX
      doc.setFillColor(colors.bg);
      doc.roundedRect(marginLeft, currentY, contentWidth, 25, 3, 3, "F");
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("SKOR PENILAIAN", marginLeft + 5, currentY + 8);
      
      doc.setFontSize(24);
      doc.setTextColor(colors.text);
      doc.text(`${score}%`, marginLeft + 5, currentY + 20);

      // STATUS BADGE
      doc.setFillColor(colors.text);
      doc.roundedRect(pageWidth - marginLeft - 45, currentY + 7, 40, 10, 5, 5, "F");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(data.status, pageWidth - marginLeft - 25, currentY + 14, { align: "center" });
      
      currentY += 35;

      // DIMENSIONS
      if (dimsList.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Skor per Dimensi", marginLeft, currentY);
        currentY += 8;

        dimsList.forEach(dim => {
          doc.setFontSize(10);
          doc.setTextColor(50, 50, 50);
          doc.setFont("helvetica", "normal");
          doc.text(dim.title, marginLeft, currentY);
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.text(`${dim.pct}%`, pageWidth - marginLeft, currentY, { align: "right" });
          
          currentY += 3;
          
          doc.setFillColor(230, 230, 230);
          doc.roundedRect(marginLeft, currentY, contentWidth, 3, 1.5, 1.5, "F");
          
          doc.setFillColor(colors.bar);
          doc.roundedRect(marginLeft, currentY, contentWidth * (dim.pct / 100), 3, 1.5, 1.5, "F");
          
          currentY += 10;
        });
        currentY += 5;
      }

      // INFORMASI HASIL
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Informasi Hasil", marginLeft, currentY);
      currentY += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      const infoLines = doc.splitTextToSize(data.recommendation, contentWidth);
      doc.text(infoLines, marginLeft, currentY);
      currentY += (infoLines.length * 5) + 10;

      // REKOMENDASI
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Rekomendasi", marginLeft, currentY);
      currentY += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const recLines = doc.splitTextToSize(data.rekomendasi, contentWidth);
      doc.text(recLines, marginLeft, currentY);
      currentY += (recLines.length * 5) + 2;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const recDetailLines = doc.splitTextToSize(data.rekomendasiDetail, contentWidth);
      doc.text(recDetailLines, marginLeft, currentY);

      doc.save(`Hasil-Penilaian-${score}%.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Gagal menghasilkan PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (score === null || isNaN(score)) {
      router.replace("/");
    }
  }, [score, router]);

  useEffect(() => {
    if (score === null || isNaN(score)) return;

    // Trigger confetti on page load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 md:p-10 text-center relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-1.5 ${data?.barColor}`}></div>
        <div className="flex justify-center mb-6 mt-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-black/5 ${data?.barColor}`}>
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">Terima Kasih!</h1>
        <p className="text-neutral-500 mb-8 leading-relaxed text-sm">
          Penilaian Anda telah berhasil dikirim. Masukan Anda akan sangat berguna untuk evaluasi dan peningkatan kualitas pelayanan publik.
        </p>

        {score !== null && data !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="w-full text-left">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Skor Penilaian
                  </span>
                  <div className={`text-5xl font-black tracking-tighter ${data.textColor}`}>
                    {score}%
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full border ${data.bgSoft} ${data.borderSoft} flex items-center justify-center`}>
                  <span className={`text-[10px] leading-none font-bold uppercase tracking-wide ${data.textColor} mt-[2px]`}>
                    {data.status}
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${data.barColor} transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.max(0, score)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] font-bold text-neutral-400">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {dimsList.length > 0 && (
                <div className="mb-6 space-y-3 border-t border-neutral-100 pt-5">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-3">
                    Skor per Dimensi
                  </span>
                  {dimsList.map((dim, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-neutral-700">{dim.title}</span>
                        <span className="font-bold text-neutral-900">{dim.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${data.barColor} opacity-80 transition-all duration-1000 ease-out`} 
                          style={{ width: `${Math.max(0, dim.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative mt-12 space-y-6">
                
                {/* Informasi Hasil Box */}
                <div className="relative">
                  <div className={`absolute -top-3 left-4 px-3 py-1 bg-white rounded-full border shadow-sm flex items-center gap-1.5 ${data.borderSoft} z-20`}>
                    <Lightbulb className={`w-3.5 h-3.5 ${data.textColor}`} />
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${data.textColor}`}>
                      Informasi Hasil
                    </span>
                  </div>
                  
                  <div className={`relative p-5 md:p-6 pt-7 rounded-2xl border shadow-sm ${data.borderSoft} ${data.bgSoft} bg-opacity-40 overflow-hidden`}>
                    <p className="text-sm font-semibold text-neutral-800 leading-relaxed text-justify relative z-10">
                      {data.recommendation}
                    </p>
                    
                    <div className={`absolute -right-6 -bottom-6 opacity-[0.04] pointer-events-none ${data.textColor}`}>
                      <CheckCircle2 className="w-36 h-36" />
                    </div>
                  </div>
                </div>

                {/* Rekomendasi Box */}
                <div className="relative">
                  <div className={`absolute -top-3 left-4 px-3 py-1 bg-white rounded-full border shadow-sm flex items-center gap-1.5 ${data.borderSoft} z-20`}>
                    <Sparkles className={`w-3.5 h-3.5 ${data.textColor}`} />
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${data.textColor}`}>
                      Rekomendasi
                    </span>
                  </div>
                  
                  <div className={`relative p-5 md:p-6 pt-7 rounded-2xl border shadow-sm ${data.borderSoft} ${data.bgSoft} bg-opacity-40 overflow-hidden`}>
                    <p className="text-sm font-semibold text-neutral-800 leading-relaxed text-justify relative z-10 mb-3">
                      {data.rekomendasi}
                    </p>
                    <p className="text-sm font-semibold text-neutral-800 leading-relaxed text-justify relative z-10">
                      {data.rekomendasiDetail}
                    </p>
                    
                    <div className={`absolute -right-6 -bottom-6 opacity-[0.04] pointer-events-none ${data.textColor}`}>
                      <CheckCircle2 className="w-36 h-36" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          {data && (
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                isDownloading
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : `${data.barColor} text-white shadow-md hover:opacity-90`
              }`}
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Menyiapkan PDF...' : 'Unduh Hasil sebagai PDF'}
            </button>
          )}

          <Link href="/">
            <Button variant="outline" className="w-full py-6 text-sm font-semibold rounded-xl border-neutral-200 hover:bg-neutral-50 text-neutral-700">
              Kembali ke Form Penilaian
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
