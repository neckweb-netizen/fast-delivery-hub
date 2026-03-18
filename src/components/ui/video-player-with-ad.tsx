import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerWithAdProps {
  videoUrl: string;
  videoTitle: string;
  className?: string;
}

export const VideoPlayerWithAd = ({ videoUrl, videoTitle, className }: VideoPlayerWithAdProps) => {
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);

  // Buscar banners para vídeos
  const { data: banners } = useQuery({
    queryKey: ['canal-video-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const selectedBanner = banners && banners.length > 0 
    ? banners[Math.floor(Math.random() * banners.length)]
    : null;

  const isAdVideo = false;

  useEffect(() => {
    if (selectedBanner) {
      setShowAd(true);
      setIsPlaying(false);
      setAdCountdown(5);
      setCanSkip(false);
    }
  }, [selectedBanner]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (showAd && adCountdown > 0) {
      countdownInterval = setTimeout(() => {
        setAdCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);
    } else if (showAd && adCountdown === 0) {
      setCanSkip(true);
    }

    return () => clearTimeout(countdownInterval);
  }, [showAd, adCountdown]);

  const handleSkipAd = () => {
    setShowAd(false);
    setIsPlaying(true);
    if (videoRef.current instanceof HTMLVideoElement) {
      videoRef.current.play();
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current instanceof HTMLVideoElement) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current instanceof HTMLVideoElement) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {showAd && selectedBanner ? (
        <div className="relative">
          <a href={selectedBanner.link || selectedBanner.link_url} target="_blank" rel="noopener noreferrer">
            <img
              src={selectedBanner.imagem_url}
              alt={selectedBanner.titulo}
              className="w-full rounded-md aspect-video object-cover"
            />
          </a>
          <div className="absolute top-2 right-2 flex space-x-2">
            {canSkip ? (
              <Button size="sm" onClick={handleSkipAd}>
                <X className="w-4 h-4 mr-2" />
                Pular Anúncio
              </Button>
            ) : (
              <Button size="sm" disabled>
                Pular em {adCountdown}s
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            title={videoTitle}
            className="w-full rounded-md aspect-video object-cover"
            muted={isMuted}
            loop
            onClick={togglePlay}
            playsInline
          />
          <div className="absolute bottom-2 left-2 flex space-x-2">
            <Button size="sm" onClick={togglePlay}>
              {isPlaying ? <Play className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
