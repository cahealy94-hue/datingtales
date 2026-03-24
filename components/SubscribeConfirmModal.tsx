'use client';

interface SubscribeConfirmModalProps {
  onClose: () => void;
  onGoToLibrary: () => void;
}

const TEASER_STORY = {
  theme: 'Situationships',
  themeColor: { bg: '#E0F2FE', color: '#0369A1' },
  title: 'The Label Conversation',
  text: 'After four months of "hanging out" I finally asked where we stood. He said "I really like what we have." I said "what do we have?" He said "this conversation is a great example."',
  author: 'Hopeless Romantic',
  reactions: { '😂': 134, '😬': 89, '💀': 67 },
};

export default function SubscribeConfirmModal({ onClose, onGoToLibrary }: SubscribeConfirmModalProps) {
  const handleCTA = () => {
    onClose();
    onGoToLibrary();
  };

  const handleTeaserClick = () => {
    onClose();
    onGoToLibrary();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff', borderRadius: '20px',
          padding: '2rem 1.75rem 1.75rem', width: '100%',
          maxWidth: '440px', position: 'relative',
          animation: 'fadeInUp 0.2s ease-out',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '14px', right: '14px',
            width: '30px', height: '30px', borderRadius: '50%',
            background: '#f3f4f6', border: 'none', cursor: 'pointer',
            fontSize: '14px', color: '#6b7280', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Headline */}
        <div style={{
          fontFamily: "'League Spartan', sans-serif", fontSize: '26px',
          fontWeight: 800, color: '#111827', lineHeight: 1.15,
          marginBottom: '0.5rem', paddingRight: '2rem',
        }}>
          Buckle up. The best worst dates await.
        </div>

        {/* Subtext */}
        <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Every week, fresh anonymous dating stories straight to your inbox — real, unfiltered, and occasionally unhinged.
        </p>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #f3f4f6', margin: '1.25rem 0' }} />

        {/* What happens next */}
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.75rem' }}>
          What happens next
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.85rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px' }}>📬</div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Check your inbox</p>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>A welcome email is on its way with a sneak peek of what we&apos;re about.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px' }}>📖</div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Browse this week&apos;s stories</p>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>Read what everyone else is too embarrassed to say out loud.</p>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleCTA}
          style={{
            display: 'block', width: '100%', background: '#2563EB',
            color: '#ffffff', fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px', fontWeight: 600, border: 'none',
            borderRadius: '12px', padding: '14px 20px',
            cursor: 'pointer', textAlign: 'center', marginBottom: '1.25rem',
          }}
        >
          Read this week&apos;s stories →
        </button>

        {/* Story teaser */}
        <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 0 1rem' }} />
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.75rem' }}>
          A taste of what&apos;s inside
        </p>

        <div
          onClick={handleTeaserClick}
          style={{
            background: '#f9fafb', border: '1.5px solid #e5e7eb',
            borderRadius: '14px', padding: '16px',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563EB')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        >
          <span style={{
            display: 'inline-block', fontSize: '11px', fontWeight: 700,
            padding: '4px 12px', borderRadius: '100px', marginBottom: '10px',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            background: TEASER_STORY.themeColor.bg, color: TEASER_STORY.themeColor.color,
          }}>
            {TEASER_STORY.theme}
          </span>

          <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '6px', lineHeight: 1.3 }}>
            {TEASER_STORY.title}
          </p>

          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.55, marginBottom: '10px' }}>
            {TEASER_STORY.text.slice(0, 120)}...
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {Object.entries(TEASER_STORY.reactions).map(([emoji, count]) => (
                <span key={emoji} style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                  {emoji} {count}
                </span>
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>Read more →</span>
          </div>
        </div>
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
