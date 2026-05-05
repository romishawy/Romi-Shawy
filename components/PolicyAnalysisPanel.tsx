
import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, Urgency, Category, ChatMessage } from '../types';
import { askPolicyAnalyst } from '../services/geminiService';
import MindmapView from './MindmapView';
import { 
  Target, 
  Users, 
  AlertTriangle, 
  GitMerge, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  Heart,
  MessageCircle,
  Share2,
  Play,
  Image as ImageIcon,
  TrendingUp,
  Eye,
  MessageSquarePlus,
  Send,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Bot,
  ThumbsUp,
  Smartphone,
  ExternalLink,
  ArrowLeft,
  Loader2,
  FileText,
  Download,
  Scale, // Icon for Regulations
  BookOpen, // Icon for Theory/References
  FileCheck, // Icon for Product Recommendation
  Printer, // Icon for print/generate
  Network // Added Network import
} from 'lucide-react';

// Declare jsPDF types for TypeScript since we are loading via CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

interface PolicyAnalysisPanelProps {
  item: NewsItem | null;
  allNews?: NewsItem[];
  onSelectNews?: (id: string) => void;
  onBack?: () => void;
  onViewSource?: (item: NewsItem) => void;
  isAnalyzing?: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  theme: 'red' | 'blue' | 'purple' | 'indigo' | 'teal' | 'slate';
  isOpen: boolean;
  onToggle: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  theme,
  isOpen,
  onToggle 
}) => {
  const themes = {
    red: {
      header: 'from-rose-500 to-red-600 shadow-rose-200',
      bg: 'bg-rose-50/30 border-rose-100',
      text: 'text-rose-900',
      icon: 'text-rose-100'
    },
    blue: {
      header: 'from-cyan-500 to-blue-600 shadow-cyan-200',
      bg: 'bg-cyan-50/30 border-cyan-100',
      text: 'text-cyan-900',
      icon: 'text-cyan-100'
    },
    purple: {
      header: 'from-violet-500 to-fuchsia-600 shadow-violet-200',
      bg: 'bg-violet-50/30 border-violet-100',
      text: 'text-violet-900',
      icon: 'text-violet-100'
    },
    indigo: {
      header: 'from-indigo-500 to-purple-600 shadow-indigo-200',
      bg: 'bg-indigo-50/30 border-indigo-100',
      text: 'text-indigo-900',
      icon: 'text-indigo-100'
    },
    teal: {
      header: 'from-teal-500 to-emerald-600 shadow-teal-200',
      bg: 'bg-teal-50/30 border-teal-100',
      text: 'text-teal-900',
      icon: 'text-teal-100'
    },
    slate: {
      header: 'from-slate-600 to-slate-800 shadow-slate-300',
      bg: 'bg-slate-50/50 border-slate-200',
      text: 'text-slate-800',
      icon: 'text-slate-100'
    }
  };

  const activeTheme = themes[theme];

  return (
    <div className={`rounded-2xl border transition-all duration-500 overflow-hidden mb-4 hover:shadow-lg ${isOpen ? activeTheme.bg : 'bg-white/40 border-transparent'} ${isOpen ? 'shadow-md' : ''}`}>
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-1 pr-4 transition-all duration-300 group`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${activeTheme.header} shadow-lg text-white transform transition-transform group-hover:scale-105`}>
             <Icon size={18} className="text-white" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${activeTheme.header}">
            {title}
          </h3>
        </div>
        {isOpen ? 
          <ChevronUp size={20} className="text-slate-400" /> : 
          <div className={`p-1 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 transition-all`}>
            <ChevronDown size={20} className="text-slate-400" />
          </div>
        }
      </button>
      
      {isOpen && (
        <div className={`p-5 pl-16 pt-2 animate-in slide-in-from-top-2 duration-300 text-sm leading-relaxed font-medium ${activeTheme.text}`}>
          {children}
        </div>
      )}
    </div>
  );
};

