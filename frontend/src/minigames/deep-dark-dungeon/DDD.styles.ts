import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  /*
   * ============================================================
   * PÁGINA PRINCIPAL
   * ============================================================
   */

  page: {
    width: '100%',
    minHeight: '100vh',
    background: '#101018',
    color: '#f4f4f5',
    fontFamily: 'monospace',
    padding: '36px 48px 40px',
    boxSizing: 'border-box',
    position: 'relative',
  },

  board: {
    width: 'min(1280px, 100%)',
    minHeight: 'calc(100vh - 80px)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '28px',
  },

  /*
   * ============================================================
   * CABECERA
   * ============================================================
   */

  header: {
    textAlign: 'center',
    marginTop: '24px',
    marginBottom: '4px',
  },

  kicker: {
    margin: 0,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.28em',
    fontSize: '14px',
  },

  title: {
    margin: '8px 0 4px',
    fontSize: '40px',
    lineHeight: 1,
  },

  subtitle: {
    margin: 0,
    color: '#e4e4e7',
    fontSize: '16px',
  },

  /*
   * ============================================================
   * ZONA SUPERIOR
   * ============================================================
   */

  topGameArea: {
    display: 'grid',
    gridTemplateColumns: '360px minmax(520px, 1fr)',
    alignItems: 'start',
    gap: '32px',
    width: '100%',
  },

  /*
   * ============================================================
   * HUD DEL JUGADOR
   * ============================================================
   */

  playerHud: {
    width: '100%',
    minHeight: '260px',
    border: '2px solid #d4d4d8',
    borderRadius: '6px',
    background: 'rgba(24, 24, 31, 0.92)',
    padding: '18px 22px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04)',
  },

  hudRow: {
    display: 'grid',
    gridTemplateColumns: '118px 1fr',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.28)',
    paddingBottom: '10px',
  },

  hudLabel: {
    color: '#f4f4f5',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: '18px',
    fontWeight: 700,
  },

  hudValue: {
    color: '#f4f4f5',
    fontSize: '18px',
    fontWeight: 700,
  },

  hearts: {
    color: '#ef4444',
    fontSize: '22px',
    letterSpacing: '0.16em',
    lineHeight: 1,
    textShadow: '0 1px 0 #000',
  },

  /*
   * ============================================================
   * RETO ACTIVO
   * ============================================================
   */

  challengeArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    minHeight: '320px',
  },

  challengeLabel: {
    display: 'none',
  },

  challengeCard: {
    width: '560px',
    minHeight: '320px',
    border: '2px solid #d4d4d8',
    borderRadius: '8px',
    background: 'rgba(24, 24, 31, 0.92)',
    padding: '10px',
    boxSizing: 'border-box',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04)',
  },

  /*
   * Imagen de Combate / Trampa / Pasillo.
   *
   * Para hacerla más grande o pequeña, cambia width.
   */

  roomImage: {
    display: 'block',
    width: '300px',
    maxHeight: '310px',
    height: 'auto',
    objectFit: 'contain',
    margin: '0 auto',
  },

  bettingChallengeCard: {
    width: 'min(780px, 100%)',
    minHeight: '320px',
    border: '2px solid #d4d4d8',
    borderRadius: '8px',
    background: 'rgba(24, 24, 31, 0.92)',
    padding: '24px 32px',
    boxSizing: 'border-box',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: '18px',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04)',
  },

  bettingContent: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    alignItems: 'center',
    gap: '30px',
    width: '100%',
  },

  bettingCountdownBox: {
    minHeight: '190px',
    paddingRight: '26px',
    borderRight: '1px solid rgba(255, 255, 255, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },

  bettingCountdownLabel: {
    margin: 0,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontSize: '13px',
    fontWeight: 700,
  },

  bettingDescriptionBox: {
    width: '100%',
    textAlign: 'left',
  },

  bettingDescription: {
    margin: 0,
    color: '#f4f4f5',
    fontSize: '16px',
    lineHeight: 1.55,
    textAlign: 'left',
  },

  challengeTitle: {
    width: '100%',
    margin: 0,
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: '28px',
    lineHeight: 1.1,
  },

  challengeDescription: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    color: '#f4f4f5',
    fontSize: '12px',
    lineHeight: 1.5,
    textAlign: 'center',
  },

  challengeTimer: {
    margin: '6px 0 0',
    color: '#facc15',
    fontSize: '15px',
    fontWeight: 700,
  },

  resultText: {
    margin: '4px 0 0',
    color: '#a7f3d0',
    fontSize: '15px',
    lineHeight: 1.4,
  },

  /*
   * ============================================================
   * DIVISOR
   * ============================================================
   */

  boardDivider: {
    width: '100%',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.65)',
    margin: '2px 0',
  },

  /*
   * ============================================================
   * ZONA INFERIOR
   * ============================================================
   */

  bottomGameArea: {
    width: '100%',
    minHeight: '330px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomMessageBox: {
    width: 'min(720px, 100%)',
    minHeight: '180px',
    border: '2px solid #3f3f46',
    borderRadius: '16px',
    background: '#18181f',
    padding: '28px',
    boxSizing: 'border-box',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },

  phaseTitle: {
    margin: 0,
    fontSize: '30px',
    lineHeight: 1.1,
  },

  bigNumber: {
    margin: 0,
    fontSize: '64px',
    lineHeight: 1,
    fontWeight: 700,
  },

  text: {
    margin: 0,
    color: '#d4d4d8',
    fontSize: '16px',
    lineHeight: 1.45,
  },

  winnerText: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: '#facc15',
  },

  /*
   * ============================================================
   * SELECCIÓN DE CLASE
   * ============================================================
   */

  classSelectionArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '18px',
  },

  classOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 220px)',
    justifyContent: 'center',
    gap: '24px',
    width: '100%',
  },

  classCard: {
    minHeight: '190px',
    border: '2px solid #3f3f46',
    borderRadius: '14px',
    background: '#18181f',
    padding: '18px',
    boxSizing: 'border-box',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

  classKey: {
    margin: 0,
    color: '#a1a1aa',
    fontSize: '16px',
  },

  classIcon: {
    margin: 0,
    fontSize: '46px',
    lineHeight: 1,
  },

  className: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
  },

  /*
   * Este estilo sigue utilizándose para
   * "Clases disponibles".
   */

  handSideLabel: {
    margin: 0,
    color: '#f4f4f5',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1.4,
    textAlign: 'center',
    whiteSpace: 'pre-line',
  },

  /*
   * ============================================================
   * CARTAS DEL JUGADOR
   * ============================================================
   */

  handArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '18px',
  },

  cards: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 220px)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
  },

  /*
   * Ya no construimos la carta con HTML.
   * El PNG es la carta completa.
   */

  gameCard: {
    width: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
  },

  gameCardImage: {
    display: 'block',
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  },

  controlsHint: {
    margin: 0,
    color: '#f4f4f5',
    fontSize: '16px',
    letterSpacing: '0.08em',
    textAlign: 'center',
  },

  /*
   * ============================================================
   * TUTORIAL VISUAL
   * ============================================================
   */

  tutorialArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center',
  },

  tutorialGrid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '24px',
    alignItems: 'stretch',
  },

  tutorialCard: {
    minWidth: 0,
    border: '1px solid #3f3f46',
    borderRadius: '14px',
    background: '#18181f',
    padding: '18px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },

  tutorialTitle: {
    margin: 0,
    color: '#f4f4f5',
    fontSize: '20px',
    fontWeight: 700,
  },

  tutorialText: {
    margin: 0,
    color: '#d4d4d8',
    fontSize: '14px',
    lineHeight: 1.5,
  },

  tutorialImage: {
    display: 'block',
    width: '100%',
    height: 'auto',
    margin: '8px auto 0',
    objectFit: 'contain',
  },

  tutorialEscape: {
    width: '100%',
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    background: '#18181f',
    padding: '14px 18px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
  },
};