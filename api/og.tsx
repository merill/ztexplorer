import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const PILLARS: Record<string, { name: string; color: string }> = {
  identity:       { name: 'Identity',            color: '#3b82f6' },
  devices:        { name: 'Devices',             color: '#8b5cf6' },
  data:           { name: 'Data',                color: '#06b6d4' },
  network:        { name: 'Network',             color: '#10b981' },
  infrastructure: { name: 'Infrastructure',      color: '#f59e0b' },
  'security-ops': { name: 'Security Operations', color: '#ef4444' },
  ai:             { name: 'AI',                  color: '#ec4899' },
};

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '';
  const pillarId = searchParams.get('pillar') || '';

  let title = 'Zero Trust Framework Explorer';
  let subtitle = 'Interactive explorer for Microsoft\'s Zero Trust Workshop';
  let accentColor = '#0078d4';

  if (page === 'book') {
    title = 'Zero Trust Deployment Book';
    subtitle = 'Step-by-step guide to deploying Microsoft Zero Trust';
  } else if (page === 'about') {
    title = 'About';
    subtitle = 'Zero Trust Framework Explorer';
  } else if (page === 'pillar' && PILLARS[pillarId]) {
    const pillar = PILLARS[pillarId];
    title = `${pillar.name} Pillar`;
    subtitle = 'Zero Trust Framework Explorer';
    accentColor = pillar.color;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          backgroundColor: '#0f172a',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(90deg, ${accentColor}, #06b6d4)`,
          }}
        />

        {/* Microsoft logo placeholder */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {/* Microsoft 4-square logo */}
          <div style={{ display: 'flex', flexWrap: 'wrap', width: '36px', height: '36px', gap: '2px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#f25022' }} />
            <div style={{ width: '16px', height: '16px', backgroundColor: '#7fba00' }} />
            <div style={{ width: '16px', height: '16px', backgroundColor: '#00a4ef' }} />
            <div style={{ width: '16px', height: '16px', backgroundColor: '#ffb900' }} />
          </div>
          <span style={{ color: '#94a3b8', fontSize: '24px' }}>Microsoft Zero Trust</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#f1f5f9',
            lineHeight: 1.1,
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            maxWidth: '800px',
          }}
        >
          {subtitle}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '80px',
            fontSize: '22px',
            color: '#475569',
          }}
        >
          zerotrustexplorer.merill.net
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
