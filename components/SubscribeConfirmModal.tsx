'use client';

import { useRouter } from 'next/navigation';

interface SubscribeConfirmModalProps {
  onClose: () => void;
  /** Path to the story library. Defaults to '/stories' */
  storiesPath?: string;
}

export default function SubscribeConfirmModal({
  onClose,
  storiesPath = '/stories',
}: SubscribeConfirmModalProps) {
  const router = useRouter();

  const handleCTA = () => {
    onClose();
    router.push(storiesPath);
  };

  return (
    <div
      onClick={onClose}
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
          onClick={onClose}
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

        {/* Headline */}
        <h2 style={{
          fontFamily: "'League Spartan', sans-serif",
          fontSize: '24px',
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1.2,
          marginBottom: '0.6rem',
          paddingRight: '2rem',
        }}>
          The best worst dates start now.
        </h2>

        {/* Subtext */}
        <p style={{
          fontSize: '15px',
          color: '#6b7280',
          lineHeight: 1.6,
          marginBottom: '1.25rem',
        }}>
          Every week, fresh anonymous dating stories straight to your inbox — real, unfiltered, and occasionally unhinged.
        </p>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #f3f4f6', margin: '1.25rem 0' }} />

        {/* What happens next */}
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#9ca3af',
          marginBottom: '0.75rem',
        }}>
          What happens next
        </p>

        {/* Step 1 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.85rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#eff6ff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, fontSize: '15px',
          }}>
            📬
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
              Check your inbox
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
              A welcome email is on its way with a sneak peek of what we&apos;re about.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.5rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#eff6ff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, fontSize: '15px',
          }}>
            📖
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
              Browse this week&apos;s stories
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
              Read what everyone else is too embarrassed to say out loud.
            </p>
          </div>
        </div>

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
          Read this week&apos;s stories →
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
