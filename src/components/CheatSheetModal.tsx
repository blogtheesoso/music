import React from 'react';
import { SUNO_META_TAGS } from '../data/presets';
import { X, BookOpen, Lightbulb, Zap, AlertTriangle, Copy } from 'lucide-react';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiLanguage: 'ko' | 'en';
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({
  isOpen,
  onClose,
  uiLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {uiLanguage === 'ko' ? 'Suno AI v5.5 프롬프트 & 가사 구조 태그 완벽 가이드' : 'Suno AI v5.5 Prompt & Meta Tag Master Guide'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {uiLanguage === 'ko'
                ? 'Suno v5.5, v4 초고음질 엔진에서 완성도 높은 곡을 얻기 위한 핵심 태그 및 치트시트입니다.'
                : 'Essential tags and tips for mastering Suno AI v5.5 music generation.'}
            </p>
          </div>
        </div>

        {/* Essential Tips Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Suno v5.5 스타일 프롬프트 (Style of Music) 팁</span>
            </div>
            <ul className="text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Suno v5.5는 음질 정교도가 대폭 향상되어 악기 세부 명칭(예: rhodes piano, vinyl crackle, 80 bpm)을 잘 이해합니다.</li>
              <li>120~140자 이내의 쉼표 구분 태그(Comma-separated) 형태가 가장 효과적입니다.</li>
              <li>문장보다는 'lofi hip hop, warm acoustic, female vocal hum'처럼 키워드 형태로 구성하세요.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>가사 구조 태그 (Meta Tags) & 유튜브 20곡 연동</span>
            </div>
            <ul className="text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li><code className="text-cyan-300">[Verse 1]</code>, <code className="text-cyan-300">[Chorus]</code> 대괄호 태그로 곡의 흐름과 빌드업을 지시할 수 있습니다.</li>
              <li>간주 구간에는 <code className="text-cyan-300">[Guitar Solo]</code> 또는 <code className="text-cyan-300">[Drop]</code>을 적고 가사를 비워두세요.</li>
              <li>유튜브 플리 영상용 20곡 트랙리스트 기능을 통해 20곡 연속 음원을 완성할 수 있습니다.</li>
            </ul>
          </div>
        </div>

        {/* Meta Tags Reference Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <span>대괄호 구조 태그 사전 (Suno Meta Tags Cheat Sheet)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUNO_META_TAGS.map((tag) => (
              <div
                key={tag.tag}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {tag.tag}
                    </span>
                    <span className="text-slate-200 font-medium">
                      {uiLanguage === 'ko' ? tag.labelKo : tag.labelEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {uiLanguage === 'ko' ? tag.descriptionKo : tag.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-2 text-right border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
