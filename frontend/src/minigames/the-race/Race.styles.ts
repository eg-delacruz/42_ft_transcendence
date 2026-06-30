import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  page: {
    width: '100%',
    minHeight: '100vh',
    background: '#0b1020',
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    padding: '16px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  },

  board: {
    width: 'min(1480px, 100%)',
    height: 'calc(100vh - 32px)',
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '10px',
    background: '#111827',
    display: 'grid',
    gridTemplateColumns: '240px minmax(0, 1fr) 260px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 18px 40px rgba(0, 0, 0, 0.32)',
  },

  leftHud: {
    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
    padding: '72px 18px 18px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    background: '#0f172a',
  },

  hudCard: {
    minHeight: '110px',
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '10px',
    background: '#111827',
    padding: '18px',
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: '54px 1fr',
    alignItems: 'center',
    gap: '14px',
  },

  hudIcon: {
    width: '46px',
    height: '46px',
    border: '2px solid rgba(255, 255, 255, 0.32)',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    color: '#e5e7eb',
  },

  hudTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
  },

  hudLabel: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '18px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  hudValue: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },

  controlsCard: {
    marginTop: 'auto',
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '10px',
    background: '#111827',
    padding: '18px',
    boxSizing: 'border-box',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },

  controlsTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '18px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  controlsKey: {
    width: '62px',
    height: '62px',
    margin: 0,
    border: '2px solid rgba(255, 255, 255, 0.32)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '42px',
    color: '#f8fafc',
    background: '#0f172a',
  },

  controlsText: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '14px',
    lineHeight: 1.35,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  trackArea: {
    position: 'relative',
    minWidth: 0,
    overflow: 'hidden',
    background: '#111827',
  },

  track: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    background:
      'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.09) 0 1px, transparent 2px), radial-gradient(circle at 88% 78%, rgba(255,255,255,0.08) 0 1px, transparent 2px), #111827',
  },

  trackLine: {
    position: 'absolute',
    top: '12%',
    bottom: '12%',
    width: '0',
    borderLeft: '2px dashed rgba(255, 255, 255, 0.28)',
  },

  runnerLaneLeft: {
    left: '36%',
  },

  runnerLaneRight: {
    left: '58%',
  },

  runner: {
    position: 'absolute',
    transform: 'translate(-50%, 50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'bottom 120ms linear',
    zIndex: 4,
  },

  runnerHead: {
    width: '24px',
    height: '24px',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '999px',
    boxSizing: 'border-box',
    marginBottom: '-8px',
    zIndex: 2,
  },

  blueRunner: {
    background: '#3b82f6',
  },

  redRunner: {
    background: '#ef4444',
  },

  horseBody: {
    margin: 0,
    fontSize: '72px',
    lineHeight: 1,
    color: '#f8fafc',
    textShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
  },

  runnerName: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  decoration: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.28)',
    fontSize: '42px',
    lineHeight: 1,
    pointerEvents: 'none',
  },

  decorationTopLeft: {
    left: '6%',
    top: '15%',
  },

  decorationBottomLeft: {
    left: '8%',
    bottom: '18%',
  },

  decorationTopRight: {
    right: '7%',
    top: '16%',
  },

  decorationBottomRight: {
    right: '8%',
    bottom: '16%',
  },

  rightPanel: {
    borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
    padding: '72px 18px 18px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    background: '#0f172a',
  },

  raceInfoCard: {
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '10px',
    background: '#111827',
    padding: '18px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  raceInfoTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '18px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  raceInfoValue: {
    margin: 0,
    color: '#4ade80',
    fontSize: '34px',
    fontWeight: 900,
    letterSpacing: '0.08em',
  },

  raceInfoText: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '15px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  statusFloatingBox: {
    position: 'absolute',
    left: '50%',
    top: '36px',
    transform: 'translateX(-50%)',
    minWidth: '260px',
    minHeight: '110px',
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.92)',
    padding: '18px 24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textAlign: 'center',
    zIndex: 8,
    boxShadow: '0 16px 34px rgba(0, 0, 0, 0.28)',
  },

  phaseTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '24px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  bigNumber: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '48px',
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: '0.08em',
  },

  text: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '15px',
    lineHeight: 1.35,
    textAlign: 'center',
  },

  winnerText: {
    margin: 0,
    color: '#4ade80',
    fontSize: '26px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  finishedOverlay: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(520px, 90%)',
    minHeight: '220px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.96)',
    padding: '28px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    textAlign: 'center',
    boxShadow: '0 18px 38px rgba(0, 0, 0, 0.35)',
    zIndex: 10,
  },
};