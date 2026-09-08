import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Términos de Servicio</h1>
      <p>Última actualización: August 2026</p>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>1. Aceptación de los términos</h2>
        <p>
          Al acceder y utilizar esta aplicación, aceptas cumplir con los presentes términos y condiciones de servicio.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>2. Conducta del usuario</h2>
        <p>
          Queda prohibido cualquier comportamiento abusivo, trampas dentro del juego o uso malintencionado de las funcionalidades del sistema.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>3. Cuentas y Puntos</h2>
        <p>
          Los puntos o monedas asignados dentro de la aplicación son virtuales y carecen de valor monetario real. El sistema se reserva el derecho de modificar o resetear puntuaciones en caso de fallos o conductas antideportivas.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;