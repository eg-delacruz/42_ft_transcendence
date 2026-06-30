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
    width: 'min(1380px, 100%)',
    height: 'calc(100vh - 32px)',
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '10px',
    background: '#111827',
    display: 'grid',
    gridTemplateRows: '52px 132px minmax(0, 1fr) 104px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 18px 40px rgba(0, 0, 0, 0.32)',
  },

  topHud: {
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0 28px',
    boxSizing: 'border-box',
  },

  topHudPlayerBlock: {
    display: 'none',
  },

  topHudPlayerName: {
    display: 'none',
  },

  topHudPlayerScore: {
    display: 'none',
  },

  combatHud: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 360px) 150px minmax(260px, 360px)',
    alignItems: 'start',
    justifyContent: 'center',
    columnGap: '56px',
    padding: '18px 56px 0',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
  },

  fighterStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px',
    width: '100%',
    minWidth: 0,
  },

  fighterStatusRight: {
    alignItems: 'center',
  },

  fighterLabel: {
    margin: 0,
    fontSize: '23px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    width: '100%',
    textAlign: 'center',
  },

  fighterScore: {
    color: '#e5e7eb',
    fontSize: '14px',
    letterSpacing: '0.08em',
  },

  playerLabel: {
    color: '#60a5fa',
  },

  rivalLabel: {
    color: '#f87171',
  },

  grabLabel: {
    color: '#4ade80',
  },

  dodgeLabel: {
    color: '#a78bfa',
  },

  healthTrack: {
    width: '100%',
    height: '32px',
    border: '2px solid rgba(255, 255, 255, 0.32)',
    borderRadius: '8px',
    background: '#0f172a',
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '4px',
  },

  healthBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 160ms linear',
  },

  playerHealthBar: {
    background: '#3b82f6',
  },

  rivalHealthBar: {
    background: '#ef4444',
  },

  clockArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px',
    width: '150px',
  },

  clockBox: {
    width: '120px',
    height: '90px',
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '8px',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    color: '#f8fafc',
  },

  clockLabel: {
    margin: 0,
    fontSize: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#f8fafc',
  },

  clockNumber: {
    margin: 0,
    fontSize: '46px',
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: '0.08em',
    color: '#f8fafc',
  },

  roundText: {
    margin: 0,
    fontSize: '13px',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },

  arena: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px 1fr',
    alignItems: 'center',
    justifyItems: 'center',
    gap: '36px',
    padding: '10px 56px 16px',
    boxSizing: 'border-box',
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    minHeight: 0,
  },

  decisionSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    justifySelf: 'center',
    textAlign: 'center',
    width: '100%',
  },

  decisionIcon: {
    margin: 0,
    fontSize: '86px',
    lineHeight: 1,
    color: '#f8fafc',
  },

  decisionName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: '0.06em',
    color: '#f8fafc',
  },

  decisionStreak: {
    margin: 0,
    fontSize: '16px',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  centerArenaMessage: {
    minHeight: '150px',
    alignSelf: 'center',
    justifySelf: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '12px',
    padding: '0 8px',
    width: '100%',
  },

  phaseTitle: {
    margin: 0,
    fontSize: '26px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    color: '#f8fafc',
    textAlign: 'center',
  },

  text: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '16px',
    lineHeight: 1.35,
    textAlign: 'center',
  },

  resultMessage: {
    margin: 0,
    color: '#e5e7eb',
    textAlign: 'center',
    fontSize: '18px',
    lineHeight: 1.35,
    maxWidth: '240px',
  },

  actionGuide: {
    width: 'calc(100% - 64px)',
    minHeight: '84px',
    alignSelf: 'center',
    justifySelf: 'center',
    border: '2px solid rgba(255, 255, 255, 0.28)',
    borderRadius: '8px',
    background: '#0f172a',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 20px',
    boxSizing: 'border-box',
    margin: '8px auto',
  },

  actionGuideItem: {
    display: 'grid',
    gridTemplateColumns: '58px 1fr',
    alignItems: 'center',
    gap: '14px',
    minWidth: 0,
  },

  keyBox: {
    width: '56px',
    height: '56px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    background: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '38px',
    lineHeight: 1,
    boxSizing: 'border-box',
    color: '#f8fafc',
  },

  actionGuideText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },

  actionName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  actionRule: {
    margin: 0,
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#f8fafc',
    lineHeight: 1.35,
  },

  actionRuleKeyword: {
    fontWeight: 700,
  },

  hiddenControlsInfo: {
    display: 'none',
  },

  controlsText: {
    margin: 0,
    fontSize: '16px',
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

  winnerText: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: '#4ade80',
  },
};