import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center my-12 space-y-6">
        <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
          Plataforma Multi-Juegos
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          ft_transcendence
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Compite en tiempo real contra otros jugadores, escala puestos en la clasificación y domina el clásico arcade.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/game"
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-600/25"
          >
            Jugar Ahora
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* Grid de Juegos */}
      <section className="max-w-5xl mx-auto w-full space-y-6 my-8">
        <h2 className="text-xl font-bold text-slate-300 tracking-wide border-b border-slate-800 pb-3">
          Juegos Disponibles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Pong (Principal) */}
          <div className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🏓</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                En Vivo
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              Pong Classic
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              El mítico juego de palas en 1v1 online sincronizado en tiempo real vía WebSockets.
            </p>
            <Link
              to="/game"
              className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              Entrar al lobby &rarr;
            </Link>
          </div>

          {/* Placeholder: Próximos Juegos */}
          <div className="bg-slate-900/40 border border-slate-800/60 border-dashed rounded-xl p-6 flex flex-col justify-between opacity-75">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎯</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                  Próximamente
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                Juego 2
              </h3>
              <p className="text-sm text-slate-500">
                Nuevo modo arcade en desarrollo para la plataforma.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 border-dashed rounded-xl p-6 flex flex-col justify-between opacity-75">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">👾</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                  Próximamente
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                Juego 3
              </h3>
              <p className="text-sm text-slate-500">
                Modo multijugador experimental.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimalista con enlaces a Políticas y Términos */}
      <footer className="text-center text-xs text-slate-500 border-t border-slate-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-5xl mx-auto w-full">
        <div>
          ft_transcendence &copy; {new Date().getFullYear()} — Proyecto 42
        </div>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">
            Política de Privacidad
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">
            Términos del Servicio
          </Link>
        </div>
      </footer>
    </div>
  );
}