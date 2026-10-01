export type LanguageOption = 'ko' | 'en' | 'bilingual';
export type SunoVersion = 'v5.5' | 'v4' | 'v3.5';

export interface PlaylistCategory {
  id: string;
  nameKo: string;
  nameEn: string;
  iconName: string;
}

export interface ConceptPreset {
  id: string;
  categoryId: string;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  suggestedGenre: string;
  suggestedMood: string;
  suggestedVocal: string;
  suggestedBpm: string;
  suggestedLanguage?: LanguageOption;
  suggestedSunoVersion?: SunoVersion;
  suggestedInstructions?: string;
  icon: string;
  tags: string[];
}

export interface PlaylistTrackIdea {
  trackNumber: number;
  title: string;
  styleTags: string;
  lyrics?: string;
}

export interface YouTubeSeoPack {
  titleOptions: {
    clickbaitHook: string;
    keywordRich: string;
    aestheticMinimal: string;
  };
  searchTags: string[];
  descriptionHook: string;
  targetKeywords: string[];
}

export interface PlaylistConceptPack {
  playlistTitle: string;
  playlistDescription: string;
  thumbnailPrompt: string;
  videoLoopPrompt?: string;
  tracklist: PlaylistTrackIdea[];
  seoPack?: YouTubeSeoPack;
}

export interface GeneratedSunoResult {
  id?: string;
  createdAt?: string;
  songTitle: string;
  englishTitle: string;
  stylePrompt: string;
  lyrics: string;
  styleExplanation: string;
  playlistConcept: PlaylistConceptPack;
  conceptUsed: string;
  genreUsed: string;
  moodUsed: string;
  vocalUsed: string;
  languageUsed: LanguageOption;
  targetSunoVersion?: SunoVersion;
}

export interface GeneratorConfig {
  concept: string;
  genre: string;
  mood: string;
  vocalType: string;
  language: LanguageOption;
  targetSunoVersion: SunoVersion;
  customInstructions: string;
}

export interface SunoMetaTag {
  tag: string;
  labelKo: string;
  labelEn: string;
  descriptionKo: string;
  descriptionEn: string;
  category: 'structure' | 'vocal' | 'instrument' | 'effect';
}

export interface AiTagGeneratorResult {
  searchTags: string[];
  primaryKeywords: string[];
  longtailKeywords: string[];
  hashtags: string[];
  studioFormattedString: string;
  seoTips: string[];
}

