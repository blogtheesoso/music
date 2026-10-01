import React, { useState } from 'react';
import { CONCEPT_PRESETS, PLAYLIST_CATEGORIES } from '../data/presets';
import { ConceptPreset } from '../types';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Coffee,
  CloudRain,
  Car,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Sun,
  Heart,
  Moon,
  PenTool,
  Plane,
  Radio,
  Music,
  Disc,
  Sparkle,
  Feather,
  Film,
} from 'lucide-react';

interface ConceptSelectorProps {
  selectedPreset: ConceptPreset | null;
  onSelectPreset: (preset: ConceptPreset) => void;
  customConcept: string;
  setCustomConcept: (val: string) => void;
  uiLanguage: 'ko' | 'en';
}

export const ConceptSelector: React.FC<ConceptSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  customConcept,
  setCustomConcept,
  uiLanguage,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'CloudRain': return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'Car': return <Car className="w-5 h-5 text-rose-400" />;
      case 'Dumbbell': return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-300" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'Plane': return <Plane className="w-5 h-5 text-teal-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-orange-400" />;
      case 'Music': return <Music className="w-5 h-5 text-pink-400" />;
      case 'Disc': return <Disc className="w-5 h-5 text-violet-400" />;
      case 'Sparkling': return <Sparkle className="w-5 h-5 text-yellow-300" />;
      case 'Feather': return <Feather className="w-5 h-5 text-sky-400" />;
      case 'Film': return <Film className="w-5 h-5 text-red-500" />;
      default: return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const filteredPresets = CONCEPT_PRESETS.filter((preset) => {
    const matchesCategory = activeCategory === 'all' || preset.categoryId === activeCategory;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      preset.titleKo.toLowerCase().includes(searchLower) ||
      preset.titleEn.toLowerCase().includes(searchLower) ||
      preset.descriptionKo.toLowerCase().includes(searchLower) ||
      preset.tags.some((t) => t.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="concept-selector-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs">
              1
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              {uiLanguage === 'ko' ? '유튜브 플레이리스트 주제 / 컨셉 선택' : 'Select YouTube Playlist Concept'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8">
            {uiLanguage === 'ko'
              ? '인기 플레이리스트 주제를 선택하거나 직접 원하는 분위기를 입력하세요.'
              : 'Choose a popular playlist theme or enter your own custom mood.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            id="concept-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={uiLanguage === 'ko' ? '주제 검색 (예: lofi, 비, 드라이브)...' : 'Search concept...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {PLAYLIST_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            id={`cat-tab-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
              activeCategory === cat.id
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <span>{uiLanguage === 'ko' ? cat.nameKo : cat.nameEn}</span>
          </button>
        ))}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset?.id === preset.id && !customConcept.trim();
          return (
            <button
              key={preset.id}
              id={`preset-card-${preset.id}`}
              onClick={() => {
                onSelectPreset(preset);
                setCustomConcept('');
              }}
              className={`group text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-full relative ${
                isSelected
                  ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-500 ring-1 ring-rose-500 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-rose-400">
                  <CheckCircle2 className="w-5 h-5 fill-rose-500/20" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                    {renderIcon(preset.icon)}
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-1 pr-6">
                    {uiLanguage === 'ko' ? preset.titleKo : preset.titleEn}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {uiLanguage === 'ko' ? preset.descriptionKo : preset.descriptionEn}
                </p>
              </div>

              {/* Tags & Recommended Genre */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-medium truncate max-w-[120px]">
                  {preset.suggestedGenre}
                </span>
                <span className="text-slate-500">{preset.suggestedBpm}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Theme Input Option */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mt-2">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold text-xs mb-2">
          <PenTool className="w-4 h-4 text-amber-400" />
          <span>
            {uiLanguage === 'ko'
              ? '나만의 커스텀 플레이리스트 주제 직접 작성하기 (선택 사항)'
              : 'Or Enter Your Own Custom Playlist Theme (Optional)'}
          </span>
        </div>
        <textarea
          id="custom-concept-input"
          value={customConcept}
          onChange={(e) => setCustomConcept(e.target.value)}
          placeholder={
            uiLanguage === 'ko'
              ? '예: 서울 성수동 카페에서 과제할 때 듣는 감성 알앤비, 새벽 2시 조용한 방 안에서의 어쿠스틱 피아노...'
              : 'e.g. Chill R&B for studying at a trendy Seoul cafe, 2 AM acoustic piano for stargazing...'
          }
          rows={2}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
        />
        {customConcept.trim() && (
          <p className="text-[11px] text-amber-400 mt-1.5 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            {uiLanguage === 'ko'
              ? '커스텀 주제가 입력되었습니다. 이 주제를 바탕으로 생성됩니다.'
              : 'Custom theme active. Generation will prioritize this prompt.'}
          </p>
        )}
      </div>
    </div>
  );
};
