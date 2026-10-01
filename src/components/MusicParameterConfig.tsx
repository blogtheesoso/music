import React, { useState } from 'react';
import { GENRE_OPTIONS, MOOD_OPTIONS, VOCAL_OPTIONS, GENRE_STRUCTURE_MAP } from '../data/presets';
import { GeneratorConfig, LanguageOption, SunoVersion } from '../types';
import { Sliders, Sparkles, Mic, Music, Languages, Cpu, MessageSquareText, Layers, ChevronDown, ChevronUp, ListMusic, CheckCircle2, Zap } from 'lucide-react';

interface MusicParameterConfigProps {
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  onGenerate: () => void;
  isLoading: boolean;
  uiLanguage: 'ko' | 'en';
}

export const MusicParameterConfig: React.FC<MusicParameterConfigProps> = ({
  config,
  setConfig,
  onGenerate,
  isLoading,
  uiLanguage,
}) => {
  const [showStructures, setShowStructures] = useState<boolean>(false);

  // Ensure dropdowns always have the active value even if custom
  const genreList = Array.from(new Set([config.genre, ...GENRE_OPTIONS])).filter(Boolean);
  const moodList = Array.from(new Set([config.mood, ...MOOD_OPTIONS])).filter(Boolean);
  const vocalList = Array.from(new Set([config.vocalType, ...VOCAL_OPTIONS])).filter(Boolean);

  return (
    <div id="music-parameter-config" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs">
              2
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              {uiLanguage === 'ko' ? '음악 세부 스타일 & 세팅 세부 조정' : 'Fine-Tune Music Style & Parameters'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8">
            {uiLanguage === 'ko'
              ? '주제 선택 시 세부 스타일이 자동 맞춤 설정되며, 원하시는 대로 자유롭게 수정 가능합니다.'
              : 'Style parameters auto-configure with your selected concept and can be freely customized.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold">
            {uiLanguage === 'ko' ? '주제 맞춤 자동 세팅' : 'Auto-Configured'}
          </span>
        </div>
      </div>

      {/* Current Concept Sync Status Toast */}
      {config.concept && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              {uiLanguage === 'ko'
                ? `현재 주제: "${config.concept}" 세부 옵션 동기화됨`
                : `Synced with concept: "${config.concept}"`}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-purple-300/80">
            <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-700/50 font-mono">
              {config.genre}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-700/50 font-mono hidden md:inline">
              {config.vocalType.split(' ')[0]}
            </span>
          </div>
        </div>
      )}

      {/* Grid Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Genre Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>{uiLanguage === 'ko' ? '음악 장르 (Genre)' : 'Music Genre'}</span>
          </label>
          <select
            id="genre-select"
            value={config.genre}
            onChange={(e) => setConfig((prev) => ({ ...prev, genre: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
          >
            {genreList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Mood Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{uiLanguage === 'ko' ? '분위기 / 감성 (Mood & Vibe)' : 'Mood & Vibe'}</span>
          </label>
          <select
            id="mood-select"
            value={config.mood}
            onChange={(e) => setConfig((prev) => ({ ...prev, mood: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition"
          >
            {moodList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Vocal Style */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              <span>{uiLanguage === 'ko' ? '보컬 음색 & 느낌 (Vocal Timbre)' : 'Vocal Feeling & Timbre'}</span>
            </label>
            <span className="text-[10px] text-purple-400/90 font-medium hidden sm:inline">
              {uiLanguage === 'ko' ? '✨ 트랙별 남/여/듀엣 교차 배분' : '✨ Auto Male/Female Mix'}
            </span>
          </div>
          <select
            id="vocal-select"
            value={config.vocalType}
            onChange={(e) => setConfig((prev) => ({ ...prev, vocalType: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
          >
            {vocalList.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 leading-tight">
            {uiLanguage === 'ko'
              ? '💡 선택한 보컬 느낌을 중심으로 20곡 전체에 남/여 보컬, 듀엣, 보컬 찹이 곡 분위기에 맞춰 지루하지 않게 자동 교차됩니다.'
              : '💡 Voices are dynamically varied between male, female, duets, and chops to keep all 20 tracks fresh.'}
          </p>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{uiLanguage === 'ko' ? '가사 및 제목 언어 (Lyrics Language)' : 'Lyrics & Title Language'}</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {(
              [
                { id: 'ko', labelKo: '한국어', labelEn: 'Korean' },
                { id: 'en', labelKo: '영어', labelEn: 'English' },
                { id: 'bilingual', labelKo: '혼용(KR+EN)', labelEn: 'Bilingual' },
              ] as { id: LanguageOption; labelKo: string; labelEn: string }[]
            ).map((lang) => (
              <button
                key={lang.id}
                id={`lang-btn-${lang.id}`}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, language: lang.id }))}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition text-center ${
                  config.language === lang.id
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {uiLanguage === 'ko' ? lang.labelKo : lang.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Target Suno Version */}
        <div className="space-y-2 lg:col-span-1">
          <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>{uiLanguage === 'ko' ? '목표 Suno 버전 (Suno Target Engine)' : 'Target Suno Model'}</span>
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {(
              [
                { id: 'v5.5', labelKo: '🔥 v5.5 (최신)', labelEn: '🔥 v5.5 (New)' },
                { id: 'v4', labelKo: 'v4 (표준)', labelEn: 'v4 (Standard)' },
                { id: 'v3.5', labelKo: 'v3.5', labelEn: 'v3.5' },
              ] as { id: SunoVersion; labelKo: string; labelEn: string }[]
            ).map((ver) => (
              <button
                key={ver.id}
                id={`suno-ver-btn-${ver.id}`}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, targetSunoVersion: ver.id }))}
                className={`py-1.5 px-1.5 rounded-lg text-xs font-medium transition text-center ${
                  config.targetSunoVersion === ver.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {uiLanguage === 'ko' ? ver.labelKo : ver.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2 lg:col-span-1">
          <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-pink-400" />
            <span>
              {uiLanguage === 'ko'
                ? '추가 요청사항 (가사 주제, 특정 악기 등)'
                : 'Extra Prompts & Keywords'}
            </span>
          </label>
          <input
            id="custom-instructions-input"
            type="text"
            value={config.customInstructions}
            onChange={(e) => setConfig((prev) => ({ ...prev, customInstructions: e.target.value }))}
            placeholder={
              uiLanguage === 'ko'
                ? '예: 브릿지에 기타 솔로 넣기, 창밖의 라떼 이야기...'
                : 'e.g., Include acoustic guitar solo in bridge...'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
          />
        </div>
      </div>

      {/* Genre Lyrics Structure Rules Info Card */}
      <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowStructures(!showStructures)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <span>{uiLanguage === 'ko' ? '🎼 장르별 맞춤 가사 구조 (2~3분 완곡 분량 자동 적용)' : '🎼 Genre Lyrics Structure Rules (2-3 Min Song Duration)'}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {uiLanguage === 'ko' ? '2~3분 완곡 구조' : '2-3 Min Duration'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {uiLanguage === 'ko'
                  ? '팝, 댄스/EDM, 시티팝, 록, 어쿠스틱, Neo-Soul 정석 구조에 맞춰 Suno AI에서 2~3분 완곡이 나오도록 긴 가사가 자동 세팅됩니다.'
                  : 'Lyrics are generated with comprehensive multi-section structures to produce full 2-3 minute songs in Suno AI.'}
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-slate-200 transition">
            {showStructures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showStructures && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
            {GENRE_STRUCTURE_MAP.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 hover:border-purple-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                    <ListMusic className="w-3.5 h-3.5 text-purple-400" />
                    <span>{uiLanguage === 'ko' ? item.titleKo : item.titleEn}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {item.genreCategory}
                  </span>
                </div>

                <div className="p-2 bg-slate-950 rounded-lg font-mono text-[11px] text-purple-200 leading-relaxed border border-slate-800/80 break-words">
                  {item.structureDisplay}
                </div>

                <p className="text-[10px] text-slate-400">
                  {uiLanguage === 'ko' ? item.descriptionKo : item.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Big Action CTA Button */}
      <div className="pt-2">
        <button
          id="generate-suno-btn"
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full relative group overflow-hidden py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-purple-600 hover:from-rose-500 hover:via-amber-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-rose-950/40 border border-rose-400/30 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>
                {uiLanguage === 'ko'
                  ? 'Gemini AI가 최적 프롬프트 & 가사 생성 중...'
                  : 'Generating Suno AI Prompt & Lyrics...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200 animate-bounce" />
              <span>
                {uiLanguage === 'ko'
                  ? '🚀 Suno AI 프롬프트 + 가사 + 플레이리스트 팩 생성하기'
                  : '🚀 Generate Suno AI Prompt, Lyrics & Playlist Pack'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
