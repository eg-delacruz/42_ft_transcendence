import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
		<div className="max-w-3xl h-auto my-0 mx-auto p-8 flex flex-col text-center items-center font-aldrich text-slate-200 bg-(--gradient-light) shadow-2xl">
			<h1 className="font-black text-2xl">Política de Privacidad</h1>
			<p>Última actualización: August 2026</p>
		
			<section className="mt-5">
				<h2 className="font-bold text-lg underline">1. Información que recopilamos</h2>
				<p>
				Recopilamos información básica para el correcto funcionamiento de la plataforma, como tu nombre de usuario, dirección de correo electrónico y datos del perfil dentro del juego.
				</p>
			</section>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">2. Uso de la información</h2>
				<p>
				Utilizamos la información recopilada para gestionar las sesiones de usuario, llevar el registro de puntuaciones y mantener las estadísticas dentro del juego.
				</p>
			</section>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">3. Protección de datos</h2>
				<p>
				Tus credenciales se almacenan de forma segura y encriptada mediante algoritmos modernos. No compartimos tus datos con terceros.
				</p>
			</section>
		</div>
  );
};

export default PrivacyPolicy;