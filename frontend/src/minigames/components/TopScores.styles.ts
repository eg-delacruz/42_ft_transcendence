import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    position: 'fixed',
    top: '12px',
    right: '12px',
    zIndex: 50,
    width: '220px',
    border: '1px solid #3f3f46',
    borderRadius: '10px',
    background: 'rgba(16, 16, 24, 0.92)',
    padding: '8px 10px',
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#d4d4d8',
    pointerEvents: 'none',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#f4f4f5',
    textAlign: 'center',
  },
  list: {
    display: 'grid',
    gap: '2px',
  },
  row: {
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  firstRow: {
    color: '#facc15',
    fontWeight: 700,
  },
  text: {
    margin: 0,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  errorText: {
    margin: 0,
    color: '#fca5a5',
    textAlign: 'center',
  },
};