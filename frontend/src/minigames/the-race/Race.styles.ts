import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  page: {
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    background: '#101018',
    color: '#f4f4f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    padding: '32px',
    boxSizing: 'border-box',
  },
  panel: {
    width: 'min(1000px, 95vw)',
    display: 'grid',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
  },
  kicker: {
    margin: 0,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
  },
  title: {
    margin: '8px 0',
    fontSize: '56px',
  },
  subtitle: {
    margin: 0,
    color: '#d4d4d8',
  },
  statusBox: {
    minHeight: '180px',
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  phaseTitle: {
    margin: 0,
    fontSize: '28px',
  },
  bigNumber: {
    margin: 0,
    fontSize: '72px',
    fontWeight: 700,
  },
  text: {
    margin: 0,
    color: '#d4d4d8',
  },
  winnerText: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
  },
  players: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '24px',
  },
  playerCard: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '24px',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px',
  },
  playerName: {
    margin: 0,
    fontSize: '24px',
  },
  playerScore: {
    fontSize: '18px',
    color: '#d4d4d8',
  },
  track: {
    width: '100%',
    height: '32px',
    borderRadius: '999px',
    background: '#27272f',
    overflow: 'hidden',
    border: '1px solid #52525b',
  },
  progressBar: {
    height: '100%',
    background: '#f4f4f5',
    transition: 'width 80ms linear',
  },
};