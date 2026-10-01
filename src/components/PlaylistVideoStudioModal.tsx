import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Video,
  Film,
  Clock,
  Sparkles,
  Copy,
  Check,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Image as ImageIcon,
  Wand2,
  Disc,
  RefreshCw,
  Volume2,
  VolumeX,
  ListMusic,
  FileText,
  Youtube,
  Search,
  Tag,
  TrendingUp,
  Radio,
  Layers,
  Zap,
  Sliders,
  Repeat,
  Tv,
  CloudRain,
  Flame,
  Sun,
  Activity,
  Eye,
} from 'lucide-react';
import { GeneratedSunoResult, PlaylistTrackIdea } from '../types';

interface PlaylistVideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GeneratedSunoResult | null;
  uiLanguage: 'ko' | 'en';
}

interface UploadedTrack {
  id: string;
  trackNumber: number;
  title: string;
  file?: File;
  objectUrl?: string;
  durationSeconds: number; // calculated from metadata or default 180s
  customStyleTags?: string;
}

export const PlaylistVideoStudioModal: React.FC<PlaylistVideoStudioModalProps> = ({
  isOpen,
  onClose,
  result,
  uiLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'timestamps' | 'video'>('timestamps');

  // Track items list
  const [tracks, setTracks] = useState<UploadedTrack[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // SEO Title Selection
  const [selectedTitleFormula, setSelectedTitleFormula] = useState<'default' | 'clickbait' | 'keyword' | 'aesthetic'>('default');

  // Background visualizer state
  const [bgType, setBgType] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetBg, setSelectedPresetBg] = useState<'lofi' | 'citypop' | 'space' | 'sunset' | 'cafe'>('lofi');
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [isCustomVideoBg, setIsCustomVideoBg] = useState<boolean>(false);

  // Loop Animation & Visual FX Controls
  const [loopMotion, setLoopMotion] = useState<'ken-burns' | 'bass-pulse' | 'slow-pan' | 'orbit' | 'static'>('ken-burns');
  const [loopFx, setLoopFx] = useState<'rain' | 'sakura' | 'stars' | 'steam' | 'aurora' | 'vhs' | 'vinyl' | 'none'>('rain');
  const [loopFxIntensity, setLoopFxIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<'loop' | 'render' | 'aiPrompts'>('loop');

  // Video loop prompt state
  const [aiVideoLoopPrompt, setAiVideoLoopPrompt] = useState<string>('');

  // Audio Playback state
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isSynthPlaying, setIsSynthPlaying] = useState<boolean>(false);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordMode, setRecordMode] = useState<number>(15); // duration in seconds (default 15s sample)
  const [isFullPlaylistMode, setIsFullPlaylistMode] = useState<boolean>(false); // Default to fast 15s sample mode
  const [renderResolution, setRenderResolution] = useState<'480p' | '720p'>('480p');
  const [exportSpeed, setExportSpeed] = useState<1 | 2>(1); // 1x or 2x speed rendering
  const [muteSpeakerDuringRender, setMuteSpeakerDuringRender] = useState<boolean>(true); // Silent background rendering

  // AI Background Generation state
  const [aiBgPrompt, setAiBgPrompt] = useState<string>('');
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState<boolean>(false);

  // Cached custom background image and video references
  const customBgImgRef = useRef<HTMLImageElement | null>(null);
  const customVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto initialize prompts when result changes
  useEffect(() => {
    if (result) {
      const defaultThumbnailPrompt = result.playlistConcept?.thumbnailPrompt ||
        `${result.conceptUsed || result.genreUsed || 'lofi music'}, ${result.moodUsed || 'aesthetic'}, 16:9 cinematic wallpaper, high detail, masterpiece, beautiful lighting`;
      setAiBgPrompt(defaultThumbnailPrompt);

      const defaultVideoPrompt = result.playlistConcept?.videoLoopPrompt ||
        `Cinematic 4k infinite loop cinemagraph, ${result.conceptUsed || result.genreUsed || 'lofi music'}, ${result.moodUsed || 'aesthetic'} ambiance, continuous subtle atmospheric movement, slow gentle camera breathing, seamless looping video, 60fps, photorealistic`;
      setAiVideoLoopPrompt(defaultVideoPrompt);
    } else {
      setAiBgPrompt('lofi music aesthetic room, rainy window sunset view, warm ambient lighting, 16:9 wallpaper');
      setAiVideoLoopPrompt('Cinematic 4k seamless infinite loop, cozy lofi study room with rain trickling down the window, warm amber light, gentle camera drift, 60fps cinemagraph');
    }
  }, [result]);

  const generateAiBackgroundImage = (customPromptText?: string) => {
    const targetPrompt = customPromptText || aiBgPrompt || 'lofi aesthetic background';
    setIsGeneratingAiBg(true);

    const cleanPrompt = encodeURIComponent(targetPrompt.trim() + ', 16:9 aspect ratio, 8k resolution, highly detailed, masterpiece, cinematic lighting');
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      customBgImgRef.current = img;
      setIsCustomVideoBg(false);
      setCustomBgUrl(imageUrl);
      setBgType('custom');
      setIsGeneratingAiBg(false);
    };
    img.onerror = () => {
      // Fallback aesthetic image if prompt fails
      const fallbackUrl = `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1280&auto=format&fit=crop`;
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        customBgImgRef.current = fallbackImg;
        setIsCustomVideoBg(false);
        setCustomBgUrl(fallbackUrl);
        setBgType('custom');
        setIsGeneratingAiBg(false);
      };
      fallbackImg.src = fallbackUrl;
    };
    img.src = imageUrl;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mov') || file.name.endsWith('.gif');

      if (isVideo) {
        setIsCustomVideoBg(true);
        setCustomBgUrl(url);
        setBgType('custom');
        if (customVideoRef.current) {
          customVideoRef.current.src = url;
          customVideoRef.current.play().catch(err => console.log('Auto play video:', err));
        }
      } else {
        setIsCustomVideoBg(false);
        setCustomBgUrl(url);
        setBgType('custom');
        const img = new Image();
        img.onload = () => {
          customBgImgRef.current = img;
        };
        img.src = url;
      }
    }
  };

  useEffect(() => {
    if (customBgUrl && !isCustomVideoBg) {
      const img = new Image();
      img.src = customBgUrl;
      img.onload = () => {
        customBgImgRef.current = img;
      };
    }
  }, [customBgUrl, isCustomVideoBg]);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<any>(null);

  // Web Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakerGainRef = useRef<GainNode | null>(null);
  const mediaElementSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const synthNoiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize tracks from result or default tracks when opened
  useEffect(() => {
    if (!isOpen) return;

    if (result && result.playlistConcept && result.playlistConcept.tracklist && result.playlistConcept.tracklist.length > 0) {
      const initialTracks: UploadedTrack[] = result.playlistConcept.tracklist.map((t) => ({
        id: `track-${t.trackNumber}-${Date.now()}`,
        trackNumber: t.trackNumber,
        title: t.title,
        durationSeconds: 180, // Default 3 mins estimate
        customStyleTags: t.styleTags,
      }));
      setTracks(initialTracks);
    } else if (tracks.length === 0) {
      // 5 default placeholder tracks
      const defaultTracks: UploadedTrack[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `default-track-${i + 1}`,
        trackNumber: i + 1,
        title: `Track ${i + 1} - Lofi Chill Beat`,
        durationSeconds: 180,
      }));
      setTracks(defaultTracks);
    }
  }, [isOpen, result]);

  // Clean up audio on close
  useEffect(() => {
    if (!isOpen) {
      stopAudioPlayback();
      stopLofiSynthEngine();
    }
  }, [isOpen]);

  // Setup Web Audio Context
  const getOrCreateAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const dest = ctx.createMediaStreamDestination();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      const speakerGain = ctx.createGain();
      speakerGain.gain.value = 1.0;

      // Master connections:
      // analyser -> speakerGain -> ctx.destination (speakers)
      // analyser -> dest (MediaRecorder stream - ALWAYS receives 100% full audio)
      analyser.connect(speakerGain);
      speakerGain.connect(ctx.destination);
      analyser.connect(dest);

      audioCtxRef.current = ctx;
      audioDestRef.current = dest;
      analyserRef.current = analyser;
      speakerGainRef.current = speakerGain;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return {
      ctx: audioCtxRef.current,
      dest: audioDestRef.current!,
      analyser: analyserRef.current!,
      speakerGain: speakerGainRef.current!,
    };
  };

  // Built-in Web Audio Lofi Synth Engine (when no uploaded audio exists)
  const startLofiSynthEngine = () => {
    const { ctx, analyser } = getOrCreateAudioContext();
    stopLofiSynthEngine();

    let noteIndex = 0;
    // Relaxing Chill Lofi Chords
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    // Vinyl Crackle Noise
    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.012;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 1000;
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(analyser);
      whiteNoise.start();
      synthNoiseSourceRef.current = whiteNoise;
    } catch (e) {
      console.log('Noise buffer init:', e);
    }

    // Chord interval loop
    const playChord = () => {
      const currentChord = chords[noteIndex % chords.length];
      noteIndex++;

      currentChord.forEach((freq, i) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 750 + Math.sin(noteIndex) * 200;

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.06 * volume, ctx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.7);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(analyser);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 1.8);
        } catch (e) {
          console.error('Oscillator play error:', e);
        }
      });
    };

    playChord();
    synthIntervalRef.current = setInterval(playChord, 1750);
    setIsSynthPlaying(true);
  };

  const stopLofiSynthEngine = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthNoiseSourceRef.current) {
      try {
        synthNoiseSourceRef.current.stop();
      } catch (e) {}
      synthNoiseSourceRef.current = null;
    }
    setIsSynthPlaying(false);
  };

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (speakerGainRef.current && audioCtxRef.current) {
      speakerGainRef.current.gain.setValueAtTime(1, audioCtxRef.current.currentTime);
    }
    stopLofiSynthEngine();
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    const currentTrack = tracks[currentTrackIndex];

    if (isPlaying) {
      stopAudioPlayback();
      return;
    }

    // Play actual uploaded MP3 if available
    if (currentTrack && currentTrack.objectUrl) {
      const { ctx, analyser } = getOrCreateAudioContext();

      if (audioRef.current) {
        if (!mediaElementSourceRef.current) {
          try {
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            mediaElementSourceRef.current = source;
          } catch (e) {
            console.log('Audio element source connected:', e);
          }
        }
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error('Playback error:', err);
          // Fallback to Synth Lofi Engine
          startLofiSynthEngine();
          setIsPlaying(true);
        });
      }
    } else {
      // Start Lofi Synth Engine
      startLofiSynthEngine();
      setIsPlaying(true);
    }
  };

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const pad = (n: number) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Handle uploading audio files (Unlimited Uploads)
  const handleAudioFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files) as File[];

    files.forEach((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = objectUrl;

      audio.onloadedmetadata = () => {
        const duration = Math.round(audio.duration) || 180;
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

        setTracks((prevTracks) => {
          // Check if current list has only default placeholder tracks without audio files
          const isOnlyPlaceholders =
            prevTracks.length > 0 &&
            prevTracks.every((t) => !t.file && t.id.startsWith('default-track-'));

          if (isOnlyPlaceholders && index === 0) {
            // First uploaded file replaces the dummy placeholders
            return [
              {
                id: `uploaded-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                trackNumber: 1,
                title: fileNameWithoutExt,
                file,
                objectUrl,
                durationSeconds: duration,
              },
            ];
          }

          // Append to existing tracks with auto-incremented track number
          const newTrack: UploadedTrack = {
            id: `uploaded-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            trackNumber: prevTracks.length + 1,
            title: fileNameWithoutExt,
            file,
            objectUrl,
            durationSeconds: duration,
          };

          return [...prevTracks, newTrack];
        });
      };
    });

    // Reset value so user can upload same files again if needed
    e.target.value = '';
  };

  // Custom image background upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomBgUrl(url);
      setBgType('custom');
    }
  };

  // Compute accumulated cumulative timestamps
  const getCalculatedTimestamps = () => {
    let currentCumulativeSeconds = 0;
    return tracks.map((track) => {
      const startTimestamp = formatTime(currentCumulativeSeconds);
      const startSec = currentCumulativeSeconds;
      currentCumulativeSeconds += track.durationSeconds;
      return {
        ...track,
        startTimestamp,
        startSec,
      };
    });
  };

  const calculatedTracks = getCalculatedTimestamps();
  const totalPlaylistSeconds = calculatedTracks.reduce((acc, t) => acc + t.durationSeconds, 0);
  const effectiveRecordDuration = isFullPlaylistMode ? (totalPlaylistSeconds || 180) : recordMode;

  // Auto-play next track on track index update during playback or rendering
  useEffect(() => {
    if (isPlaying && tracks[currentTrackIndex]?.objectUrl && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log('Auto track transition play error:', err);
      });
    }
  }, [currentTrackIndex, isPlaying]);

  // Get active selected title
  const getActiveTitle = (): string => {
    if (!result?.playlistConcept) return '🎧 [Playlist] 감성 플레이리스트';
    const seo = result.playlistConcept.seoPack;
    if (selectedTitleFormula === 'clickbait' && seo?.titleOptions.clickbaitHook) {
      return seo.titleOptions.clickbaitHook;
    }
    if (selectedTitleFormula === 'keyword' && seo?.titleOptions.keywordRich) {
      return seo.titleOptions.keywordRich;
    }
    if (selectedTitleFormula === 'aesthetic' && seo?.titleOptions.aestheticMinimal) {
      return seo.titleOptions.aestheticMinimal;
    }
    return result.playlistConcept.playlistTitle || '🎧 [Playlist] 감성 플레이리스트';
  };

  // Generate YouTube Description text block
  const generateYouTubeDescription = () => {
    const activeTitle = getActiveTitle();
    const seoHook = result?.playlistConcept?.seoPack?.descriptionHook;
    const baseDesc = result?.playlistConcept?.playlistDescription || '#로파이 #플레이리스트 #Lofi #SunoAI #Playlist';

    const timestampLines = calculatedTracks
      .map((t) => `${t.startTimestamp} ${t.title}`)
      .join('\n');

    const descHookHeader = seoHook ? `${seoHook}\n\n` : '';

    return `${activeTitle}

${descHookHeader}[Timestamps / 타임스탬프]
${timestampLines}

총 재생 시간: ${formatTime(totalPlaylistSeconds)}

----------------------------------------
✨ Music generated with Suno AI v5.5 (Hyper-fidelity Audio Engine)
🎨 Artwork & Curation by SunoCraft Studio

${baseDesc}`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Track manipulation helpers
  const handleUpdateDuration = (id: string, newSecs: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, durationSeconds: Math.max(1, newSecs) } : t))
    );
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
  };

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === tracks.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...tracks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reindexed = updated.map((t, idx) => ({ ...t, trackNumber: idx + 1 }));
    setTracks(reindexed);
  };

  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      return filtered.map((t, idx) => ({ ...t, trackNumber: idx + 1 }));
    });
  };

  // Canvas visualizer loop with Loop Motion, Looping Video, and Visual FX overlays
  useEffect(() => {
    if (activeTab !== 'video') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply selected canvas resolution for fast performance vs HD quality
    const targetWidth = renderResolution === '480p' ? 854 : 1280;
    const targetHeight = renderResolution === '480p' ? 480 : 720;
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    let frameCount = 0;
    const freqData = new Uint8Array(32);

    const renderCanvas = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Get real audio frequency data if analyser is active
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(freqData);
      }

      ctx.clearRect(0, 0, width, height);

      // --- 1. Base Background with Camera Loop Motion ---
      ctx.save();

      // Camera Loop Motion Transform
      if (loopMotion === 'ken-burns') {
        const zoom = 1.05 + Math.sin(frameCount * 0.007) * 0.04;
        const panX = Math.cos(frameCount * 0.005) * (width * 0.018);
        const panY = Math.sin(frameCount * 0.006) * (height * 0.015);
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-width / 2 + panX, -height / 2 + panY);
      } else if (loopMotion === 'bass-pulse') {
        const bass = (freqData[0] + freqData[1] + freqData[2] + freqData[3]) / (4 * 255);
        const pulse = 1.0 + (isPlaying ? bass * 0.05 : Math.sin(frameCount * 0.08) * 0.015);
        ctx.translate(width / 2, height / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-width / 2, -height / 2);
      } else if (loopMotion === 'slow-pan') {
        const pan = Math.sin(frameCount * 0.005) * (width * 0.03);
        ctx.translate(width / 2, height / 2);
        ctx.scale(1.07, 1.07);
        ctx.translate(-width / 2 + pan, -height / 2);
      } else if (loopMotion === 'orbit') {
        const ox = Math.cos(frameCount * 0.007) * (width * 0.012);
        const oy = Math.sin(frameCount * 0.007) * (height * 0.012);
        ctx.translate(width / 2, height / 2);
        ctx.scale(1.05, 1.05);
        ctx.translate(-width / 2 + ox, -height / 2 + oy);
      }

      // Draw background source
      if (bgType === 'custom' && isCustomVideoBg && customVideoRef.current) {
        // Draw video frame
        ctx.drawImage(customVideoRef.current, 0, 0, width, height);
      } else if (bgType === 'custom' && customBgImgRef.current) {
        ctx.drawImage(customBgImgRef.current, 0, 0, width, height);
      } else if (bgType === 'custom') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Preset backgrounds
        if (selectedPresetBg === 'lofi') {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#020617');
          grad.addColorStop(0.5, '#0f172a');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        } else if (selectedPresetBg === 'citypop') {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#31103f');
          grad.addColorStop(0.5, '#831843');
          grad.addColorStop(1, '#ea580c');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          const sunGrad = ctx.createRadialGradient(width / 2, height * 0.6, 10, width / 2, height * 0.6, 120);
          sunGrad.addColorStop(0, '#fde047');
          sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = sunGrad;
          ctx.beginPath();
          ctx.arc(width / 2, height * 0.6, 120, 0, Math.PI * 2);
          ctx.fill();
        } else if (selectedPresetBg === 'space') {
          const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(1, '#020617');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        } else if (selectedPresetBg === 'sunset') {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#451a03');
          grad.addColorStop(0.5, '#9a3412');
          grad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#1c1917');
          grad.addColorStop(1, '#44403c');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
      }

      ctx.restore();

      // --- 2. Overlay Loop Visual Effects (loopFx) ---
      const intensityMul = loopFxIntensity === 'low' ? 0.5 : loopFxIntensity === 'high' ? 1.5 : 1.0;

      if (loopFx === 'rain') {
        // Rain lines
        const dropCount = Math.floor(65 * intensityMul);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let i = 0; i < dropCount; i++) {
          const speed = 7 + (i % 5);
          const rx = (i * 37 + frameCount * 1.8) % (width + 60) - 30;
          const ry = (i * 29 + frameCount * speed) % (height + 40) - 20;
          const len = 15 + (i % 12);
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + len);
        }
        ctx.stroke();

        // Glass Condensation Droplets
        const beadCount = Math.floor(30 * intensityMul);
        for (let i = 0; i < beadCount; i++) {
          const bx = (i * 97 + (i % 7) * 40) % width;
          const creepSpeed = 0.15 + (i % 3) * 0.1;
          const by = (i * 61 + (frameCount * creepSpeed)) % (height + 20);
          const radius = 1.5 + (i % 4) * 0.8;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.arc(bx, by, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.beginPath();
          ctx.arc(bx - radius * 0.3, by - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (loopFx === 'sakura') {
        const petalCount = Math.floor(35 * intensityMul);
        for (let i = 0; i < petalCount; i++) {
          const px = (i * 67 + frameCount * (1.2 + (i % 3) * 0.5) + Math.sin(frameCount * 0.02 + i) * 30) % (width + 60) - 30;
          const py = (i * 43 + frameCount * (1.8 + (i % 4) * 0.4)) % (height + 40) - 20;
          const angle = frameCount * 0.03 + i;
          const wobble = Math.sin(frameCount * 0.05 + i * 2);

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          ctx.scale(1, Math.max(0.2, Math.abs(wobble)));
          ctx.fillStyle = (i % 3 === 0) ? 'rgba(251, 207, 232, 0.85)' : 'rgba(244, 114, 182, 0.75)';
          ctx.beginPath();
          ctx.ellipse(0, 0, 7 + (i % 3), 4 + (i % 2), 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (loopFx === 'stars') {
        const orbCount = Math.floor(40 * intensityMul);
        for (let i = 0; i < orbCount; i++) {
          const ox = (i * 59 + Math.sin((frameCount + i * 15) * 0.015) * 40) % width;
          const oy = (i * 71 - frameCount * 0.6 + height) % height;
          const pulse = 0.3 + 0.7 * Math.sin((frameCount * 0.04) + i * 0.8);
          const radius = 2 + (i % 5) * 2;
          const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius * 2.5);
          const color = i % 2 === 0 ? '253, 224, 71' : '192, 132, 252';
          grad.addColorStop(0, `rgba(${color}, ${0.85 * pulse})`);
          grad.addColorStop(0.5, `rgba(${color}, ${0.3 * pulse})`);
          grad.addColorStop(1, `rgba(${color}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ox, oy, radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (loopFx === 'steam') {
        const steamCount = Math.floor(28 * intensityMul);
        const baseCenterX = width * 0.5;
        for (let i = 0; i < steamCount; i++) {
          const t = (frameCount * 0.8 + i * 20) % 240;
          const progress = t / 240;
          const sx = baseCenterX + Math.sin(t * 0.05 + i) * (20 + progress * 80) + (i % 7 - 3) * 20;
          const sy = height - progress * (height * 0.65);
          const alpha = Math.sin(progress * Math.PI) * 0.3;
          const r = 12 + progress * 40;
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (loopFx === 'aurora') {
        // Stars
        for (let i = 0; i < 50; i++) {
          const sx = (i * 73) % width;
          const sy = (i * 37) % (height * 0.7);
          const twinkle = 0.2 + 0.8 * Math.sin((frameCount + i * 23) * 0.06);
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3 === 0) ? 1.8 : 1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Aurora ribbons
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let a = 0; a < 2; a++) {
          ctx.beginPath();
          ctx.moveTo(0, height * 0.15);
          for (let x = 0; x <= width; x += 30) {
            const y = height * (0.15 + a * 0.1) + Math.sin(x * 0.005 + frameCount * 0.02 + a) * 35;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, 0);
          ctx.lineTo(0, 0);
          ctx.fillStyle = a === 0 ? 'rgba(56, 189, 248, 0.16)' : 'rgba(168, 85, 247, 0.16)';
          ctx.fill();
        }
        // Meteor
        const meteorCycle = frameCount % 180;
        if (meteorCycle < 35) {
          const mx = (meteorCycle * 18 + 100) % width;
          const my = (meteorCycle * 9 + 40);
          ctx.strokeStyle = `rgba(255, 255, 255, ${(35 - meteorCycle) / 35})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx - 40, my - 20);
          ctx.stroke();
        }
        ctx.restore();
      } else if (loopFx === 'vhs') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
        if (frameCount % 90 < 8) {
          const noiseY = (frameCount * 13) % height;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.fillRect(0, noiseY, width, 6);
        }
        const vigGrad = ctx.createRadialGradient(width / 2, height / 2, height * 0.4, width / 2, height / 2, width * 0.7);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (loopFx === 'vinyl') {
        const vRadius = renderResolution === '480p' ? 65 : 95;
        const vx = width - vRadius - 25;
        const vy = height - vRadius - 25;
        const rot = frameCount * 0.03;

        ctx.save();
        ctx.translate(vx, vy);
        ctx.rotate(rot);

        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, vRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.stroke();

        for (let r = vRadius * 0.4; r < vRadius * 0.9; r += 7) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(0, 0, vRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fdf2f8';
        ctx.beginPath();
        ctx.arc(0, 0, vRadius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // --- 3. Audio Spectrum Visualizer ---
      const currentTrack = calculatedTracks[currentTrackIndex] || calculatedTracks[0];
      const barCount = 32;
      const barWidth = renderResolution === '480p' ? 8 : 12;
      const gap = renderResolution === '480p' ? 4 : 6;
      const startX = (width - (barCount * (barWidth + gap))) / 2;
      const centerY = height * 0.75;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        const realVal = freqData[i] || 0;
        const synthVal = isPlaying ? 15 + Math.sin((frameCount * 0.15) + i * 0.5) * 35 : 8;
        const baseHeight = isPlaying ? Math.max(8, (realVal / 255) * (renderResolution === '480p' ? 45 : 65) || synthVal) : 8;

        ctx.fillStyle = 'rgba(244, 114, 182, 0.9)';
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = realVal > 120 ? 10 : 0;
        ctx.fillRect(x, centerY - baseHeight / 2, barWidth, baseHeight);
        ctx.shadowBlur = 0;
      }

      // --- 4. Current Song Title & Time Badge ---
      if (currentTrack) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        const boxWidth = renderResolution === '480p' ? 320 : 440;
        const boxHeight = renderResolution === '480p' ? 55 : 70;
        ctx.roundRect(width / 2 - boxWidth / 2, 25, boxWidth, boxHeight, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = renderResolution === '480p' ? 'bold 14px sans-serif' : 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`NOW PLAYING: ${currentTrack.title}`, width / 2, renderResolution === '480p' ? 48 : 65);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = renderResolution === '480p' ? '11px monospace' : '13px monospace';
        ctx.fillText(`Track ${currentTrack.trackNumber} / ${calculatedTracks.length}  •  ${currentTrack.startTimestamp}`, width / 2, renderResolution === '480p' ? 66 : 88);
      }

      animationFrameRef.current = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeTab, bgType, selectedPresetBg, customBgUrl, isCustomVideoBg, loopMotion, loopFx, loopFxIntensity, currentTrackIndex, isPlaying, calculatedTracks, renderResolution]);

  const handleStopRecordVideo = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (speakerGainRef.current && audioCtxRef.current) {
      speakerGainRef.current.gain.setValueAtTime(1, audioCtxRef.current.currentTime);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Record Canvas Video AND Music Audio using MediaRecorder
  const handleStartRecordVideo = async (overrideDuration?: number) => {
    const recordDurationSec = overrideDuration !== undefined ? overrideDuration : effectiveRecordDuration;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Apply speed multiplier to audio element if playing uploaded audio
    if (audioRef.current) {
      audioRef.current.playbackRate = exportSpeed;
      audioRef.current.volume = volume || 1.0;
    }

    try {
      const { ctx, dest, analyser, speakerGain } = getOrCreateAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Mute user speakers during export if enabled (silent background render)
      // The dest node (MediaRecorder) still receives 100% full audio signal!
      if (speakerGain) {
        speakerGain.gain.setValueAtTime(muteSpeakerDuringRender ? 0 : 1, ctx.currentTime);
      }

      // Connect audio element to AudioContext analyser if available
      if (audioRef.current && !mediaElementSourceRef.current) {
        try {
          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          mediaElementSourceRef.current = source;
        } catch (e) {
          console.log('MediaElementSource initialization note:', e);
        }
      }

      // Start playing audio if paused
      if (!isPlaying) {
        handleTogglePlay();
      } else if (audioRef.current && tracks[currentTrackIndex]?.objectUrl) {
        audioRef.current.play().catch(() => {});
      }

      const canvasStream = canvas.captureStream(30);

      // Get audio stream from Web Audio destination node
      const destTracks = dest.stream.getAudioTracks();
      const audioTracks: MediaStreamTrack[] = [];
      destTracks.forEach((t) => {
        if (t.enabled) audioTracks.push(t);
      });

      // Combine video and audio streams
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...audioTracks,
      ];
      const combinedStream = new MediaStream(combinedTracks);

      recordedChunksRef.current = [];

      // Detect supported mimeType prioritizing MP4 container or WebM
      const mimeTypes = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let selectedMimeType = '';
      for (const t of mimeTypes) {
        if (MediaRecorder.isTypeSupported(t)) {
          selectedMimeType = t;
          break;
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(combinedStream, options);

      // Save actual MIME type recorded by MediaRecorder
      const recordedMimeType = mediaRecorder.mimeType || selectedMimeType || 'video/webm';

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }

        // Restore speaker output gain
        if (speakerGainRef.current && audioCtxRef.current) {
          speakerGainRef.current.gain.setValueAtTime(1, audioCtxRef.current.currentTime);
        }

        // Reset playback rate
        if (audioRef.current) {
          audioRef.current.playbackRate = 1.0;
        }

        // Use exact recorded MIME type to prevent audio codec corruption
        const blob = new Blob(recordedChunksRef.current, {
          type: recordedMimeType,
        });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingProgress(0);

      let elapsed = 0;
      const tickMs = exportSpeed === 2 ? 500 : 1000;
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      recordingIntervalRef.current = setInterval(() => {
        elapsed += 1;
        const progress = Math.min(100, Math.round((elapsed / recordDurationSec) * 100));
        setRecordingProgress(progress);

        if (elapsed >= recordDurationSec) {
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, tickMs);
    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
      alert('동영상 렌더링을 시작하지 못했습니다. 크롬/웨일 브라우저 환경을 이용해 주세요.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="playlist-video-studio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Hidden Audio Element for uploaded files */}
        <audio
          ref={audioRef}
          src={tracks[currentTrackIndex]?.objectUrl || undefined}
          onEnded={() => {
            if (currentTrackIndex < tracks.length - 1) {
              setCurrentTrackIndex((prev) => prev + 1);
            } else {
              setIsPlaying(false);
            }
          }}
        />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Youtube className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>
                  {uiLanguage === 'ko'
                    ? '🎬 유튜브 플리 음원 영상 & 타임스탬프 스튜디오'
                    : 'YouTube Video & Auto Timestamp Studio'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Audio & Video Studio
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {uiLanguage === 'ko'
                  ? 'Suno AI 음원을 합성하고 타임스탬프 자동 계산 및 오디오 반응형 플리 비디오를 렌더링하세요.'
                  : 'Upload Suno audio files to auto-calculate cumulative timestamps & render music videos.'}
              </p>
            </div>
          </div>

          <button
            id="close-playlist-studio-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('timestamps')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 ${
              activeTab === 'timestamps'
                ? 'bg-slate-900 text-purple-300 border-purple-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{uiLanguage === 'ko' ? '1. 음원 관리 & 자동 타임스탬프' : '1. Audio & Timestamps'}</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 ${
              activeTab === 'video'
                ? 'bg-slate-900 text-purple-300 border-purple-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span>{uiLanguage === 'ko' ? '2. 플리 비주얼 & 음악 영상 렌더링' : '2. Video Visualizer & Music Render'}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === 'timestamps' && (
            <div className="space-y-6">
              {/* File Upload Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 border border-purple-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-purple-400" />
                      <span>{uiLanguage === 'ko' ? 'Suno AI 생성 음원 파일 무제한 업로드 (.mp3, .wav, .m4a)' : 'Unlimited Suno Audio Files Upload'}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {uiLanguage === 'ko'
                        ? '음원 수 제한 없이 수십~수백 개의 MP3 파일도 한 번에 연속 추가 가능합니다. 실제 재생 시간을 측정하여 누적 타임스탬프를 자동 계산합니다.'
                        : 'Upload unlimited audio files at once to measure real durations and auto-generate cumulative timestamps.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={handleTogglePlay}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition flex items-center space-x-1.5"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-300" />}
                      <span>{isPlaying ? '음악 일시정지' : '🎵 시범 Lofi 음원 재생'}</span>
                    </button>

                    <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center space-x-2 justify-center">
                      <Upload className="w-4 h-4" />
                      <span>{uiLanguage === 'ko' ? '음원 파일 여러개 (무제한) 선택' : 'Select Audio Files (Unlimited)'}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        multiple
                        onChange={handleAudioFilesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
                  <span className="flex items-center text-amber-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    총 트랙 수: <strong className="text-slate-100 ml-1">{calculatedTracks.length}곡 (무제한)</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center text-cyan-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    예상 총 플리 재생시간: <strong className="text-slate-100 ml-1">{formatTime(totalPlaylistSeconds)}</strong>
                  </span>
                </div>
              </div>

              {/* Tracks List Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <ListMusic className="w-4 h-4 text-purple-400" />
                    <span>{uiLanguage === 'ko' ? '트랙 순서 & 각 곡 재생시간 편집' : 'Tracklist & Durations'}</span>
                  </h3>

                  <div className="flex items-center space-x-2">
                    {tracks.length > 0 && (
                      <button
                        onClick={() => setTracks([])}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-800 hover:border-rose-800 transition flex items-center space-x-1"
                        title="전체 트랙 목록 초기화"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>전체 삭제</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setTracks((prev) => [
                          ...prev,
                          {
                            id: `track-added-${Date.now()}`,
                            trackNumber: prev.length + 1,
                            title: `New Track ${prev.length + 1}`,
                            durationSeconds: 180,
                          },
                        ]);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold border border-slate-700 transition"
                    >
                      + 트랙 추가
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
                  {calculatedTracks.map((track, idx) => (
                    <div
                      key={track.id}
                      className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        currentTrackIndex === idx ? 'bg-purple-950/20' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold font-mono text-purple-300 flex-shrink-0">
                          {track.startTimestamp}
                        </span>

                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={track.title}
                            onChange={(e) => handleUpdateTitle(track.id, e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-800 focus:border-purple-500 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-100 focus:outline-none"
                            placeholder="트랙 제목 입력..."
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 justify-end flex-shrink-0">
                        {/* Play Track Button */}
                        <button
                          onClick={() => {
                            setCurrentTrackIndex(idx);
                            handleTogglePlay();
                          }}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 transition"
                          title="이 곡 재생"
                        >
                          {isPlaying && currentTrackIndex === idx ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-amber-300" />}
                        </button>

                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                          <Clock className="w-3 h-3 text-slate-400 mr-1" />
                          <input
                            type="number"
                            min="1"
                            value={track.durationSeconds}
                            onChange={(e) => handleUpdateDuration(track.id, parseInt(e.target.value) || 1)}
                            className="w-12 bg-transparent text-xs font-mono font-bold text-slate-200 text-center focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500">초</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMoveTrack(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveTrack(idx, 'down')}
                            disabled={idx === tracks.length - 1}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveTrack(track.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* YouTube Description Box with Auto Timestamps */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      유튜브 스튜디오용 자동 타임스탬프 + 영상 설명란 복사
                    </span>
                  </div>

                  <button
                    id="copy-yt-description-btn"
                    onClick={() => copyToClipboard(generateYouTubeDescription(), 'ytDesc')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition"
                  >
                    {copiedField === 'ytDesc' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>설명란 전체 복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>유튜브 설명란 전체 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {generateYouTubeDescription()}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-6">
              {/* Video Visualizer Canvas Studio */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Canvas Visualizer Stage */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-2xl flex items-center justify-center group">
                    <canvas
                      ref={canvasRef}
                      width={1280}
                      height={720}
                      className="w-full h-full object-contain"
                    />

                    {/* Canvas Controls Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-center justify-between gap-3 opacity-90 group-hover:opacity-100 transition">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleTogglePlay}
                          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-600/30"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-100 truncate max-w-[180px] sm:max-w-[280px]">
                            {tracks[currentTrackIndex]?.title || 'Lofi Chill Song'}
                          </p>
                          <span className="text-[10px] text-purple-400 font-mono">
                            Track {currentTrackIndex + 1} / {tracks.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Audio Volume Control */}
                        <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                          <button onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setVolume(val);
                              if (audioRef.current) audioRef.current.volume = val;
                            }}
                            className="w-16 accent-purple-500"
                          />
                        </div>

                        {/* Export Video Button */}
                        {isRecording ? (
                          <button
                            onClick={handleStopRecordVideo}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center space-x-1.5"
                          >
                            <span>⏹️ 렌더링 완료 & MP4 저장</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartRecordVideo(effectiveRecordDuration)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition flex items-center space-x-1.5"
                          >
                            <Film className="w-4 h-4 text-amber-300" />
                            <span>
                              {`음악 영상 렌더링 (${formatTime(effectiveRecordDuration)})`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Recording Bar */}
                  {isRecording && (
                    <div className="p-4 bg-rose-950/50 border border-rose-500/50 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-200">
                        <span className="flex items-center space-x-1.5">
                          <Film className="w-4 h-4 text-rose-400 animate-spin" />
                          <span>🎬 오디오 + 비주얼 MP4 동영상 렌더링 중... ({recordingProgress}%)</span>
                        </span>
                        <button
                          onClick={handleStopRecordVideo}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center space-x-1"
                        >
                          <span>⏹️ 렌더링 완료 & 저장</span>
                        </button>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${recordingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Render Progress & Recorded Video Download */}
                  {recordedVideoUrl && (
                    <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl space-y-3 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                            <Check className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">
                              🎉 오디오 + 비주얼 동영상 렌더링 완료!
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              아래 미리보기 플레이어에서 소리가 정상적으로 나오는지 확인 후 저장하세요.
                            </p>
                          </div>
                        </div>

                        <a
                          href={recordedVideoUrl}
                          download={`playlist_video_${Date.now()}.mp4`}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5 justify-center flex-shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          <span>💾 동영상 파일 MP4 저장</span>
                        </a>
                      </div>

                      {/* Rendered Video Preview Player */}
                      <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-black aspect-video max-h-52">
                        <video
                          src={recordedVideoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Col: Theme & Render Settings */}
                <div className="space-y-4">
                  {/* 1. Loop Visual FX & Camera Motion Engine */}
                  <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-4 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <Repeat className="w-4 h-4 text-purple-400" />
                        <span>🎬 루프 모션 & 비주얼 FX 이펙트</span>
                      </h4>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold px-2 py-0.5 rounded-full border border-purple-500/30">
                        {isCustomVideoBg ? '🎥 비디오 배경 모드' : '✨ 캔버스 FX 활성'}
                      </span>
                    </div>

                    {/* Camera Loop Motion Mode */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                        <span>카메라 루프 모션 (동적 움직임):</span>
                        <span className="text-[10px] text-purple-400 font-mono font-bold">
                          {loopMotion === 'kenburns' && '줌인/숨쉬기'}
                          {loopMotion === 'bass_pulse' && '비트 펄스'}
                          {loopMotion === 'pan' && '좌우 유영'}
                          {loopMotion === 'orbit' && '부드러운 회전'}
                          {loopMotion === 'none' && '정지'}
                        </span>
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { id: 'kenburns', label: '줌인/숨', icon: '🔍' },
                          { id: 'bass_pulse', label: '비트펄스', icon: '💓' },
                          { id: 'pan', label: '좌우유영', icon: '↔️' },
                          { id: 'orbit', label: '회전유영', icon: '🔄' },
                          { id: 'none', label: '정지', icon: '⏹️' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setLoopMotion(item.id as any)}
                            className={`p-1.5 rounded-xl border text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                              loopMotion === item.id
                                ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/50'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-xs">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual FX Overlays */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                        <span>루프 비주얼 FX 오버레이 (특수효과):</span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          {loopFx === 'rain' && '🌧️ 빗물 창가'}
                          {loopFx === 'sakura' && '🌸 벚꽃 흩날림'}
                          {loopFx === 'stars' && '✨ 감성 빛망울'}
                          {loopFx === 'steam' && '☕ 커피 김'}
                          {loopFx === 'aurora' && '🌌 오로라 별빛'}
                          {loopFx === 'vhs' && '📻 레트로 VHS'}
                          {loopFx === 'vinyl' && '📀 회전 LP판'}
                          {loopFx === 'none' && '🚫 없음'}
                        </span>
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'rain', label: '빗물 창가', icon: '🌧️' },
                          { id: 'sakura', label: '벚꽃바람', icon: '🌸' },
                          { id: 'stars', label: '감성빛망울', icon: '✨' },
                          { id: 'steam', label: '커피 김', icon: '☕' },
                          { id: 'aurora', label: '오로라', icon: '🌌' },
                          { id: 'vhs', label: '레트로VHS', icon: '📻' },
                          { id: 'vinyl', label: '회전 LP', icon: '📀' },
                          { id: 'none', label: '효과 없음', icon: '🚫' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setLoopFx(item.id as any)}
                            className={`p-2 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 ${
                              loopFx === item.id
                                ? 'bg-gradient-to-br from-amber-950/60 to-purple-950/60 border-amber-500/80 text-amber-200 shadow-md ring-1 ring-amber-500/50'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-sm">{item.icon}</span>
                            <span className="text-[10px] truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FX Intensity */}
                    {loopFx !== 'none' && (
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-400">FX 이펙트 강도:</span>
                        <div className="flex items-center space-x-1.5">
                          {[
                            { val: 0.5, label: '은은하게 (0.5x)' },
                            { val: 1.0, label: '표준 (1.0x)' },
                            { val: 1.6, label: '선명하게 (1.6x)' },
                          ].map((item) => (
                            <button
                              key={item.val}
                              onClick={() => setLoopFxIntensity(item.val)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                Math.abs(loopFxIntensity - item.val) < 0.1
                                  ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Media / Video Upload */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <label className="flex-1 cursor-pointer block text-center p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-xs font-bold text-purple-200 transition shadow">
                        <span className="flex items-center justify-center space-x-1.5">
                          <Upload className="w-3.5 h-3.5 text-purple-300" />
                          <span>🎥 비디오/움짤/사진 직접 업로드</span>
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/webm,image/gif"
                          onChange={handleMediaUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={() => {
                          setBgType('preset');
                          setIsCustomVideoBg(false);
                        }}
                        className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition"
                      >
                        기본화면
                      </button>
                    </div>
                  </div>

                  {/* 2. AI Video Loop Prompt Center (Runway / Kling / Luma) */}
                  <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>🎬 AI 루프 비디오 프롬프트 생성기</span>
                      </h4>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Runway / Kling / Luma
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      💡 이미지를 <strong>Runway Gen-3, Kling AI, Luma Dream Machine</strong> 등에 넣고 아래 프롬프트를 입력하면 <strong>자연스럽게 무한 반복되는 루프 비디오</strong>가 완성됩니다.
                    </p>

                    <div className="space-y-1.5">
                      <div className="relative">
                        <textarea
                          value={aiVideoLoopPrompt}
                          onChange={(e) => setAiVideoLoopPrompt(e.target.value)}
                          placeholder="AI 비디오 생성용 루프 프롬프트..."
                          className="w-full h-20 p-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none font-mono leading-relaxed"
                        />
                        <button
                          onClick={() => copyToClipboard(aiVideoLoopPrompt, 'videoPrompt')}
                          className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold shadow flex items-center space-x-1 transition"
                        >
                          {copiedField === 'videoPrompt' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-300" />
                              <span>복사됨!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>프롬프트 복사</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Quick AI Loop Preset Prompts */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {[
                          { label: '🌧️ 비창가 루프', p: 'Cinematic 4k infinite loop cinemagraph, cozy rainy cafe window, soft rain drops trickling on glass, warm coffee steam drifting, seamless continuous loop, 60fps' },
                          { label: '🚗 네온 드라이브', p: 'Retro 80s citypop night drive loop, infinite highway perspective, glowing neon taillights trailing, gentle camera drift, seamless looping video' },
                          { label: '🌸 벚꽃 흩날림', p: 'Gentle spring breeze blowing pink cherry blossom petals across screen, warm golden sunset light, seamless 4k loop cinemagraph' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setAiVideoLoopPrompt(preset.p);
                              copyToClipboard(preset.p, 'videoPrompt');
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/40 text-[10px] text-slate-300 font-semibold transition truncate text-center"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. AI Concept Image Generator */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                        <span>🎨 AI 컨셉 배경 이미지 생성</span>
                      </h4>
                      {isGeneratingAiBg && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 animate-pulse font-bold">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          생성 중...
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <textarea
                        value={aiBgPrompt}
                        onChange={(e) => setAiBgPrompt(e.target.value)}
                        placeholder="배경 이미지 프롬프트 입력 (예: 80s retro citypop night drive, neon lights...)"
                        className="w-full h-14 p-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none font-mono"
                      />
                      <button
                        onClick={() => generateAiBackgroundImage()}
                        disabled={isGeneratingAiBg}
                        className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isGeneratingAiBg ? 'AI 배경 이미지 생성 중...' : '✨ 이 프롬프트로 AI 배경 즉시 생성'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Speed, Duration & Optimization Options */}
                  <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
                    <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5 border-b border-slate-800/80 pb-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>⚡ 렌더링 시간 & 화질 설정</span>
                    </h4>

                    {/* Duration Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-semibold block">
                        동영상 렌더링 길이 선택:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => {
                            setRecordMode(15);
                            setIsFullPlaylistMode(false);
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                            !isFullPlaylistMode && recordMode === 15
                              ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow ring-1 ring-rose-500/50'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-amber-300 font-extrabold">⚡ 15초</span>
                          <span className="text-[9px] text-slate-400 font-normal">초고속 샘플</span>
                        </button>

                        <button
                          onClick={() => {
                            setRecordMode(30);
                            setIsFullPlaylistMode(false);
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                            !isFullPlaylistMode && recordMode === 30
                              ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow ring-1 ring-rose-500/50'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>30초</span>
                          <span className="text-[9px] text-slate-400 font-normal">SNS 티저</span>
                        </button>

                        <button
                          onClick={() => {
                            setRecordMode(60);
                            setIsFullPlaylistMode(false);
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                            !isFullPlaylistMode && recordMode === 60
                              ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow ring-1 ring-rose-500/50'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>60초</span>
                          <span className="text-[9px] text-slate-400 font-normal">쇼츠/릴스</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsFullPlaylistMode(true);
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                            isFullPlaylistMode
                              ? 'bg-gradient-to-r from-rose-900/80 to-purple-900/80 border-rose-500 text-rose-100 shadow ring-1 ring-rose-500/50'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-rose-300">🎬 전체 곡</span>
                          <span className="text-[9px] text-slate-400 font-normal">{formatTime(totalPlaylistSeconds || 180)}</span>
                        </button>
                      </div>
                    </div>

                    {/* Speed Multiplier & Resolution */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold block">배속 렌더링:</label>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => setExportSpeed(1)}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold transition ${
                              exportSpeed === 1
                                ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            1x 정속
                          </button>
                          <button
                            onClick={() => setExportSpeed(2)}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold transition flex items-center justify-center space-x-0.5 ${
                              exportSpeed === 2
                                ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>2x 쾌속</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold block">해상도:</label>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => setRenderResolution('480p')}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold transition ${
                              renderResolution === '480p'
                                ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            ⚡ 480p
                          </button>
                          <button
                            onClick={() => setRenderResolution('720p')}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold transition ${
                              renderResolution === '720p'
                                ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            🎬 720p
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Silent Render Toggle */}
                    <div className="pt-1">
                      <button
                        onClick={() => setMuteSpeakerDuringRender(!muteSpeakerDuringRender)}
                        className={`w-full p-2 rounded-xl border text-[11px] font-bold transition flex items-center justify-between ${
                          muteSpeakerDuringRender
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{muteSpeakerDuringRender ? '🔇 백그라운드 무음 렌더링 (권장)' : '🔊 스피커 소리 재생'}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 font-mono">
                          {muteSpeakerDuringRender ? '영상 소리 100% 저장' : '소리 출력'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
