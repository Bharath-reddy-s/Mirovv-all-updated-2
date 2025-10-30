import { useEffect, useRef } from 'react';

interface VideoCanvasProps {
  src: string;
  className?: string;
}

export function VideoCanvas({ src, className }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(drawFrame);
    };

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      drawFrame();
    });

    video.play().catch(console.error);

    return () => {
      video.pause();
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className={className}
        data-testid="canvas-video"
      />
    </>
  );
}
