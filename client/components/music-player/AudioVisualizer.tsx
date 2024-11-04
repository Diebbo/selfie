import React, { useEffect, useRef } from 'react';
import AudioMotionAnalyzer from 'audiomotion-analyzer';

interface AudioVisualizerProps {
  audio: HTMLAudioElement | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audio }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const analyzerRef = useRef<AudioMotionAnalyzer | null>(null);

  useEffect(() => {
    if (containerRef.current && audio) {
      analyzerRef.current = new AudioMotionAnalyzer(containerRef.current, {
        source: audio,
        height: window.innerHeight,
        width: window.innerWidth,
        bgAlpha: 0,
        showScaleY: false,
		showScaleX: false,
        showPeaks: true,
        smoothing: 0.5,
        showBgColor: true,
        overlay: true,
        lumiBars: true,
        reflexRatio: 0,
        reflexAlpha: 0.15,
        reflexBright: 1,
        reflexFit: true,
        gradient: 'rainbow',
        barSpace: 0.1,
        maxFreq: 14000,
        minFreq: 30,
		colorMode: 'gradient',
		frequencyScale: 'mel',
		radial: false,
		
      });

      const handleResize = () => {
        analyzerRef.current?.setCanvasSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        analyzerRef.current?.destroy();
      };
    }
  }, [audio]);

  return <div ref={containerRef} style={{ 
    position: 'fixed', 
    left: 0, 
    bottom: 0, 
    width: '100%', 
    height: '100%', 
    zIndex: 0 
  }} />;
};

export default AudioVisualizer;