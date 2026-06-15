import React, { useState, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { InBodyResult } from "../types";
import { v4 as uuidv4 } from "uuid";
import { Beaker, ChevronRight, FileUp, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { analyzeInBody } from "../lib/gemini";

export function InBodyView() {
  const [results, setResults] = useLocalStorage<InBodyResult[]>(
    "sanguis_inbody",
    [],
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rawData, setRawData] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    mimeType: string;
    base64: string;
    name: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
      if (match) {
        setUploadedFile({
          mimeType: match[1],
          base64: match[2],
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!rawData.trim() && !uploadedFile) return;
    setIsAnalyzing(true);

    try {
      const prevResult = results.length > 0 ? results[0].rawData : null;

      const fileData = uploadedFile ? uploadedFile.base64 : undefined;
      const fileMimeType = uploadedFile ? uploadedFile.mimeType : undefined;

      const data = await analyzeInBody(
        rawData,
        prevResult,
        fileData,
        fileMimeType,
      );

      const newResult: InBodyResult = {
        id: uuidv4(),
        date: new Date().toISOString(),
        rawData: rawData || `[Файл: ${uploadedFile?.name}]`,
        interpretation: data.interpretation,
        comparison: data.comparison,
        metrics: data.metricsSummary || [],
      };

      setResults([newResult, ...results]);
      setRawData("");
      setUploadedFile(null);
    } catch (err) {
      alert("Произошла ошибка. Не удалось проанализировать.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const latestResult = results[0];

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 md:px-12 pb-[env(safe-area-inset-bottom)]">
      <div className="mb-14 border-b border-white/[0.05] pb-8 w-full">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl lg:text-6xl text-white tracking-tight"
        >
          Анализ InBody
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-zinc-400 italic mt-4 text-xl"
        >
          Анализируйте состав тела для точного контроля результатов.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-8"
        >
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6">
            <h3 className="font-display text-3xl text-white">
              Новые результаты
            </h3>

            {uploadedFile ? (
              <div className="h-48 bg-purple-900/20 border border-purple-500/30 rounded-[1.5rem] flex flex-col items-center justify-center relative shadow-inner">
                <FileUp className="w-12 h-12 text-purple-400 mb-3" />
                <p className="font-sans text-purple-200 font-medium">
                  Файл загружен
                </p>
                <p className="font-mono text-purple-400/70 text-xs mt-1">
                  {uploadedFile.name}
                </p>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <textarea
                className="w-full h-48 bg-black/50 border border-white/[0.05] rounded-[1.5rem] p-6 text-white font-mono text-base focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all resize-none shadow-inner leading-relaxed"
                placeholder="Вставьте текстовые результаты InBody сюда..."
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              {!uploadedFile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 sm:px-6 py-4 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-full transition-colors text-xs sm:text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shrink-0"
                >
                  <FileUp className="w-5 h-5 shrink-0" />
                  <span className="truncate">PDF / Фото</span>
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!rawData.trim() && !uploadedFile)}
                className="group w-full sm:flex-1 relative flex justify-center items-center gap-2 px-4 sm:px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-zinc-600 text-white rounded-full transition-all uppercase tracking-widest text-xs sm:text-sm font-semibold shadow-[0_4px_24px_rgba(147,51,234,0.3)] disabled:shadow-none min-w-0"
              >
                <span className="truncate">
                  {isAnalyzing ? "Идет анализ..." : "Провести анализ"}
                </span>
                {!isAnalyzing && (
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform shrink-0" />
                )}
              </motion.button>
            </div>
          </div>

          {results.length > 1 && (
            <div className="mt-10 px-6">
              <h3 className="font-display text-2xl text-zinc-400 mb-8">
                Архив (Прошлые анализы)
              </h3>
              <div className="flex flex-col gap-4 relative">
                <div className="absolute left-[13px] top-6 bottom-6 w-[2px] bg-white/[0.05] z-0"></div>
                {results.slice(1).map((res) => (
                  <div
                    key={res.id}
                    className="relative z-10 font-sans pl-14 py-4 group"
                  >
                    <div className="absolute left-[8px] top-[1.4rem] w-[12px] h-[12px] rounded-full bg-white/10 border-2 border-[#0a0515] group-hover:bg-purple-500 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                    <div className="text-zinc-300 font-medium text-lg">
                      {format(new Date(res.date), "dd MMMM yyyy, HH:mm")}
                    </div>
                    <div className="text-zinc-500 text-sm mt-1 uppercase tracking-wider">
                      Метрик: {res.metrics.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-8"
        >
          <AnimatePresence mode="wait">
            {!latestResult && !isAnalyzing && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border border-dashed border-white/10 bg-white/[0.01] rounded-[2.5rem] flex items-center justify-center text-zinc-500 font-serif italic p-12 text-center text-lg"
              >
                Загрузите свои результаты (Текст, PDF или Изображение) слева,
                чтобы получить подробную расшифровку.
              </motion.div>
            )}

            {latestResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2.5rem] shadow-[0_12px_48px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
              >
                <div className="bg-black/40 px-10 py-6 border-b border-white/[0.05] flex justify-between items-center text-sm font-sans">
                  <span className="text-zinc-400 uppercase tracking-widest font-semibold text-sm">
                    Последний анализ
                  </span>
                  <span className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-purple-500/20">
                    {format(new Date(latestResult.date), "dd MMM HH:mm")}
                  </span>
                </div>
                <div className="p-10 flex flex-col gap-12">
                  {latestResult.metrics && latestResult.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-6">
                      {latestResult.metrics.map((m, i) => (
                        <div
                          key={i}
                          className="bg-black/30 border border-white/[0.05] p-5 rounded-[1.5rem] flex flex-col group hover:bg-black/50 transition-colors shadow-inner"
                        >
                          <span className="text-zinc-500 text-sm uppercase tracking-wider font-semibold">
                            {m.label}
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-3 gap-2">
                            <span className="text-white font-mono text-2xl">
                              {m.value}
                            </span>
                            <span className="text-purple-400 text-xs uppercase font-bold tracking-widest px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h4 className="font-display text-3xl text-purple-100 mb-6">
                      Интерпретация
                    </h4>
                    <div className="text-zinc-300 font-serif leading-relaxed text-xl italic bg-black/20 p-8 rounded-[2rem] border border-white/[0.03] shadow-inner">
                      "{latestResult.interpretation}"
                    </div>
                  </div>

                  {latestResult.comparison && (
                    <div>
                      <h4 className="font-display text-2xl text-zinc-300 mb-5">
                        Динамика
                      </h4>
                      <div className="text-zinc-400 font-sans leading-relaxed text-sm sm:text-base bg-purple-900/10 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-purple-500/10 break-words">
                        {latestResult.comparison}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
