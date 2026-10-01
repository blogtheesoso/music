import React, { useState } from 'react';
import { GeneratedSunoResult, SunoMetaTag } from '../types';
import { SUNO_META_TAGS } from '../data/presets';
import {
  Copy,
  Check,
  Bookmark,
  Play,
  Square,
  Sparkles,
  Youtube,
  ImageIcon,
  ListMusic,
  Info,
  Wand2,
  FileText,
  Volume2,
  ChevronDown,
  ChevronUp,
  Video,
  Search,
  Tag,
  TrendingUp,
  Download,
  Loader2,
  Maximize2,
} from 'lucide-react';

interface PromptOutputStudioProps {
  result: GeneratedSunoResult;
  onUpdateLyrics: (newLyrics: string) => void;
  onUpdateTrackLyrics?: (trackNumber: number, newLyrics: string) => void;
  onLyricsAction: (action: string) => void;
  isActionLoading: boolean;
  onSaveToCollection: (result: GeneratedSunoResult) => void;
  isSaved: boolean;
  uiLanguage: 'ko' | 'en';
  onOpenVideoStudio?: () => void;
  onOpenTagGenerator?: () => void;
}

export const PromptOutputStudio: React.FC<PromptOutputStudioProps> = ({
  result,
  onUpdateLyrics,
  onUpdateTrackLyrics,
  onLyricsAction,
  isActionLoading,
  onSaveToCollection,
  isSaved,
  uiLanguage,
  onOpenVideoStudio,
  onOpenTagGenerator,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suno' | 'lyrics' | 'playlist'>('suno');
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);
  const [expandedTracks, setExpandedTracks] = useState<Record<number, boolean>>({});
  const [trackActionLoading, setTrackActionLoading] = useState<Record<number, boolean>>({});

  const handleTrackLyricsAction = async (
    trackNumber: number,
    currentTrackLyrics: string,
    styleTags: string,
    action: string
  ) => {
    setTrackActionLoading((prev) => ({ ...prev, [trackNumber]: true }));
    try {
      const response = await fetch('/api/generate-lyrics-variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLyrics: currentTrackLyrics,
          stylePrompt: styleTags,
          action,
          language: result.languageUsed,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.updatedLyrics && onUpdateTrackLyrics) {
        onUpdateTrackLyrics(trackNumber, resData.updatedLyrics);
      }
    } catch (err) {
      console.error('Error expanding track lyrics:', err);
    } finally {
      setTrackActionLoading((prev) => ({ ...prev, [trackNumber]: false }));
    }
  };

  const toggleTrackExpand = (trackNum: number) => {
    setExpandedTracks((prev) => ({ ...prev, [trackNum]: !prev[trackNum] }));
  };

  const toggleExpandAllTracks = () => {
    const allExpanded = result.playlistConcept.tracklist.every((t) => expandedTracks[t.trackNumber]);
    if (allExpanded) {
      setExpandedTracks({});
    } else {
      const next: Record<number, boolean> = {};
      result.playlistConcept.tracklist.forEach((t) => {
        next[t.trackNumber] = true;
      });
      setExpandedTracks(next);
    }
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInsertMetaTag = (tag: string) => {
    const textarea = document.getElementById('lyrics-editor-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      onUpdateLyrics(result.lyrics + `\n\n${tag}\n`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = result.lyrics;
    const inserted = current.substring(0, start) + `${tag}\n` + current.substring(end);
    onUpdateLyrics(inserted);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 1, start + tag.length + 1);
    }, 50);
  };

  const toggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert(uiLanguage === 'ko' ? '현재 브라우저에서 음성 합성을 지원하지 않습니다.' : 'Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    const textToRead = result.lyrics.replace(/\[.*?\]/g, ''); // strip meta tags for reading
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = result.languageUsed === 'en' ? 'en-US' : 'ko-KR';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingTTS(true);
  };

  // Download export handlers (.TXT & .JSON)
  const downloadAsTxt = () => {
    let text = `================================================
🎵 [SunoCraft Studio] Song & Lyrics Export
================================================
Song Title: ${result.songTitle} ${result.englishTitle ? `(${result.englishTitle})` : ''}
Genre: ${result.genreUsed}
Mood: ${result.moodUsed}
Concept: ${result.conceptUsed}
Created At: ${result.createdAt ? new Date(result.createdAt).toLocaleString() : new Date().toLocaleString()}

------------------------------------------------
🎹 Suno "Style of Music" Prompt:
${result.stylePrompt}

------------------------------------------------
📝 Lyrics & Performance Structure Meta:
${result.lyrics}
`;

    if (result.playlistConcept) {
      text += `\n------------------------------------------------
🎧 YouTube Playlist Concept Pack
Playlist Title: ${result.playlistConcept.playlistTitle}
Description: ${result.playlistConcept.playlistDescription}

Thumbnail Art Prompt:
${result.playlistConcept.thumbnailPrompt || 'N/A'}
`;

      if (result.playlistConcept.seoPack) {
        const seo = result.playlistConcept.seoPack;
        text += `\nYouTube SEO Title Options:
1. High CTR: ${seo.titleOptions?.clickbaitHook || ''}
2. Keyword Rich: ${seo.titleOptions?.keywordRich || ''}
3. Minimal Aesthetic: ${seo.titleOptions?.aestheticMinimal || ''}

Search Tags:
${seo.searchTags ? seo.searchTags.join(', ') : ''}

Description Hook:
${seo.descriptionHook || ''}
`;
      }

      if (result.playlistConcept.tracklist && result.playlistConcept.tracklist.length > 0) {
        text += `\nTracklist (${result.playlistConcept.tracklist.length} Tracks):\n`;
        result.playlistConcept.tracklist.forEach((track) => {
          text += `\n[Track ${track.trackNumber}] ${track.title}
Style Tags: ${track.styleTags}
Lyrics:
${track.lyrics}
`;
        });
      }
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = (result.songTitle || 'suno_song').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    a.download = `${safeFilename}_details.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsJson = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = (result.songTitle || 'suno_song').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    a.download = `${safeFilename}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const styleCharCount = result.stylePrompt.length;
  const isCharWarning = styleCharCount > 120;

  return (
    <div id="prompt-output-studio" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Top Header & Save CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              3
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>{result.songTitle}</span>
              {result.englishTitle && (
                <span className="text-xs font-normal text-slate-400">
                  ({result.englishTitle})
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8">
            {uiLanguage === 'ko'
              ? '생성된 Suno 프롬프트 및 가사를 아래 탭에서 확인하고 파일로 내보내거나 저장하세요!'
              : 'Review your Suno AI prompt & lyrics, edit tags, or export to file!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0">
          {/* Download TXT Button */}
          <button
            id="export-txt-btn"
            onClick={downloadAsTxt}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            title={uiLanguage === 'ko' ? '곡 상세정보 및 가사 TXT 다운로드' : 'Download details as .TXT'}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>.TXT 내보내기</span>
          </button>

          {/* Download JSON Button */}
          <button
            id="export-json-btn"
            onClick={downloadAsJson}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            title={uiLanguage === 'ko' ? '구조화된 전체 데이터 JSON 다운로드' : 'Download data as .JSON'}
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>.JSON 내보내기</span>
          </button>

          <button
            id="save-to-collection-btn"
            onClick={() => onSaveToCollection(result)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              isSaved
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-950/30'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-400 text-emerald-400' : 'fill-white/20'}`} />
            <span>
              {isSaved
                ? uiLanguage === 'ko' ? '보관함 저장됨' : 'Saved'
                : uiLanguage === 'ko' ? '보관함 저장' : 'Save'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
        <button
          id="tab-suno-prompt"
          onClick={() => setActiveTab('suno')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'suno'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Suno 스타일 프롬프트</span>
        </button>

        <button
          id="tab-suno-lyrics"
          onClick={() => setActiveTab('lyrics')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'lyrics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>가사 편집기 & 구조 태그</span>
        </button>

        <button
          id="tab-youtube-pack"
          onClick={() => setActiveTab('playlist')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'playlist'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Youtube className="w-4 h-4 text-rose-400" />
          <span>유튜브 플레이리스트 팩</span>
        </button>
      </div>

      {/* TAB 1: Suno Music Style Prompt & Title */}
      {activeTab === 'suno' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Style Prompt Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Suno "Style of Music" 필드용
                </span>
                <span className={`text-xs font-mono font-semibold ${isCharWarning ? 'text-rose-400' : 'text-slate-400'}`}>
                  {styleCharCount} / 120자 {isCharWarning && '(Suno 권장 길이 초과)'}
                </span>
              </div>

              <button
                id="copy-style-prompt-btn"
                onClick={() => copyToClipboard(result.stylePrompt, 'stylePrompt')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition active:scale-95"
              >
                {copiedField === 'stylePrompt' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>프롬프트 복사</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt String Display */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm text-amber-200 leading-relaxed break-words select-all">
              {result.stylePrompt}
            </div>

            {/* Explanation Note */}
            <div className="flex items-start space-x-2 text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>{result.styleExplanation}</p>
            </div>
          </div>

          {/* Title Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Suno "Title" 필드용 (제목)
              </span>
              <button
                id="copy-song-title-btn"
                onClick={() => copyToClipboard(result.songTitle, 'songTitle')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                {copiedField === 'songTitle' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>제목 복사</span>
              </button>
            </div>
            <div className="text-base font-bold text-slate-100 bg-slate-900 p-3 rounded-xl border border-slate-800">
              {result.songTitle}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Lyrics Editor & Quick Meta Tag Insertion */}
      {activeTab === 'lyrics' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Toolbar for Quick Meta Tag Insertion */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  {uiLanguage === 'ko' ? 'Suno 구조 태그 바로 삽입하기' : 'Insert Suno Structural Tags'}
                </span>
              </div>

              {/* Speech Preview Button */}
              <button
                id="tts-preview-btn"
                onClick={toggleTTS}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition border ${
                  isPlayingTTS
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {isPlayingTTS ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-rose-400" />
                    <span>음성 정지</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>가사 음성 미리듣기</span>
                  </>
                )}
              </button>
            </div>

            {/* Tags Badges */}
            <div className="flex flex-wrap gap-1.5">
              {SUNO_META_TAGS.map((tag: SunoMetaTag) => (
                <button
                  key={tag.tag}
                  id={`insert-tag-${tag.tag.replace(/[^a-zA-Z0-9]/g, '')}`}
                  onClick={() => handleInsertMetaTag(tag.tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono transition"
                  title={uiLanguage === 'ko' ? tag.descriptionKo : tag.descriptionEn}
                >
                  + {tag.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Lyrics Editor Textarea */}
          <div className="relative">
            <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
              <button
                id="copy-lyrics-btn"
                onClick={() => copyToClipboard(result.lyrics, 'lyrics')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition"
              >
                {copiedField === 'lyrics' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>가사 전체 복사</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="lyrics-editor-textarea"
              value={result.lyrics}
              onChange={(e) => onUpdateLyrics(e.target.value)}
              rows={16}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pt-12 text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-cyan-500 transition resize-y"
            />
          </div>

          {/* AI Lyrics Assistant Quick Refinement Actions */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-300">
              {uiLanguage === 'ko' ? 'AI 가사 보완 및 추가 작업' : 'AI Lyrics Actions'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                id="action-expand-full-btn"
                disabled={isActionLoading}
                onClick={() => onLyricsAction('expand-full')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold border border-purple-500/40 transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>✨ 가사 전체 길게 확장 (Full Song)</span>
              </button>
              <button
                id="action-add-bridge-btn"
                disabled={isActionLoading}
                onClick={() => onLyricsAction('add-bridge')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
              >
                + 감성 브릿지 & 기타솔로 파트 추가
              </button>
              <button
                id="action-translate-btn"
                disabled={isActionLoading}
                onClick={() => onLyricsAction('translate')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
              >
                🌐 가사 번역 / 언어 변환
              </button>
              <button
                id="action-extend-outro-btn"
                disabled={isActionLoading}
                onClick={() => onLyricsAction('extend-outro')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
              >
                🎵 아웃트로(엔딩) 여운 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: YouTube Playlist Pack */}
      {activeTab === 'playlist' && result.playlistConcept && (
        <div className="space-y-5 animate-fadeIn">
          {/* YouTube SEO Algorithm Optimization Pack */}
          <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <span>{uiLanguage === 'ko' ? '📈 유튜브 알고리즘 SEO 최적화 패크' : 'YouTube Algorithm SEO Optimization Pack'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      High CTR & Search Rank
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {uiLanguage === 'ko'
                      ? '노출수와 클릭률(CTR)을 극대화하는 3가지 제목 공식 및 유튜브 스튜디오 전용 태그 모음입니다.'
                      : '3 high-CTR title formulas & YouTube Studio tags for maximum search discoverability.'}
                  </p>
                </div>
              </div>

              {onOpenTagGenerator && (
                <button
                  id="launch-tag-generator-btn"
                  onClick={onOpenTagGenerator}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5 self-start sm:self-center"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-300" />
                  <span>{uiLanguage === 'ko' ? '✨ AI SEO 태그 생성기' : 'AI Tag Generator'}</span>
                </button>
              )}
            </div>

            {/* 3 SEO Title Formulas */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>{uiLanguage === 'ko' ? 'SEO 제목 3가지 추천 공식 (클릭하여 복사)' : '3 SEO Title Formulas (Click to copy)'}</span>
              </span>

              <div className="grid grid-cols-1 gap-2">
                {/* 1. Clickbait / Emotional Hook */}
                <div className="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl flex items-center justify-between gap-3 transition group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {uiLanguage === 'ko' ? '🔥 높은 클릭률 (감성 훅)' : '🔥 High CTR Hook'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {result.playlistConcept.seoPack?.titleOptions.clickbaitHook || result.playlistConcept.playlistTitle}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        result.playlistConcept.seoPack?.titleOptions.clickbaitHook || result.playlistConcept.playlistTitle,
                        'titleHook'
                      )
                    }
                    className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition flex-shrink-0"
                    title="Copy Title"
                  >
                    {copiedField === 'titleHook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* 2. Keyword Rich Search Formula */}
                <div className="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl flex items-center justify-between gap-3 transition group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {uiLanguage === 'ko' ? '🔍 상위 노출 검색어 강화' : '🔍 Keyword Search Rich'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {result.playlistConcept.seoPack?.titleOptions.keywordRich || `${result.playlistConcept.playlistTitle} | ${result.genreUsed} Playlist`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        result.playlistConcept.seoPack?.titleOptions.keywordRich || `${result.playlistConcept.playlistTitle} | ${result.genreUsed} Playlist`,
                        'titleKey'
                      )
                    }
                    className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition flex-shrink-0"
                    title="Copy Title"
                  >
                    {copiedField === 'titleKey' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* 3. Aesthetic Minimal Formula */}
                <div className="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl flex items-center justify-between gap-3 transition group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {uiLanguage === 'ko' ? '✨ 트렌디 감성 썸네일형' : '✨ Aesthetic Minimal'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {result.playlistConcept.seoPack?.titleOptions.aestheticMinimal || `${result.conceptUsed.toLowerCase()} [playlist] ☕`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        result.playlistConcept.seoPack?.titleOptions.aestheticMinimal || `${result.conceptUsed.toLowerCase()} [playlist] ☕`,
                        'titleAes'
                      )
                    }
                    className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition flex-shrink-0"
                    title="Copy Title"
                  >
                    {copiedField === 'titleAes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Tags section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{uiLanguage === 'ko' ? '유튜브 스튜디오 태그 모음 (Comma separated)' : 'YouTube Search Tags'}</span>
                </span>

                <button
                  onClick={() => {
                    const tags = result.playlistConcept.seoPack?.searchTags || [
                      result.genreUsed,
                      result.moodUsed,
                      'lofi',
                      'playlist',
                      'suno ai',
                      '공부할때듣는음악',
                      '작업곡'
                    ];
                    copyToClipboard(tags.join(', '), 'allTags');
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition flex items-center space-x-1"
                >
                  {copiedField === 'allTags' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>태그 전체 복사완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{uiLanguage === 'ko' ? '태그 전체 복사' : 'Copy All Tags'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                {(
                  result.playlistConcept.seoPack?.searchTags || [
                    result.genreUsed,
                    result.moodUsed,
                    'lofi hip hop',
                    'playlist 2026',
                    'suno ai music',
                    '공부할때듣는음악',
                    '작업곡 모음',
                    '카페 음악',
                    '힐링 플리'
                  ]
                ).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* YouTube Video Title & Description */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Youtube className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-bold text-slate-200">
                  유튜브 플레이리스트 영상 제목 & 설명
                </span>
              </div>
              <button
                id="copy-yt-title-btn"
                onClick={() =>
                  copyToClipboard(
                    `${result.playlistConcept.playlistTitle}\n\n${result.playlistConcept.playlistDescription}`,
                    'ytPack'
                  )
                }
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition"
              >
                {copiedField === 'ytPack' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>제목 + 설명 복사</span>
              </button>
            </div>

            <div className="text-sm font-bold text-rose-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
              {result.playlistConcept.playlistTitle}
            </div>

            <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
              {result.playlistConcept.playlistDescription}
            </pre>
          </div>

          {/* AI Thumbnail Prompt */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  유튜브 썸네일용 AI 이미지 프롬프트 (Midjourney / DALL-E)
                </span>
              </div>
              <button
                id="copy-thumb-prompt-btn"
                onClick={() => copyToClipboard(result.playlistConcept.thumbnailPrompt, 'thumbPrompt')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition"
              >
                {copiedField === 'thumbPrompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>썸네일 프롬프트 복사</span>
              </button>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-amber-200 font-mono">
              {result.playlistConcept.thumbnailPrompt}
            </div>
          </div>

          {/* 20 Track Playlist Tracklist Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ListMusic className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <span>{uiLanguage === 'ko' ? '유튜브 플리용 20곡 연동 프롬프트 & 가사 패크' : '20-Track Playlist Prompts & Full Lyrics'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {result.playlistConcept.tracklist.length} Songs with Full Lyrics
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {uiLanguage === 'ko'
                      ? 'Suno v5.5에서 바로 생성할 수 있는 20곡 전체의 개별 타이틀, 스타일 태그, 그리고 맞춤 가사 세트입니다.'
                      : '20 unique songs with individual Suno style prompts & structured full lyrics.'}
                  </p>
                </div>
              </div>

              {/* Batch Action Copy Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {onOpenVideoStudio && (
                  <button
                    id="open-video-studio-from-tracklist-btn"
                    onClick={onOpenVideoStudio}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-300" />
                    <span>{uiLanguage === 'ko' ? '🎬 음원 업로드 & 영상/타임스탬프 제작' : 'Video & Timestamps Studio'}</span>
                  </button>
                )}

                <button
                  id="toggle-expand-all-btn"
                  onClick={toggleExpandAllTracks}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
                >
                  {result.playlistConcept.tracklist.every((t) => expandedTracks[t.trackNumber]) ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>{uiLanguage === 'ko' ? '가사 모두 접기' : 'Collapse All Lyrics'}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>{uiLanguage === 'ko' ? '20곡 가사 모두 펼치기' : 'Expand All 20 Lyrics'}</span>
                    </>
                  )}
                </button>

                <button
                  id="copy-all-timestamps-btn"
                  onClick={() => {
                    const text = result.playlistConcept.tracklist
                      .map((t, idx) => `${String(idx + 1).padStart(2, '0')}. ${t.title}`)
                      .join('\n');
                    copyToClipboard(text, 'allTimestamps');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/40 transition flex items-center space-x-1.5"
                >
                  {copiedField === 'allTimestamps' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">트랙명 복사완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{uiLanguage === 'ko' ? '20곡 트랙명 복사' : 'Copy All Titles'}</span>
                    </>
                  )}
                </button>

                <button
                  id="copy-all-suno-prompts-btn"
                  onClick={() => {
                    const text = result.playlistConcept.tracklist
                      .map((t) => `[Track ${t.trackNumber}] ${t.title}\nSuno Style: ${t.styleTags}`)
                      .join('\n\n');
                    copyToClipboard(text, 'allPrompts');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
                >
                  {copiedField === 'allPrompts' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">태그 복사완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{uiLanguage === 'ko' ? '20곡 스타일 태그 복사' : 'Copy Style Tags'}</span>
                    </>
                  )}
                </button>

                <button
                  id="copy-all-full-songs-btn"
                  onClick={() => {
                    const text = result.playlistConcept.tracklist
                      .map((t) => `=== Track ${String(t.trackNumber).padStart(2, '0')}. ${t.title} ===\n[Style Prompt]\n${t.styleTags}\n\n[Lyrics]\n${t.lyrics || result.lyrics}\n`)
                      .join('\n------------------------------\n\n');
                    copyToClipboard(text, 'allFullSongs');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                >
                  {copiedField === 'allFullSongs' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>20곡 전체 가사&프롬프트 패크 복사완료!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{uiLanguage === 'ko' ? '🔥 20곡 전체 (가사+태그) 복사' : 'Copy All 20 Songs Pack'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tracklist List View with Accordion/Expandable Lyrics */}
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {result.playlistConcept.tracklist.map((track) => {
                const isExpanded = !!expandedTracks[track.trackNumber];
                const trackLyrics = track.lyrics || result.lyrics;

                return (
                  <div
                    key={track.trackNumber}
                    className={`rounded-xl bg-slate-900/90 border transition ${
                      isExpanded ? 'border-purple-500/50 shadow-lg shadow-purple-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Track Header */}
                    <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-extrabold flex items-center justify-center text-xs flex-shrink-0 border border-purple-500/30">
                          {String(track.trackNumber).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-100 text-sm truncate">{track.title}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                              Track {track.trackNumber}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-purple-300/90 mt-1 truncate">
                            {track.styleTags}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons for individual track */}
                      <div className="flex items-center space-x-1.5 self-end sm:self-center flex-shrink-0">
                        <button
                          onClick={() => toggleTrackExpand(track.trackNumber)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 border ${
                            isExpanded
                              ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-300" />
                          <span>{isExpanded ? (uiLanguage === 'ko' ? '가사 접기' : 'Hide Lyrics') : (uiLanguage === 'ko' ? '가사 보기' : 'View Lyrics')}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          id={`copy-style-${track.trackNumber}-btn`}
                          onClick={() => copyToClipboard(track.styleTags, `style-${track.trackNumber}`)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-1"
                          title="Copy Style Prompt"
                        >
                          {copiedField === `style-${track.trackNumber}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="hidden md:inline">{uiLanguage === 'ko' ? '태그' : 'Style'}</span>
                        </button>

                        <button
                          id={`copy-full-${track.trackNumber}-btn`}
                          onClick={() =>
                            copyToClipboard(
                              `Title: ${track.title}\nStyle: ${track.styleTags}\n\nLyrics:\n${trackLyrics}`,
                              `full-${track.trackNumber}`
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-semibold border border-purple-500/30 transition flex items-center space-x-1"
                          title="Copy Track Title, Style & Full Lyrics"
                        >
                          {copiedField === `full-${track.trackNumber}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">복사완료</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{uiLanguage === 'ko' ? '전체 복사' : 'Copy All'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Lyrics Container */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/80 p-4 bg-slate-950/80 rounded-b-xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-bold text-purple-300">
                              {track.title} — Suno AI v5.5 {uiLanguage === 'ko' ? '맞춤 가사' : 'Lyrics'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {trackLyrics.split('\n').filter((l) => l.trim().length > 0).length}줄 (Full Length)
                            </span>
                          </div>

                          <button
                            onClick={() => copyToClipboard(trackLyrics, `lyrics-${track.trackNumber}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1 self-start sm:self-auto"
                          >
                            {copiedField === `lyrics-${track.trackNumber}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[11px]">복사완료</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-purple-300" />
                                <span className="text-[11px]">{uiLanguage === 'ko' ? '가사만 복사' : 'Copy Lyrics'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Quick AI Refine Toolbar for individual track lyrics */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/80 border border-slate-800 rounded-xl">
                          <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                            <Wand2 className="w-3 h-3 text-amber-400" />
                            <span>{uiLanguage === 'ko' ? '트랙 개별 AI 가사 보완:' : 'Track AI Actions:'}</span>
                          </span>

                          <div className="flex flex-wrap gap-1.5">
                            <button
                              disabled={trackActionLoading[track.trackNumber]}
                              onClick={() =>
                                handleTrackLyricsAction(
                                  track.trackNumber,
                                  trackLyrics,
                                  track.styleTags,
                                  'expand-full'
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-semibold transition flex items-center space-x-1 disabled:opacity-50"
                              title="가사를 [Verse1],[Pre-Chorus],[Chorus],[Verse2],[Bridge],[Outro] 풀 사이즈로 확장합니다"
                            >
                              {trackActionLoading[track.trackNumber] ? (
                                <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
                              ) : (
                                <Maximize2 className="w-3 h-3 text-amber-300" />
                              )}
                              <span>{uiLanguage === 'ko' ? '✨ 가사 더 길게 확장 (Full Length)' : 'Expand Lyrics'}</span>
                            </button>

                            <button
                              disabled={trackActionLoading[track.trackNumber]}
                              onClick={() =>
                                handleTrackLyricsAction(
                                  track.trackNumber,
                                  trackLyrics,
                                  track.styleTags,
                                  'add-bridge'
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition disabled:opacity-50"
                            >
                              + 브릿지 추가
                            </button>

                            <button
                              disabled={trackActionLoading[track.trackNumber]}
                              onClick={() =>
                                handleTrackLyricsAction(
                                  track.trackNumber,
                                  trackLyrics,
                                  track.styleTags,
                                  'extend-outro'
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition disabled:opacity-50"
                            >
                              + 아웃트로 추가
                            </button>
                          </div>
                        </div>

                        {/* Lyrics Text Area */}
                        <textarea
                          value={trackLyrics}
                          onChange={(e) => onUpdateTrackLyrics && onUpdateTrackLyrics(track.trackNumber, e.target.value)}
                          rows={12}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500 transition resize-y"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
