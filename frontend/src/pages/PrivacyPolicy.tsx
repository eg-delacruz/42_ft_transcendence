import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Política de Privacidad</h1>
      <p>Última actualización: August 2026</p>
      
      <section style={{ marginTop: '1.5rem' }}>
        <h2>1. Información que recopilamos</h2>
        <p>
          Recopilamos información básica para el correcto funcionamiento de la plataforma, como tu nombre de usuario, dirección de correo electrónico y datos del perfil dentro del juego.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>2. Uso de la información</h2>
        <p>
          Utilizamos la información recopilada para gestionar las sesiones de usuario, llevar el registro de puntuaciones y mantener las estadísticas dentro del juego.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>3. Protección de datos</h2>
        <p>
          Tus credenciales se almacenan de forma segura y encriptada mediante algoritmos modernos. No compartimos tus datos con terceros.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;