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

interface Banner {
  id: string;
  titulo: string;
  imagem_url: string;
  link_url?: string;
  tipo_midia?: 'imagem' | 'video';
}

export const VideoPlayerWithAd = ({ videoUrl, videoTitle, className }: VideoPlayerWithAdProps) => {
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);

  // Buscar banners para vídeos do canal
  const { data: banners } = useQuery({
    queryKey: ['canal-video-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners_publicitarios')
        .select('id, titulo, imagem_url, link_url, tipo_midia')
        .eq('secao', 'canal_video')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return (data as any) || [];
    },
  });

  const selectedBanner = banners && banners.length > 0 
    ? banners[Math.floor(Math.random() * banners.length)]
    : null;

  useEffect(() => {
    if (isPlaying && selectedBanner) {
      setShowAd(true);
      setAdCountdown(5);
      setCanSkip(false);

      const countdownInterval = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            setCanSkip(true);
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isPlaying, selectedBanner]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleSkipAd = () => {
    setShowAd(false);
  };

  const handleAdClick = () => {
    if (selectedBanner?.link_url) {
      window.open(selectedBanner.link_url, '_blank');
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if ('muted' in videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
      }
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('/embed/')) {
      return url;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const videoId = urlParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
    }
    
    return url;
  };

  const isVideoUrl = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || isYouTubeUrl(url);
  };

  const isAdVideo = selectedBanner?.tipo_midia === 'video' && selectedBanner?.imagem_url && isVideoUrl(selectedBanner.imagem_url);

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className}`}>
      {/* Banner Publicitário */}
      {showAd && selectedBanner && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Banner Content - Video ou Image */}
            <div 
              className="w-full h-full cursor-pointer group relative overflow-hidden"
              onClick={handleAdClick}
            >
              {isAdVideo ? (
                // Vídeo como banner
                <div className="w-full h-full relative">
                  {isYouTubeUrl(selectedBanner.imagem_url) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(selectedBanner.imagem_url) + '&autoplay=1&mute=1&loop=1'}
                      className="w-full h-full object-cover"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={selectedBanner.titulo}
                    />
                  ) : (
                    <video
                      src={selectedBanner.imagem_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ) : (
                // Imagem como banner
                <>
                  <img
                    src={selectedBanner.imagem_url}
                    alt={selectedBanner.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                </>
              )}
            </div>

            {/* Ad Info Badge */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1">
              <p className="text-white text-xs sm:text-sm font-medium">Publicidade</p>
            </div>

            {/* Skip Button */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1">
                <p className="text-white text-xs sm:text-sm text-right sm:text-left">
                  {canSkip ? 'Pular anúncio' : `Aguarde ${adCountdown}s`}
                </p>
              </div>
              {canSkip && (
                <Button
                  onClick={handleSkipAd}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 text-black hover:bg-white text-xs sm:text-sm px-2 py-1 h-auto"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Pular
                </Button>
              )}
            </div>

            {/* Banner Title - Responsive */}
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
              <h3 className="text-white text-sm sm:text-lg font-bold drop-shadow-lg line-clamp-2">
                {selectedBanner.titulo}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Video Content */}
      {!isPlaying ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center group cursor-pointer">
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
            onClick={handlePlay}
          />
          <Button
            onClick={handlePlay}
            className="absolute z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 hover:bg-white text-black hover:scale-110 transition-all duration-300"
            size="icon"
          >
            <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" fill="currentColor" />
          </Button>
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-10">
            <h4 className="text-white text-xs sm:text-sm font-medium drop-shadow-lg line-clamp-2">
              {videoTitle}
            </h4>
          </div>
        </div>
      ) : !showAd ? (
        <div className="w-full h-full relative">
          {isYouTubeUrl(videoUrl) ? (
            <iframe
              ref={videoRef as React.RefObject<HTMLIFrameElement>}
              src={getYouTubeEmbedUrl(videoUrl)}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={videoTitle}
            />
          ) : (
            <>
              <video
                ref={videoRef as React.RefObject<HTMLVideoElement>}
                src={videoUrl}
                controls
                autoPlay
                muted={isMuted}
                className="w-full h-full"
                preload="metadata"
              />
              <Button
                onClick={toggleMute}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 hover:bg-black/70 text-white"
                size="icon"
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};