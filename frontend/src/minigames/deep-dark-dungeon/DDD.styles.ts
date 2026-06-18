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
    width: 'min(1100px, 95vw)',
    display: 'grid',
    gap: '18px',
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
    fontSize: '44px',
  },
  subtitle: {
    margin: 0,
    color: '#d4d4d8',
  },
  statusBox: {
    minHeight: '160px',
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  phaseTitle: {
    margin: 0,
    fontSize: '28px',
  },
  bigNumber: {
    margin: 0,
    fontSize: '56px',
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
  sectionTitle: {
    margin: '0 0 8px',
    fontSize: '22px',
  },
  classOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    width: '100%',
    maxWidth: '520px',
  },
  classCard: {
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    background: '#101018',
    padding: '12px',
    textAlign: 'center',
  },
  classKey: {
    margin: 0,
    color: '#a1a1aa',
    fontSize: '16px',
  },
  classIcon: {
    margin: '6px 0',
    fontSize: '36px',
  },
  className: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
  },
  playerBox: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
  },
  roomBox: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
    textAlign: 'center',
  },
  roomIcon: {
    margin: 0,
    fontSize: '56px',
  },
  roomName: {
    margin: '8px 0 0',
    fontSize: '30px',
    fontWeight: 700,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
  },
  card: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
    minHeight: '140px',
    textAlign: 'center',
  },
  cardKey: {
    margin: 0,
    color: '#a1a1aa',
    fontSize: '14px',
  },
  cardIcon: {
    margin: '8px 0',
    fontSize: '56px',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
  },
  effectIcons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '28px',
    marginTop: '12px',
  },
  resultBox: {
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '18px',
    textAlign: 'center',
  },
};