const PolicyAnalysisPanel: React.FC<PolicyAnalysisPanelProps> = ({ 
  item, 
  allNews = [], 
  onSelectNews, 
  onBack,
  onViewSource,
  isAnalyzing
}) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMindmapView, setIsMindmapView] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    problem: true,
    regulations: true, 
    theory: false, 
    stakeholders: false,
    implications: false,
    options: false,
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isChatLoading]);

  useEffect(() => {
    setFeedbackSent(false);
    setChatHistory([]);
    setOpenSections({
      problem: true,
      regulations: true,
      theory: false,
      stakeholders: false,
      implications: false,
      options: false,
    });
  }, [item?.id]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFeedback = () => {
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !item) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatQuery,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatQuery('');
    setIsChatLoading(true);

    const aiResponseText = await askPolicyAnalyst(item, userMsg.content, chatHistory);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: aiResponseText,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, aiMsg]);
    setIsChatLoading(false);
  };

  // Helper function to check page overflow and add new page
  const checkPageBreak = (doc: any, yPos: number, margin: number, pageHeight: number) => {
    if (yPos >= pageHeight - margin) {
      doc.addPage();
      return margin + 10; // Reset yPos
    }
    return yPos;
  };

  const generatePolicyProductPDF = (productType: string) => {
    if (!item || !item.analysis || !window.jspdf) {
        alert("Data analisis belum lengkap atau library PDF belum siap.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // Helper to add text safely
    const addText = (text: string | undefined | null, fontSize: number, fontStyle: string = "normal", align: string = "left") => {
        if (!text) return; // Skip if no text
        doc.setFont("times", fontStyle);
        doc.setFontSize(fontSize);
        try {
          const lines = doc.splitTextToSize(text, contentWidth);
          yPos = checkPageBreak(doc, yPos + (lines.length * (fontSize / 2)), margin, pageHeight);
          
          if (align === "center") {
              doc.text(text, pageWidth / 2, yPos, { align: "center", maxWidth: contentWidth });
          } else if (align === "justify") {
               doc.text(lines, margin, yPos, { align: "justify" });
          } else {
               doc.text(lines, margin, yPos);
          }
          yPos += (lines.length * (fontSize * 0.35 + 1)) + 2;
        } catch (err) {
          console.error("PDF Text Error:", err);
        }
    };

    // --- GENERATION LOGIC PER TYPE ---
    
    // 1. TELAAH STAF (Standard Bureaucracy Format)
    if (productType === "Telaah Staf") {
        // Header
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.text("TELAAH STAF", pageWidth / 2, yPos, { align: "center" });
        yPos += 10;
        
        // Metadata Table simulation
        doc.setFontSize(12);
        doc.setFont("times", "normal");
        const metaX = margin;
        doc.text("Kepada", metaX, yPos); doc.text(":", metaX + 25, yPos); doc.text("Menteri Agama RI / Sekjen", metaX + 30, yPos); yPos += 6;
        doc.text("Dari", metaX, yPos); doc.text(":", metaX + 25, yPos); doc.text("Kepala Biro / Direktur Terkait", metaX + 30, yPos); yPos += 6;
        doc.text("Tanggal", metaX, yPos); doc.text(":", metaX + 25, yPos); doc.text(new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }), metaX + 30, yPos); yPos += 6;
        doc.text("Lampiran", metaX, yPos); doc.text(":", metaX + 25, yPos); doc.text("-", metaX + 30, yPos); yPos += 6;
        doc.text("Perihal", metaX, yPos); doc.text(":", metaX + 25, yPos); 
        
        // Wrap Perihal
        const perihalLines = doc.splitTextToSize(item.title, contentWidth - 30);
        doc.text(perihalLines, metaX + 30, yPos);
        yPos += (perihalLines.length * 5) + 5;

        // Separator Line
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        // Content Sections
        // I. Persoalan
        addText("I.  PERSOALAN", 12, "bold");
        addText(item.analysis?.coreProblem || "Belum ada deskripsi persoalan.", 12, "normal", "justify");
        yPos += 2;

        // II. Praanggapan / Fakta
        addText("II. PRAANGGAPAN DAN FAKTA", 12, "bold");
        addText("Akar masalah yang teridentifikasi:", 12, "italic");
        addText(item.analysis?.rootCause || "-", 12, "normal", "justify");
        
        if (item.analysis.relevantRegulations && item.analysis.relevantRegulations.length > 0) {
            yPos += 2;
            addText("Regulasi Terkait:", 12, "italic");
            item.analysis.relevantRegulations.forEach(reg => {
                addText(`- ${reg}`, 12, "normal");
            });
        }
        yPos += 2;

        // III. Analisis
        addText("III. ANALISIS", 12, "bold");
        // Combine theory and implications
        let analisisText = item.analysis?.implications || "-";
        if (item.analysis?.theoreticalBasis && item.analysis.theoreticalBasis.length > 0) {
            analisisText += "\n\nDitinjau dari perspektif " + item.analysis.theoreticalBasis[0] + ".";
        }
        addText(analisisText, 12, "normal", "justify");
        yPos += 2;

        // IV. Simpulan dan Saran
        addText("IV. SIMPULAN DAN SARAN", 12, "bold");
        addText("Disarankan agar pimpinan dapat mempertimbangkan langkah-langkah sebagai berikut:", 12, "normal");
        addText(`1. Rekomendasi Utama: ${item.analysis?.recommendation || "-"}`, 12, "bold", "justify");
        
        if (item.analysis?.policyOptions) {
          item.analysis.policyOptions.forEach((opt, i) => {
              addText(`${i+2}. Opsi Alternatif: ${opt}`, 12, "normal", "justify");
          });
        }
        
        yPos += 5;
        addText("Demikian telaah staf ini dibuat untuk menjadi bahan pertimbangan pimpinan.", 12, "normal");

        // Signature Area
        yPos = checkPageBreak(doc, yPos + 40, margin, pageHeight);
        yPos += 10;
        doc.text("Pembuat Telaah,", pageWidth - margin - 40, yPos, { align: "center" });
        yPos += 25;
        doc.text("( Nama Pejabat )", pageWidth - margin - 40, yPos, { align: "center" });
    }

    // 2. MEMO KEBIJAKAN (Policy Memo) - Concise
    else if (productType === "Memo Kebijakan") {
        doc.setFont("times", "bold");
        doc.setFontSize(20);
        doc.text("MEMORANDUM", margin, yPos);
        yPos += 12;

        doc.setFontSize(11);
        doc.setFont("times", "normal");
        const labelW = 25;
        doc.text("KEPADA", margin, yPos); doc.text(":", margin + labelW, yPos); doc.text("Menteri Agama RI", margin + labelW + 5, yPos); yPos += 6;
        doc.text("DARI", margin, yPos); doc.text(":", margin + labelW, yPos); doc.text("Staf Khusus / Tenaga Ahli", margin + labelW + 5, yPos); yPos += 6;
        doc.text("TANGGAL", margin, yPos); doc.text(":", margin + labelW, yPos); doc.text(new Date().toLocaleDateString('id-ID'), margin + labelW + 5, yPos); yPos += 6;
        doc.text("HAL", margin, yPos); doc.text(":", margin + labelW, yPos); 
        const halLines = doc.splitTextToSize(item.title, contentWidth - labelW - 5);
        doc.text(halLines, margin + labelW + 5, yPos);
        yPos += (halLines.length * 5) + 8;
        
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Body
        addText("Latar Belakang Isu", 12, "bold");
        addText(item.analysis?.coreProblem || "-", 11, "normal", "justify");
        yPos += 4;

        addText("Poin Kunci & Analisis Singkat", 12, "bold");
        addText(`• Akar Masalah: ${item.analysis?.rootCause || "-"}`, 11, "normal");
        addText(`• Dampak: ${item.analysis?.implications || "-"}`, 11, "normal");
        yPos += 4;

        addText("Rekomendasi Tindakan", 12, "bold");
        addText(item.analysis?.recommendation || "-", 11, "normal", "justify");
        
        // Initials
        yPos += 15;
        doc.setFont("times", "italic");
        doc.text("Drafted by AI Policy Analyst System", margin, yPos);
    }

    // 3. POLICY BRIEF (Public/Stakeholder Oriented)
    else if (productType === "Policy Brief") {
        // Fancy Header Bar
        doc.setFillColor(44, 62, 80); // Dark Blue
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("POLICY BRIEF", margin, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Kementerian Agama Republik Indonesia", margin, 28);
        
        doc.setTextColor(0, 0, 0);
        yPos = 50;

        // Title
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        const titleLines = doc.splitTextToSize(item.title, contentWidth);
        doc.text(titleLines, margin, yPos);
        yPos += (titleLines.length * 8) + 5;

        // Executive Summary Box
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 35, 'F');
        yPos += 5;
        doc.setFontSize(11);
        doc.setFont("times", "bolditalic");
        doc.text("Ringkasan Eksekutif:", margin + 5, yPos);
        yPos += 6;
        doc.setFont("times", "italic");
        const summaryLines = doc.splitTextToSize(item.summary, contentWidth - 10);
        doc.text(summaryLines, margin + 5, yPos);
        yPos += (summaryLines.length * 5) + 15;

        // Content
        addText("Pendahuluan", 12, "bold");
        addText((item.analysis?.coreProblem || "-") + " Hal ini didasari oleh " + (item.analysis?.rootCause || "-"), 11, "normal", "justify");
        yPos += 4;

        addText("Analisis & Temuan", 12, "bold");
        addText(item.analysis?.implications || "-", 11, "normal", "justify");
        if (item.analysis?.theoreticalBasis && item.analysis.theoreticalBasis.length > 0) {
             addText(`Pendekatan teoretis: ${item.analysis.theoreticalBasis.join('; ')}`, 11, "normal");
        }
        yPos += 4;

        addText("Rekomendasi Kebijakan", 12, "bold");
        // Numbered list
        addText(`1. ${item.analysis?.recommendation || "-"}`, 11, "bold", "justify");
        if (item.analysis?.policyOptions) {
          item.analysis.policyOptions.forEach((opt, i) => {
              addText(`${i+2}. ${opt}`, 11, "normal", "justify");
          });
        }

        // Footer references
        if (item.analysis.references) {
             yPos = checkPageBreak(doc, yPos + 30, margin, pageHeight);
             yPos += 10;
             doc.setFontSize(9);
             doc.setTextColor(100);
             doc.text("Referensi:", margin, yPos);
             yPos += 5;
             item.analysis.references.forEach(ref => {
                 const refL = doc.splitTextToSize(ref, contentWidth);
                 doc.text(refL, margin, yPos);
                 yPos += (refL.length * 4);
             });
        }
    }

    // 4. POLICY PAPER (Academic Style)
    else if (productType === "Policy Paper") {
         // Title Page
         doc.setFont("times", "bold");
         doc.setFontSize(18);
         doc.text(item.title, pageWidth / 2, 80, { align: "center", maxWidth: contentWidth });
         
         doc.setFontSize(14);
         doc.text("KERTAS KEBIJAKAN (POLICY PAPER)", pageWidth / 2, 100, { align: "center" });
         
         doc.setFontSize(12);
         doc.setFont("times", "normal");
         doc.text("Disusun oleh: Sistem Analis Kebijakan AI", pageWidth / 2, 115, { align: "center" });
         doc.text(new Date().toLocaleDateString('id-ID', {year: 'numeric', month: 'long'}), pageWidth / 2, 125, { align: "center" });

         doc.addPage();
         yPos = margin;

         // Content
         addText("ABSTRAK", 12, "bold", "center");
         addText(item.summary, 11, "italic", "justify");
         yPos += 10;

         addText("1. PENDAHULUAN", 12, "bold");
         addText(item.analysis.coreProblem, 12, "normal", "justify");
         yPos += 4;

         addText("2. DESKRIPSI MASALAH", 12, "bold");
         addText(item.analysis.rootCause, 12, "normal", "justify");
         addText(`Regulasi terkait: ${item.analysis.relevantRegulations?.join(', ') || '-'}`, 12, "normal");
         yPos += 4;

         addText("3. LANDASAN TEORETIS", 12, "bold");
         if (item.analysis.theoreticalBasis) {
             item.analysis.theoreticalBasis.forEach(t => addText(t, 12, "normal", "justify"));
         }
         yPos += 4;

         addText("4. ANALISIS DAN PEMBAHASAN", 12, "bold");
         addText(item.analysis.implications, 12, "normal", "justify");
         yPos += 4;

         addText("5. REKOMENDASI", 12, "bold");
         addText(item.analysis.recommendation, 12, "normal", "justify");
         yPos += 4;

         addText("DAFTAR PUSTAKA", 12, "bold", "center");
         if (item.analysis.references) {
            item.analysis.references.forEach(ref => {
                const lines = doc.splitTextToSize(ref, contentWidth);
                doc.text(lines, margin, yPos);
                yPos += (lines.length * 5) + 2;
            });
         }
    } else {
        // Fallback generic
        generatePDF(); // Use existing simple function
        return;
    }

    doc.save(`${productType.replace(/\s/g, '_')}_${item.id}.pdf`);
  };

  const generatePDF = () => {
    if (!item || !window.jspdf) {
        alert("Modul PDF belum siap. Coba refresh halaman.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    
    // Compact Layout Settings
    const margin = 15;
    let yPos = 15;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    // -- HEADER --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(40);
    // Updated Main Header
    doc.text("Laporan Analisis Kebijakan Digital", margin, yPos + 3);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    // Updated Subtitle
    doc.text("AI Powered (Compact View)", margin, yPos + 7);
    
    doc.setDrawColor(200);
    yPos += 10;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // -- NEWS METADATA --
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    // Split title more aggressively
    const titleLines = doc.splitTextToSize(item.title, contentWidth);
    doc.text(titleLines, margin, yPos);
    yPos += (titleLines.length * 5) + 3;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    // Updated Category Label
    doc.text(`Tgl: ${item.date} | Kategori: ${item.category} | Sumber: ${item.source} | Urgensi: ${item.urgency}`, margin, yPos);
    yPos += 5;

    // Compact Summary
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(60);
    // Limit summary length for PDF to avoid overflow
    const summaryText = item.summary.length > 300 ? item.summary.substring(0, 300) + "..." : item.summary;
    const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += (summaryLines.length * 4) + 5;

    // -- ANALYSIS TABLE --
    if (item.analysis) {
        try {
          // Construct table content
          const tableBody = [
              ["Masalah Inti", item.analysis.coreProblem || "-"],
              ["Akar Masalah", item.analysis.rootCause || "-"],
              ["Dasar Hukum", item.analysis.relevantRegulations ? item.analysis.relevantRegulations.join("\n") : "-"],
              ["Stakeholder", item.analysis.stakeholders ? item.analysis.stakeholders.join(", ") : "-"],
              ["Implikasi", item.analysis.implications || "-"],
              ["Rekomendasi", item.analysis.recommendation || "-"]
          ];

          // @ts-ignore - autoTable exists via plugin
          if (doc.autoTable) {
            // @ts-ignore
            doc.autoTable({
                startY: yPos,
                head: [['Komponen', 'Detail']],
                body: tableBody,
                theme: 'grid',
                headStyles: { 
                    fillColor: [5, 150, 105], 
                    textColor: 255, 
                    fontStyle: 'bold',
                    fontSize: 9,
                    cellPadding: 2
                },
                styles: { 
                    fontSize: 8, 
                    cellPadding: 2, 
                    overflow: 'linebreak',
                    valign: 'top',
                    lineColor: [220, 220, 220]
                },
                columnStyles: { 
                    0: { cellWidth: 35, fontStyle: 'bold', textColor: 50 },
                    1: { cellWidth: 'auto' }
                },
                margin: { left: margin, right: margin }
            });

            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 5;
          } else {
            yPos += 10;
            doc.text("Peringatan: Tabel tidak dapat dirender.", margin, yPos);
          }
        } catch (err) {
          console.error("AutoTable Error:", err);
          yPos += 10;
          doc.text("Gagal membuat tabel laporan.", margin, yPos);
        }
        
        // Options List (Compact)
        if (yPos < 250 && item.analysis.policyOptions) { // Only render if enough space
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(0);
            doc.text("Opsi Kebijakan Alternatif:", margin, yPos);
            yPos += 4;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            item.analysis.policyOptions.forEach((opt, i) => {
                const optLine = doc.splitTextToSize(`${i+1}. ${opt}`, contentWidth);
                doc.text(optLine, margin, yPos);
                yPos += (optLine.length * 3.5) + 1;
            });
        }

        // Theoretical Basis & References (New Section for PDF)
        // Check if we have space, otherwise add a new page or squeeze it in
        if (yPos > 260) {
            doc.addPage();
            yPos = 15;
        }

        if (item.analysis.theoreticalBasis && item.analysis.theoreticalBasis.length > 0) {
             yPos += 3;
             doc.setFont("helvetica", "bold");
             doc.setFontSize(9);
             doc.text("Landasan Teoretis & Referensi (APA Style):", margin, yPos);
             yPos += 4;

             doc.setFont("helvetica", "normal");
             doc.setFontSize(7); // Smaller font for references
             
             // Theories
             item.analysis.theoreticalBasis.forEach((theory) => {
                 const line = doc.splitTextToSize(`• ${theory}`, contentWidth);
                 doc.text(line, margin, yPos);
                 yPos += (line.length * 3);
             });
             
             // References
             item.analysis.references?.forEach((ref) => {
                 const line = doc.splitTextToSize(`[Ref] ${ref}`, contentWidth);
                 doc.text(line, margin, yPos);
                 yPos += (line.length * 3);
             });
        }

        // Product Recommendation in PDF
        if (item.analysis.productRecommendation) {
             yPos += 5;
             if (yPos > 280) { doc.addPage(); yPos = 15; }
             
             doc.setFont("helvetica", "bold");
             doc.setFontSize(8);
             doc.setTextColor(220, 38, 38); // Red color
             doc.text(`Rekomendasi Format Produk: ${item.analysis.productRecommendation}`, margin, yPos);
        }
    }

    // -- FOOTER --
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(150);
    // Updated Footer Disclaimer
    doc.text("Semua berita & analisis dihasilkan oleh simulasi Kecerdasan Buatan (AI)", margin, pageHeight - 10);
    const pageCount = doc.internal.getNumberOfPages();
    doc.text(`Halaman ${pageCount}/${pageCount} • ${new Date().toLocaleDateString('id-ID')}`, pageWidth - margin - 40, pageHeight - 10);

    doc.save(`Analisis_Singkat_${item.id}.pdf`);
  };

  // Filter Related News: Same category or sharing keywords, EXCLUDING current item
  // AND EXCLUDING NEWS FROM NEXT YEAR (Safety Filter)
  const relatedNews = item && allNews.length > 0 
    ? allNews.filter(n => 
        n.id !== item.id && 
        !n.date.startsWith('2026') && // Strictly exclude 2026
        (n.category === item.category || n.keywords.some(k => item.keywords.includes(k)))
      ).slice(0, 3)
    : [];

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 m-4">
        <Bot size={64} className="mb-4 text-slate-300" />
        <p className="font-bold text-lg">Pilih berita untuk melihat analisis</p>
        <p className="text-sm">Klik salah satu kartu berita di sebelah kiri</p>
      </div>
    );
  }

  // Determine Media Display based on Type or Category
  const isSocial = item.category === Category.MEDIA_SOSIAL;

  return (
    // Changed from flex-col/overflow-hidden to block/overflow-y-auto to allow whole page scrolling
    <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-y-auto custom-scrollbar relative">
      
      {/* Top Back Button & Export Button */}
      <div className="sticky top-4 left-4 right-4 z-30 flex justify-between px-4 pointer-events-none">
        <button 
          onClick={onBack}
          className="pointer-events-auto bg-white/80 backdrop-blur hover:bg-white text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border border-white/20 hover:border-indigo-200 transition-all hover:scale-105"
        >
          <ArrowLeft size={14} />
          Kembali
        </button>

        <div className="flex gap-2 pointer-events-auto">
          {item.analysis && !isAnalyzing && (
            <button 
              onClick={() => setIsMindmapView(!isMindmapView)}
              className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border transition-all hover:scale-105 ${
                isMindmapView 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-900/20' 
                : 'bg-white/80 backdrop-blur text-slate-700 hover:text-indigo-600 border-white/20 hover:border-indigo-200'
              }`}
            >
              <Network size={14} />
              {isMindmapView ? 'Tampilan Laporan' : 'Tampilan Peta Pikiran'}
            </button>
          )}

          {item.analysis && !isAnalyzing && (
            <button 
              onClick={generatePDF}
              className="bg-emerald-600/90 backdrop-blur hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 border border-white/20 transition-all hover:scale-105"
            >
              <FileText size={14} />
              PDF
            </button>
          )}
        </div>
      </div>

      {/* Header Section (Scrolls with content) */}
      <div className="relative group bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-6 md:p-10 pt-16 -mt-14">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Social Media Overlay */}
        {isSocial && item.socialData && (
            <div className="absolute top-16 right-4 flex flex-col items-end gap-2 z-20">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {item.socialData.platform === 'Twitter/X' || item.socialData.platform === 'TikTok' ? <Smartphone size={14} className="text-white"/> : <ImageIcon size={14} className="text-white"/>}
                <span className="text-xs font-bold text-white">{item.socialData.platform}</span>
              </div>
              <div className="text-white/90 text-[10px] font-mono bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
                @{item.socialData.handle}
              </div>
            </div>
        )}

        <div className="relative z-10 text-white">
           <div className="flex items-center gap-3 mb-4">
             <span className="bg-indigo-500/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20 border border-white/10">
               {item.category}
             </span>
             <span className="text-indigo-200 text-xs font-medium flex items-center gap-1">
               <Eye size={12} /> Analisis Kebijakan AI
             </span>
           </div>
           <h1 className="text-xl md:text-3xl font-black leading-tight text-white drop-shadow-md">
             {item.title}
           </h1>
           <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{item.date}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="uppercase tracking-wide">{item.source}</span>
           </div>
           
           {/* Source Link in Header */}
            <div 
              onClick={() => onViewSource && onViewSource(item)}
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-indigo-200 hover:text-white cursor-pointer group/link bg-white/5 px-3 py-2 rounded-lg border border-white/5 hover:bg-white/10 transition-all"
            >
              <ExternalLink size={12} />
              <span className="truncate max-w-[300px]">{item.sourceUrl}</span>
            </div>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="p-6 md:p-8 bg-slate-50/50 min-h-[500px]">
        
        {/* Summary Block */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
           <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" /> Ringkasan Eksekutif
           </h3>
           <p className="text-slate-600 leading-relaxed text-sm md:text-[15px]">
              {item.summary}
           </p>

           {/* Social Stats Grid */}
           {isSocial && item.socialData && (
             <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
               <div className="text-center p-2 bg-pink-50 rounded-xl border border-pink-100">
                  <Heart size={18} className="mx-auto text-pink-500 mb-1" />
                  <div className="text-xs font-bold text-slate-700">{item.socialData.likes.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Likes</div>
               </div>
               <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100">
                  <MessageCircle size={18} className="mx-auto text-blue-500 mb-1" />
                  <div className="text-xs font-bold text-slate-700">{item.socialData.comments.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Comments</div>
               </div>
               <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
                  <Share2 size={18} className="mx-auto text-green-500 mb-1" />
                  <div className="text-xs font-bold text-slate-700">{item.socialData.shares.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Shares</div>
               </div>
             </div>
           )}
        </div>

        {/* LAZY LOADING STATE */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
             <Loader2 size={48} className="text-indigo-600 animate-spin" />
             <div className="text-center">
                <h3 className="text-lg font-black text-slate-800">Sedang Menganalisis...</h3>
                <p className="text-sm text-slate-500">AI sedang membedah masalah inti, mencocokkan regulasi, dan stakeholder.</p>
             </div>
          </div>
        ) : item.analysis ? (
          // ANALYSIS CONTENT
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            
            {isMindmapView ? (
              <MindmapView item={item} analysis={item.analysis} />
            ) : (
              <div className="space-y-2">
                <CollapsibleSection 
                  title="Masalah Inti & Akar Masalah" 
                  icon={AlertTriangle} 
                  theme="red"
                  isOpen={openSections['problem']}
                  onToggle={() => toggleSection('problem')}
                >
                  <div className="mb-3">
                    <span className="text-xs font-bold uppercase text-rose-500 tracking-wider block mb-1">Masalah Inti</span>
                    <p>{item.analysis.coreProblem}</p>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl border border-rose-100">
                    <span className="text-xs font-bold uppercase text-rose-500 tracking-wider block mb-1">Root Cause</span>
                    <p>{item.analysis.rootCause}</p>
                  </div>
                </CollapsibleSection>

                {/* REGULATORY MATCHING SECTION */}
                <CollapsibleSection
                  title="Dasar Hukum & Regulasi"
                  icon={Scale}
                  theme="teal"
                  isOpen={openSections['regulations']}
                  onToggle={() => toggleSection('regulations')}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} className="text-teal-600"/>
                        <span className="text-xs font-bold uppercase text-teal-700 tracking-wider">Peraturan Terkait</span>
                    </div>
                    {item.analysis.relevantRegulations && item.analysis.relevantRegulations.length > 0 ? (
                        <ul className="space-y-2">
                          {item.analysis.relevantRegulations.map((reg, i) => (
                              <li key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="mt-0.5 min-w-[20px] h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                                    {i+1}
                                </div>
                                <span className="text-sm font-medium text-slate-700">{reg}</span>
                              </li>
                          ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400 italic text-xs">Belum ada data regulasi spesifik yang ditemukan oleh AI.</p>
                    )}
                  </div>
                </CollapsibleSection>

                {/* NEW: THEORETICAL BASIS & REFERENCES */}
                <CollapsibleSection
                  title="Landasan Teoretis & Referensi"
                  icon={BookOpen}
                  theme="slate"
                  isOpen={openSections['theory']}
                  onToggle={() => toggleSection('theory')}
                >
                  <div className="space-y-4">
                      {/* Theories */}
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">Teori Kebijakan / Peraturan LAN</span>
                        <ul className="space-y-2">
                          {item.analysis.theoreticalBasis && item.analysis.theoreticalBasis.length > 0 ? (
                            item.analysis.theoreticalBasis.map((theory, i) => (
                              <li key={i} className="flex gap-2 text-sm text-slate-700">
                                <span className="text-slate-400">•</span>
                                {theory}
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-400 italic text-xs">Menunggu data teoretis...</li>
                          )}
                        </ul>
                      </div>

                      {/* APA References */}
                      <div className="pt-4 border-t border-slate-200">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">Referensi (APA Style)</span>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          {item.analysis.references && item.analysis.references.length > 0 ? (
                            <ul className="space-y-2">
                              {item.analysis.references.map((ref, i) => (
                                  <li key={i} className="text-xs text-slate-600 font-mono pl-4 -indent-4">
                                    {ref}
                                  </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Menunggu daftar pustaka...</span>
                          )}
                        </div>
                      </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection 
                  title="Stakeholder Terkait" 
                  icon={Users} 
                  theme="blue"
                  isOpen={openSections['stakeholders']}
                  onToggle={() => toggleSection('stakeholders')}
                >
                  <div className="flex flex-wrap gap-2">
                    {item.analysis.stakeholders.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white rounded-lg border border-cyan-200 text-cyan-700 text-xs font-bold shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection 
                  title="Implikasi Kebijakan" 
                  icon={GitMerge} 
                  theme="purple"
                  isOpen={openSections['implications']}
                  onToggle={() => toggleSection('implications')}
                >
                  <p>{item.analysis.implications}</p>
                </CollapsibleSection>

                <CollapsibleSection 
                  title="Opsi & Rekomendasi" 
                  icon={Target} 
                  theme="indigo"
                  isOpen={openSections['options']}
                  onToggle={() => toggleSection('options')}
                >
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider block mb-2">Opsi Alternatif</span>
                      <ul className="space-y-2">
                        {item.analysis.policyOptions.map((opt, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-indigo-400">•</span>
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Rekomendasi Utama</span>
                      </div>
                      <p className="text-emerald-900 font-medium">{item.analysis.recommendation}</p>
                    </div>
                    
                    {/* Sumber Link below recommendation */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Sumber Asli</div>
                      <button 
                        onClick={() => onViewSource && onViewSource(item)}
                        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 w-full justify-center"
                      >
                        <ExternalLink size={12} />
                        Buka Sumber: {item.source}
                      </button>
                    </div>

                    {/* Feedback Form */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      {!feedbackSent ? (
                        <button 
                            onClick={handleFeedback}
                            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <ThumbsUp size={12} />
                            Beri Masukan Analisis
                        </button>
                      ) : (
                        <div className="text-center text-xs font-bold text-emerald-600 animate-in fade-in">
                            Terima kasih atas masukan Anda!
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* PRODUCT RECOMMENDATION SECTION (NEW) */}
            <div className="mt-6 bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-700 animate-in slide-in-from-bottom-6">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-white/10 rounded-xl text-white">
                      <FileCheck size={24} />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Tindak Lanjut Produk Kebijakan</h3>
                      <p className="text-slate-300 text-xs leading-relaxed mb-3">
                         Berdasarkan kompleksitas isu, analisis ini sebaiknya dikemas dalam bentuk:
                      </p>
                      
                      {item.analysis.productRecommendation ? (
                          <button 
                            onClick={() => generatePolicyProductPDF(item.analysis!.productRecommendation)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md mb-3 hover:scale-105 transition-transform group"
                          >
                             <Printer size={14} className="text-white"/>
                             <span className="text-white font-black text-sm uppercase tracking-wider">{item.analysis.productRecommendation}</span>
                          </button>
                      ) : (
                          <div className="text-slate-400 text-xs italic">Menunggu rekomendasi...</div>
                      )}

                      <div className="pt-3 border-t border-white/10 mt-1">
                         <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Ekspor Opsi Lainnya:</span>
                         <div className="flex flex-wrap gap-2">
                             {["Telaah Staf", "Memo Kebijakan", "Policy Brief", "Policy Paper"]
                                .filter(p => p !== item.analysis?.productRecommendation)
                                .map((opt, i) => (
                                 <button 
                                    key={i} 
                                    onClick={() => generatePolicyProductPDF(opt)}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-slate-400 hover:text-white border border-white/5 transition-colors"
                                 >
                                    {opt}
                                 </button>
                             ))}
                         </div>
                      </div>
                   </div>
                </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <p>Data analisis tidak tersedia.</p>
          </div>
        )}

        {/* CHAT SECTION */}
        <div className="mt-8 border-t border-slate-200 pt-6">
           <div className="flex items-center gap-2 mb-4 text-slate-800">
              <Bot size={20} className="text-indigo-600" />
              <h3 className="font-bold text-base">Tanya Analis AI</h3>
           </div>
           
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                 {chatHistory.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-10">
                       <MessageSquarePlus size={32} className="mx-auto mb-2 opacity-50" />
                       <p>Ajukan pertanyaan spesifik mengenai berita ini.</p>
                       <p className="text-xs mt-1">Contoh: "Apa dampak jangka panjangnya?"</p>
                    </div>
                 )}
                 {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                       }`}>
                          {msg.content}
                       </div>
                    </div>
                 ))}
                 {isChatLoading && (
                    <div className="flex justify-start">
                       <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm">
                          <Loader2 size={16} className="animate-spin text-indigo-600" />
                       </div>
                    </div>
                 )}
                 <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                 <input 
                    type="text" 
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="Ketik pertanyaan analisis..."
                    className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                    disabled={isChatLoading}
                 />
                 <button 
                    type="submit" 
                    disabled={!chatQuery.trim() || isChatLoading}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                 >
                    <Send size={18} />
                 </button>
              </form>
           </div>
        </div>

        {/* RELATED NEWS */}
        {relatedNews.length > 0 && (
           <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Berita Terkait</h4>
              <div className="grid gap-3">
                 {relatedNews.map((relItem) => (
                    <div 
                       key={relItem.id}
                       onClick={() => onSelectNews && onSelectNews(relItem.id)}
                       className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex gap-3 items-start group"
                    >
                       <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent(relItem.title)}?width=100&height=100&nologo=true`} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                       </div>
                       <div>
                          <h5 className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 line-clamp-2 mb-1">
                             {relItem.title}
                          </h5>
                          <span className="text-[10px] text-slate-400">{relItem.date}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Bottom Back Button */}
        <div className="mt-10 text-center">
           <button 
              onClick={onBack}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
           >
              <ArrowLeft size={12} />
              Kembali ke Halaman Utama
           </button>
        </div>

        {/* AI Disclaimer Footer */}
        <div className="mt-6 text-center pb-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] text-slate-400 font-medium">
              <Bot size={12} />
              <span>Semua berita & analisis dihasilkan oleh simulasi Kecerdasan Buatan (AI)</span>
           </div>
        </div>
      
      </div>
    </div>
  );
};

export default PolicyAnalysisPanel;
