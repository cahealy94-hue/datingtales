'use client';

import { useEffect, useState, useCallback } from 'react';

interface InterstitialModalProps {
  onCTA: () => void;
}

export default function InterstitialModal({ onCTA }: InterstitialModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const showModal = useCallback(() => {
    if (!hasShown) {
      setIsVisible(true);
      setHasShown(true);
    }
  }, [hasShown]);

  useEffect(() => {
    if (sessionStorage.getItem('interstitial_shown')) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => { showModal(); }, 10000);
    };

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollTop / docHeight >= 0.5) showModal();
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) showModal();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showModal]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('interstitial_shown', 'true');
  };

  const handleCTA = () => {
    handleClose();
    onCTA();
  };

  if (!isVisible) return null;

  return (
    <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem 1.75rem 1.75rem', width: '100%', maxWidth: '420px', position: 'relative', animation: 'fadeInUp 0.2s ease-out' }}>
        <button onClick={handleClose} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', width: '30px', height: '30px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', fontWeight: 600, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#eff6ff', color: '#2563EB', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', marginBottom: '1rem' }}>⏱ 2 minutes</div>
        <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: '22px', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: '0.6rem', paddingRight: '2rem' }}>Got a dating story you&apos;ve never told anyone? 😈</h2>
        <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.5rem' }}>Share it anonymously — no name, no judgment, no awkward run-ins.{' '}<strong style={{ color: '#111827' }}>Takes 2 minutes.</strong></p>
        <button onClick={handleCTA} style={{ display: 'block', width: '100%', background: '#2563EB', color: '#ffffff', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 600, border: 'none', borderRadius: '12px', padding: '14px 20px', cursor: 'pointer', textAlign: 'center' }}>Tell my story →</button>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
