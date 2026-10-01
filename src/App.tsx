import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConceptSelector } from './components/ConceptSelector';
import { MusicParameterConfig } from './components/MusicParameterConfig';
import { PromptOutputStudio } from './components/PromptOutputStudio';
import { CheatSheetModal } from './components/CheatSheetModal';
import { SavedCollectionModal } from './components/SavedCollectionModal';
import { PlaylistVideoStudioModal } from './components/PlaylistVideoStudioModal';
import { AiTagGeneratorModal } from './components/AiTagGeneratorModal';
import { CONCEPT_PRESETS } from './data/presets';
import { ConceptPreset, GeneratedSunoResult, GeneratorConfig } from './types';
import { Sparkles, Youtube, Music, HelpCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [uiLanguage, setUiLanguage] = useState<'ko' | 'en'>('ko');
  const [selectedPreset, setSelectedPreset] = useState<ConceptPreset | null>(CONCEPT_PRESETS[0]);
  const [customConcept, setCustomConcept] = useState<string>('');

  const [config, setConfig] = useState<GeneratorConfig>({
    concept: CONCEPT_PRESETS[0].titleKo,
    genre: CONCEPT_PRESETS[0].suggestedGenre,
    mood: CONCEPT_PRESETS[0].suggestedMood,
    vocalType: CONCEPT_PRESETS[0].suggestedVocal,
    language: 'ko',
    targetSunoVersion: 'v5.5',
    customInstructions: '',
  });

  const [currentResult, setCurrentResult] = useState<GeneratedSunoResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [savedItems, setSavedItems] = useState<GeneratedSunoResult[]>([]);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState<boolean>(false);
  const [isTagGeneratorOpen, setIsTagGeneratorOpen] = useState<boolean>(false);

  const outputRef = useRef<HTMLDivElement | null>(null);

  // Sync selected preset to config
  useEffect(() => {
    if (selectedPreset && !customConcept.trim()) {
      setConfig((prev) => ({
        ...prev,
        concept: uiLanguage === 'ko' ? selectedPreset.titleKo : selectedPreset.titleEn,
        genre: selectedPreset.suggestedGenre,
        mood: selectedPreset.suggestedMood,
        vocalType: selectedPreset.suggestedVocal,
      }));
    }
  }, [selectedPreset, uiLanguage, customConcept]);

  // Load saved collection from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('suno_craft_saved');
      if (stored) {
        setSavedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved items:', e);
    }
  }, []);

  // Save items to localStorage helper
  const saveSavedItemsToStorage = (items: GeneratedSunoResult[]) => {
    setSavedItems(items);
    try {
      localStorage.setItem('suno_craft_saved', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const activeConcept = customConcept.trim() || config.concept;

    try {
      const response = await fetch('/api/generate-suno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          concept: activeConcept,
        }),
      });

      const resData = await response.json();

      if (!resData.success) {
        throw new Error(resData.error || 'Failed to generate prompt');
      }

      const generated: GeneratedSunoResult = {
        ...resData.data,
        id: `suno-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        conceptUsed: activeConcept,
        genreUsed: config.genre,
        moodUsed: config.mood,
        vocalUsed: config.vocalType,
        languageUsed: config.language,
      };

      setCurrentResult(generated);

      // Smooth scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Generation Error:', err);
      setErrorMessage(
        err.message || '프롬프트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLyricsAction = async (action: string) => {
    if (!currentResult) return;
    setIsActionLoading(true);

    try {
      const response = await fetch('/api/generate-lyrics-variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLyrics: currentResult.lyrics,
          stylePrompt: currentResult.stylePrompt,
          action,
          language: currentResult.languageUsed,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.updatedLyrics) {
        setCurrentResult((prev) =>
          prev ? { ...prev, lyrics: resData.updatedLyrics } : null
        );
      }
    } catch (e) {
      console.error('Lyrics action error:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveCollection = (item: GeneratedSunoResult) => {
    const exists = savedItems.some((s) => s.id === item.id || s.songTitle === item.songTitle);
    if (exists) {
      // Remove
      const filtered = savedItems.filter((s) => s.id !== item.id && s.songTitle !== item.songTitle);
      saveSavedItemsToStorage(filtered);
    } else {
      // Add
      saveSavedItemsToStorage([item, ...savedItems]);
    }
  };

  const isCurrentSaved = currentResult
    ? savedItems.some((s) => s.id === currentResult.id || s.songTitle === currentResult.songTitle)
    : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white flex flex-col antialiased">
      {/* Top Header Navigation */}
      <Header
        uiLanguage={uiLanguage}
        setUiLanguage={setUiLanguage}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenSavedCollection={() => setIsSavedModalOpen(true)}
        onOpenVideoStudio={() => setIsVideoStudioOpen(true)}
        onOpenTagGenerator={() => setIsTagGeneratorOpen(true)}
        savedCount={savedItems.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-purple-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <Youtube className="w-4 h-4 text-rose-400" />
              <span>{uiLanguage === 'ko' ? '유튜브 플레이리스트 채널 제작자 전용' : 'Optimized for YouTube Playlist Channels'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {uiLanguage === 'ko'
                ? 'Suno AI 프롬프트 + 가사 + 유튜브 플레이리스트 팩 생성기'
                : 'Suno AI Prompt, Lyrics & YouTube Playlist Pack Studio'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {uiLanguage === 'ko'
                ? '다양한 분위기/컨셉을 선택하면 Suno AI v5.5 초고음질 엔진 전용 태그 프롬프트, 구조 가사, 그리고 유튜브 플레이리스트용 20곡 연동 트랙리스트와 썸네일 프롬프트까지 한 번에 자동 생성해 드립니다.'
                : 'Select your playlist theme to instantly generate Suno AI v5.5 prompts, structured lyrics, 20-track video tracklists, and thumbnail prompts in Korean & English.'}
            </p>
          </div>
        </div>

        {/* Step 1: Concept Selector */}
        <ConceptSelector
          selectedPreset={selectedPreset}
          onSelectPreset={(preset) => setSelectedPreset(preset)}
          customConcept={customConcept}
          setCustomConcept={setCustomConcept}
          uiLanguage={uiLanguage}
        />

        {/* Step 2: Parameter Configuration */}
        <MusicParameterConfig
          config={config}
          setConfig={setConfig}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          uiLanguage={uiLanguage}
        />

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-3 shadow-lg">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 3: Generated Output Studio */}
        <div ref={outputRef}>
          {currentResult ? (
            <PromptOutputStudio
              result={currentResult}
              onUpdateLyrics={(newLyrics) =>
                setCurrentResult((prev) => (prev ? { ...prev, lyrics: newLyrics } : null))
              }
              onUpdateTrackLyrics={(trackNumber, newLyrics) => {
                setCurrentResult((prev) => {
                  if (!prev || !prev.playlistConcept) return prev;
                  const updatedTracklist = prev.playlistConcept.tracklist.map((t) =>
                    t.trackNumber === trackNumber ? { ...t, lyrics: newLyrics } : t
                  );
                  return {
                    ...prev,
                    playlistConcept: {
                      ...prev.playlistConcept,
                      tracklist: updatedTracklist,
                    },
                  };
                });
              }}
              onLyricsAction={handleLyricsAction}
              isActionLoading={isActionLoading}
              onSaveToCollection={handleSaveCollection}
              isSaved={isCurrentSaved}
              uiLanguage={uiLanguage}
              onOpenVideoStudio={() => setIsVideoStudioOpen(true)}
              onOpenTagGenerator={() => setIsTagGeneratorOpen(true)}
            />
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-300">
                {uiLanguage === 'ko'
                  ? '상단의 [생성하기] 버튼을 누르면 이 곳에 Suno AI 결과물이 출력됩니다.'
                  : 'Click [Generate] above to see your Suno AI prompts & lyrics here.'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {uiLanguage === 'ko'
                  ? 'Suno AI Style 필드 전용 쉼표 태그, [Verse]/[Chorus] 구조 가사, 유튜브 플레이리스트 팩이 1초 만에 완성됩니다.'
                  : 'Comma-separated style tags, meta-tagged lyrics, and playlist descriptions ready to copy!'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        uiLanguage={uiLanguage}
      />

      <SavedCollectionModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedItems={savedItems}
        onSelectSavedItem={(item) => setCurrentResult(item)}
        onRemoveSavedItem={(id) => saveSavedItemsToStorage(savedItems.filter((s) => s.id !== id))}
        onClearAll={() => saveSavedItemsToStorage([])}
        uiLanguage={uiLanguage}
      />

      <PlaylistVideoStudioModal
        isOpen={isVideoStudioOpen}
        onClose={() => setIsVideoStudioOpen(false)}
        result={currentResult}
        uiLanguage={uiLanguage}
      />

      <AiTagGeneratorModal
        isOpen={isTagGeneratorOpen}
        onClose={() => setIsTagGeneratorOpen(false)}
        initialSongTitle={currentResult?.songTitle}
        initialGenre={currentResult?.genreUsed}
        initialMood={currentResult?.moodUsed}
        uiLanguage={uiLanguage}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} SunoCraft Studio • Suno AI YouTube Playlist Prompt Generator
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCheatSheetOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Suno 태그 가이드
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSavedModalOpen(true)}
              className="hover:text-slate-300 transition"
            >
              보관함 ({savedItems.length})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
