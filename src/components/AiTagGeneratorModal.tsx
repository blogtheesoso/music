import React, { useState, useEffect } from 'react';
import { AiTagGeneratorResult } from '../types';
import {
  X,
  Tag,
  Sparkles,
  Copy,
  Check,
  Search,
  Hash,
  TrendingUp,
  Lightbulb,
  Youtube,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface AiTagGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSongTitle?: string;
  initialGenre?: string;
  initialMood?: string;
  uiLanguage: 'ko' | 'en';
}

const QUICK_GENRES = [
  'Lofi Hip-Hop',
  'Chill Beats',
  'K-Pop',
  'Acoustic Pop',
  'Jazz Cafe',
  'Synthwave',
  'Ambient Chill',
  'Piano Ballad',
  'EDM / House',
  'R&B / Soul',
];

export const AiTagGeneratorModal: React.FC<AiTagGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialSongTitle = '',
  initialGenre = 'Lofi Hip Hop',
  initialMood = 'Relaxing & Cozy',
  uiLanguage,
}) => {
  const [songTitle, setSongTitle] = useState(initialSongTitle);
  const [genre, setGenre] = useState(initialGenre);
  const [mood, setMood] = useState(initialMood);
  const [targetLanguage, setTargetLanguage] = useState<'ko' | 'en'>(uiLanguage);

  const [isLoading, setIsLoading] = useState(false);
  const [tagsResult, setTagsResult] = useState<AiTagGeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync inputs when initial props change or modal opens
  useEffect(() => {
    if (isOpen) {
      setSongTitle(initialSongTitle || '');
      setGenre(initialGenre || 'Lofi Hip Hop');
      setMood(initialMood || 'Relaxing & Cozy');
    }
  }, [isOpen, initialSongTitle, initialGenre, initialMood]);

  if (!isOpen) return null;

  const handleGenerateTags = async () => {
    if (!songTitle.trim() && !genre.trim()) {
      setError(
        uiLanguage === 'ko'
          ? '곡 제목 또는 장르를 입력해주세요.'
          : 'Please enter a song title or genre.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle: songTitle.trim() || 'Custom Music Track',
          genre: genre.trim() || 'Lofi Beats',
          mood: mood.trim(),
          language: targetLanguage,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to generate tags');
      }

      setTagsResult(resData.tagsData);
    } catch (err: any) {
      console.error('Tag generation error:', err);
      setError(
        err.message ||
          (uiLanguage === 'ko'
            ? '태그 생성 중 오류가 발생했습니다.'
            : 'An error occurred while generating tags.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950/60 via-slate-900 to-rose-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg text-white">
                  {uiLanguage === 'ko'
                    ? 'AI 유튜브 SEO 태그 & 키워드 생성기'
                    : 'AI YouTube SEO Tag & Keyword Generator'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Youtube className="w-3 h-3 text-rose-500" />
                  YouTube Studio Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {uiLanguage === 'ko'
                  ? '곡 제목과 장르 기반 상위 노출용 YouTube SEO 키워드 및 태그 세트를 자동 생성합니다.'
                  : 'Generate high-ranking YouTube SEO keywords & tags based on song title & genre.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Input Form */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Song Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                  <span>{uiLanguage === 'ko' ? '곡 / 플레이리스트 제목' : 'Song / Playlist Title'}</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder={
                    uiLanguage === 'ko'
                      ? '예: 비 오는 날 창가 카페 Lofi'
                      : 'e.g. Rainy Day Cafe Lofi Beats'
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Genre Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                  <span>{uiLanguage === 'ko' ? '음악 장르 / 스타일' : 'Music Genre / Style'}</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Lofi Hip Hop, Chill, Jazz"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Quick Genre Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">
                {uiLanguage === 'ko' ? '빠른 장르 선택:' : 'Quick Genre Select:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                      genre === g
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mood Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {uiLanguage === 'ko' ? '분위기 / 무드 (선택)' : 'Mood / Vibe (Optional)'}
                </label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="e.g. Cozy, Relaxing, Melancholic, Upbeat"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {uiLanguage === 'ko' ? '타겟 검색 언어' : 'Target Keyword Language'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetLanguage('ko')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      targetLanguage === 'ko'
                        ? 'bg-purple-600/30 text-purple-200 border-purple-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    🇰🇷 한국어 + English
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetLanguage('en')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      targetLanguage === 'en'
                        ? 'bg-purple-600/30 text-purple-200 border-purple-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    🌐 Global English
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleGenerateTags}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>
                    {uiLanguage === 'ko'
                      ? 'Gemini AI 알고리즘 분석 중...'
                      : 'Analyzing YouTube SEO with Gemini AI...'}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>
                    {uiLanguage === 'ko'
                      ? '✨ AI 유튜브 SEO 태그 생성하기'
                      : '✨ Generate AI YouTube SEO Tags'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          {tagsResult && (
            <div className="space-y-5 animate-fadeIn">
              {/* Section 1: YouTube Studio Ready Copy Box */}
              <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-4 sm:p-5 space-y-3 relative shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Youtube className="w-5 h-5 text-rose-500" />
                    <span className="text-xs font-bold text-slate-100">
                      {uiLanguage === 'ko'
                        ? '📋 유튜브 스튜디오 전용 태그 (쉼표 구분 - 붙여넣기용)'
                        : '📋 YouTube Studio Ready Tags (Comma Separated)'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {tagsResult.studioFormattedString.length} / 500자
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(tagsResult.studioFormattedString, 'studioString')
                    }
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition"
                  >
                    {copiedKey === 'studioString' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{uiLanguage === 'ko' ? '태그 전체 복사' : 'Copy All Tags'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-purple-200 leading-relaxed select-all break-words">
                  {tagsResult.studioFormattedString}
                </div>
              </div>

              {/* Grid 2-col: Primary Keywords & Longtail Search Phrases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Keywords */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {uiLanguage === 'ko' ? '🎯 핵심 타겟 검색어 (Primary)' : '🎯 Primary Target Keywords'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tagsResult.primaryKeywords.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(kw, `kw-${idx}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/50 text-xs font-medium transition flex items-center space-x-1"
                        title="Click to copy keyword"
                      >
                        <span>{kw}</span>
                        {copiedKey === `kw-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-400 ml-1" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500 opacity-50 group-hover:opacity-100 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Longtail Search Phrases */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {uiLanguage === 'ko' ? '🔍 고클릭률 롱테일 검색어' : '🔍 High-CTR Longtail Phrases'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tagsResult.longtailKeywords.map((lt, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(lt, `lt-${idx}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 text-xs font-medium transition flex items-center space-x-1"
                        title="Click to copy phrase"
                      >
                        <span>{lt}</span>
                        {copiedKey === `lt-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-400 ml-1" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hashtags Section */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {uiLanguage === 'ko' ? '#️⃣ 영상 본문용 트렌딩 해시태그' : '#️⃣ Trending Video Hashtags'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(tagsResult.hashtags.join(' '), 'allHashtags')
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-1"
                  >
                    {copiedKey === 'allHashtags' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{uiLanguage === 'ko' ? '해시태그 전체 복사' : 'Copy Hashtags'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  {tagsResult.hashtags.map((ht, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300"
                    >
                      {ht}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI SEO Recommendation Tips */}
              {tagsResult.seoTips && tagsResult.seoTips.length > 0 && (
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      {uiLanguage === 'ko' ? '💡 Gemini AI의 유튜브 노출 팁' : '💡 Gemini AI YouTube Ranking Tips'}
                    </span>
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-300 leading-relaxed">
                    {tagsResult.seoTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
