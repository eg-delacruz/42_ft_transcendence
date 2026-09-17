import React from 'react';

export const TermsOfService: React.FC = () => {
	return (
		<div className="max-w-3xl h-auto my-0 mx-auto p-8 flex flex-col text-center items-center font-aldrich text-slate-200 bg-(--gradient-light) shadow-2xl">
			<h1 className="font-black text-2xl">Términos de Servicio</h1>
			<p>Última actualización: August 2026</p>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">1. Aceptación de los términos</h2>
				<p>
				Al acceder y utilizar esta aplicación, aceptas cumplir con los presentes términos y condiciones de servicio.
				</p>
			</section>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">2. Conducta del usuario</h2>
				<p>
				Queda prohibido cualquier comportamiento abusivo, trampas dentro del juego o uso malintencionado de las funcionalidades del sistema.
				</p>
			</section>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">3. Cuentas y Puntos</h2>
				<p>
				Los puntos o monedas asignados dentro de la aplicación son virtuales y carecen de valor monetario real. El sistema se reserva el derecho de modificar o resetear puntuaciones en caso de fallos o conductas antideportivas.
				</p>
			</section>
		</div>
	);
};

export default TermsOfService;