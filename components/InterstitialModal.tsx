'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface InterstitialModalProps {
  /** Path to navigate to when CTA is clicked. Defaults to '/submit' */
  submitPath?: string;
}

export default function InterstitialModal({ submitPath = '/submit' }: InterstitialModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const router = useRouter();

  const showModal = useCallback(() => {
    if (!hasShown) {
      setIsVisible(true);
      setHasShown(true);
    }
  }, [hasShown]);

  useEffect(() => {
    // Don't show if already seen this session
    if (sessionStorage.getItem('interstitial_shown')) return;

    // Trigger 1: 10-second timer
    const timer = setTimeout(() => {
      showModal();
    }, 10000);

    // Trigger 2: 50% scroll depth
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      if (scrollPercent >= 0.5) {
        showModal();
      }
    };

    // Trigger 3: Exit intent (mouse moves toward top of viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        showModal();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
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
    router.push(submitPath);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '2rem 1.75rem 1.75rem',
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          animation: 'fadeInUp 0.2s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: 600,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Time badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#eff6ff',
          color: '#2563EB',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '20px',
          marginBottom: '1rem',
        }}>
          ⏱ 2 minutes
        </div>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'League Spartan', sans-serif",
          fontSize: '22px',
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1.2,
          marginBottom: '0.6rem',
          paddingRight: '2rem',
        }}>
          Got a dating story you&apos;ve never told anyone? 😈
        </h2>

        {/* Subtext */}
        <p style={{
          fontSize: '15px',
          color: '#6b7280',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}>
          Share it anonymously — no name, no judgment, no awkward run-ins.{' '}
          <strong style={{ color: '#111827' }}>Takes 2 minutes.</strong>
        </p>

        {/* Primary CTA */}
        <button
          onClick={handleCTA}
          style={{
            display: 'block',
            width: '100%',
            background: '#2563EB',
            color: '#ffffff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '12px',
            padding: '14px 20px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Tell my story →
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
