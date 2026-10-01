import React from 'react';
import { GeneratedSunoResult } from '../types';
import { X, Bookmark, Trash2, Copy, Download, ExternalLink, Music } from 'lucide-react';

interface SavedCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: GeneratedSunoResult[];
  onSelectSavedItem: (item: GeneratedSunoResult) => void;
  onRemoveSavedItem: (id: string) => void;
  onClearAll: () => void;
  uiLanguage: 'ko' | 'en';
}

export const SavedCollectionModal: React.FC<SavedCollectionModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onSelectSavedItem,
  onRemoveSavedItem,
  onClearAll,
  uiLanguage,
}) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `suno-prompts-collection-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportSingleTXT = (item: GeneratedSunoResult) => {
    let text = `================================================
🎵 [SunoCraft Studio] Song & Lyrics Export
================================================
Song Title: ${item.songTitle} ${item.englishTitle ? `(${item.englishTitle})` : ''}
Genre: ${item.genreUsed}
Mood: ${item.moodUsed}
Concept: ${item.conceptUsed}
Created At: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}

------------------------------------------------
🎹 Suno "Style of Music" Prompt:
${item.stylePrompt}

------------------------------------------------
📝 Lyrics & Performance Structure Meta:
${item.lyrics}
`;

    if (item.playlistConcept) {
      text += `\n------------------------------------------------
🎧 YouTube Playlist Concept Pack
Playlist Title: ${item.playlistConcept.playlistTitle}
Description: ${item.playlistConcept.playlistDescription}

Thumbnail Art Prompt:
${item.playlistConcept.thumbnailPrompt || 'N/A'}
`;

      if (item.playlistConcept.tracklist && item.playlistConcept.tracklist.length > 0) {
        text += `\nTracklist (${item.playlistConcept.tracklist.length} Tracks):\n`;
        item.playlistConcept.tracklist.forEach((track) => {
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
    const safeFilename = (item.songTitle || 'suno_song').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    a.download = `${safeFilename}_details.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Bookmark className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {uiLanguage === 'ko' ? '저장된 프롬프트 & 가사 보관함' : 'Saved Song Prompts Collection'}
              </h2>
              <p className="text-xs text-slate-400">
                {savedItems.length}개의 노래 프롬프트가 저장되어 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {savedItems.length > 0 && (
              <button
                onClick={handleExportJSON}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                title="Export as JSON file"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">JSON 내보내기</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-3">
              <Music className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-xs">
                {uiLanguage === 'ko'
                  ? '아직 저장된 노래 프롬프트가 없습니다. 마음에 드는 곡을 생성 후 [보관함에 저장]을 누르세요!'
                  : 'No saved song prompts yet. Generate a song and click Save to Collection!'}
              </p>
            </div>
          ) : (
            savedItems.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-100 truncate">
                      {item.songTitle}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {item.genreUsed}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-amber-300/80 truncate">
                    {item.stylePrompt}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    생성일: {item.createdAt || '방금 전'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleExportSingleTXT(item)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
                    title="TXT 다운로드"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectSavedItem(item);
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                  >
                    <span>열기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => item.id && onRemoveSavedItem(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-slate-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {savedItems.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-rose-400 transition underline"
            >
              전체 삭제
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
