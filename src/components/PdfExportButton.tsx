import React, { useState, useRef } from 'react';
import { FileDown, Download } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Workout, InBodyResult, UserProfile } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function PdfExportButton({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const [workouts] = useLocalStorage<Workout[]>('sanguis_workouts', []);
  const [inbody] = useLocalStorage<InBodyResult[]>('sanguis_inbody', []);
  const [profile] = useLocalStorage<UserProfile>('sanguis_profile', { goals: '' });
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      // Un-hide the container temporarily for html2canvas
      const element = reportRef.current;
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0a0515',
        useCORS: true,
      });
      
      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let position = 0;
      let leftHeight = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Handle multi-page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      leftHeight -= pageHeight;

      while (leftHeight > 0) {
        position = leftHeight - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        leftHeight -= pageHeight;
      }

      pdf.save('Sanguis_Report.pdf');
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('Ошибка при экспорте отчета.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {variant === 'desktop' ? (
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 w-full justify-start py-3 px-6 rounded-2xl transition-all duration-300 font-sans group text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
          <FileDown className="w-6 h-6 transition-transform group-active:scale-95" />
          <span className="text-sm font-medium tracking-wide">
            {isExporting ? 'Создание...' : 'Экспорт отчета (PDF)'}
          </span>
        </button>
      ) : (
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors z-10 group text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
          <Download className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-active:scale-90" />
          <span className="text-[10px] font-medium tracking-wide transition-colors duration-300">
            {isExporting ? 'PDF...' : 'Экспорт'}
          </span>
        </button>
      )}

      {/* Hidden layout for PDF generation */}
      <div 
        ref={reportRef} 
        style={{ 
          display: 'none', 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '800px', // Fixed width for A4 proportion approximation
          backgroundColor: '#0a0515',
          color: '#f5f5f7',
          padding: '60px'
        }}
        className="font-sans"
      >
        <div className="text-center mb-10 pb-6" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <h1 className="font-display text-5xl tracking-widest uppercase mb-4" style={{ color: '#c084fc' }}>Sanguis</h1>
          <h2 className="font-serif text-2xl italic" style={{ color: '#d4d4d8' }}>Отчет о прогрессе и тренировках</h2>
          {profile.goals && (
            <div className="mt-8 p-6 rounded-xl" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
              <h3 className="font-display text-xl mb-2" style={{ color: '#d8b4fe' }}>Текущая цель:</h3>
              <p className="font-serif text-lg leading-relaxed italic" style={{ color: '#d4d4d8' }}>"{profile.goals}"</p>
            </div>
          )}
        </div>

        {inbody.length > 0 && (
          <div className="mb-10">
            <h3 className="font-display text-3xl mb-6 pb-2" style={{ color: '#ffffff', borderBottom: '1px solid #581c87' }}>Анализ состава тела (InBody)</h3>
            {inbody.slice(0, 3).map((res, i) => (
              <div key={res.id} className="mb-6 p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <p className="text-sm mb-4" style={{ color: '#c084fc' }}>{new Date(res.date).toLocaleDateString()}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {res.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-xs block mb-1" style={{ color: '#71717a' }}>{m.label}</span>
                      <span className="text-xl font-mono" style={{ color: '#ffffff' }}>{m.value}</span>
                    </div>
                  ))}
                </div>
                {res.interpretation && (
                  <p className="font-serif italic text-sm mt-2 p-4 rounded" style={{ color: '#a1a1aa', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderLeft: '2px solid #a855f7' }}>"{res.interpretation}"</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mb-10">
          <h3 className="font-display text-3xl mb-6 pb-2" style={{ color: '#ffffff', borderBottom: '1px solid #581c87' }}>История тренировок</h3>
          {workouts.length === 0 ? (
            <p className="font-serif italic" style={{ color: '#71717a' }}>Страницы пусты...</p>
          ) : (
            workouts.slice(0, 10).map((w, i) => (
              <div key={w.id} className="mb-6 p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="flex justify-between items-baseline mb-4">
                  <h4 className="font-display text-2xl" style={{ color: '#ffffff' }}>{w.title}</h4>
                  <span className="text-sm font-mono" style={{ color: '#c084fc' }}>{new Date(w.date).toLocaleDateString()}</span>
                </div>
                
                {w.exercises.length > 0 ? (
                  <div className="space-y-4">
                    {w.exercises.map((ex, exIdx) => (
                      <div key={ex.id} className="pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <p className="font-medium mb-2" style={{ color: '#d4d4d8' }}>{ex.exercise.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {ex.sets.map((s, sIdx) => (
                            <span key={s.id} className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: 'rgba(88, 28, 135, 0.2)', color: '#d8b4fe', border: '1px solid rgba(88, 28, 135, 0.5)' }}>
                              {s.weight}кг × {s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: '#71717a' }}>Нет упражнений</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-16 text-center pt-8" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <p className="font-serif text-lg italic" style={{ color: '#52525b' }}>"Продолжайте двигаться к своим целям."</p>
        </div>
      </div>
    </>
  );
}
