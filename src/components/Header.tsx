import React from 'react';
import { Music, BookOpen, Bookmark, Sparkles, Youtube, Globe, Video, Tag } from 'lucide-react';

interface HeaderProps {
  uiLanguage: 'ko' | 'en';
  setUiLanguage: (lang: 'ko' | 'en') => void;
  onOpenCheatSheet: () => void;
  onOpenSavedCollection: () => void;
  onOpenVideoStudio: () => void;
  onOpenTagGenerator: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  uiLanguage,
  setUiLanguage,
  onOpenCheatSheet,
  onOpenSavedCollection,
  onOpenVideoStudio,
  onOpenTagGenerator,
  savedCount,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Music className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                SunoCraft Studio
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Youtube className="w-3 h-3 mr-1 text-rose-500" />
                Playlist Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {uiLanguage === 'ko'
                ? '수노 AI 음악 프롬프트 & 가사 & 유튜브 플레이리스트 제작기'
                : 'Suno AI Music Prompt & Lyrics & YouTube Playlist Generator'}
            </p>
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* AI Tag Generator Button */}
          <button
            id="open-tag-generator-btn"
            onClick={onOpenTagGenerator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
          >
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">
              {uiLanguage === 'ko' ? '✨ AI SEO 태그 생성기' : 'AI SEO Tags'}
            </span>
            <span className="lg:hidden">
              {uiLanguage === 'ko' ? '태그' : 'Tags'}
            </span>
          </button>

          {/* Playlist Video Studio Button */}
          <button
            id="open-video-studio-btn"
            onClick={onOpenVideoStudio}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition"
          >
            <Video className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">
              {uiLanguage === 'ko' ? '🎬 영상 & 타임스탬프 스튜디오' : 'Video & Timestamps'}
            </span>
            <span className="sm:hidden">
              {uiLanguage === 'ko' ? '영상 스튜디오' : 'Studio'}
            </span>
          </button>

          {/* UI Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => setUiLanguage(uiLanguage === 'ko' ? 'en' : 'ko')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Toggle App Interface Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{uiLanguage === 'ko' ? 'KO / EN' : 'EN / KO'}</span>
          </button>

          {/* Suno Cheat Sheet Button */}
          <button
            id="open-cheatsheet-btn"
            onClick={onOpenCheatSheet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {uiLanguage === 'ko' ? 'Suno AI 태그 가이드' : 'Suno Tag Guide'}
            </span>
            <span className="md:hidden">
              {uiLanguage === 'ko' ? '가이드' : 'Guide'}
            </span>
          </button>

          {/* Saved Collection Drawer Button */}
          <button
            id="open-saved-btn"
            onClick={onOpenSavedCollection}
            className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 text-xs font-medium border border-rose-500/30 transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            <span>
              {uiLanguage === 'ko' ? '보관함' : 'Saved'}
            </span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
