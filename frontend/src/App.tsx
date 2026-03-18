import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '@/assets/vite.svg';
import heroImg from '@/assets/hero.png';
import '@/App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <section id='center' className='px-6 py-8'>
        <div className='hero'>
          <img src={heroImg} className='base' width='170' height='179' alt='' />
          <img src={reactLogo} className='framework' alt='React logo' />
          <img src={viteLogo} className='vite' alt='Vite logo' />
        </div>
        <div className='space-y-3'>
          <h1 className='text-4xl font-extrabold tracking-tight text-violet-500'>
            Get started
          </h1>
          <p className='text-slate-600 dark:text-slate-300'>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className='counter mt-4 rounded-md border border-violet-400 bg-violet-100 px-4 py-2 font-semibold text-violet-700 transition hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/70'
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className='ticks'></div>

      <section id='next-steps' className='grid gap-4 px-6 md:grid-cols-2'>
        <div
          id='docs'
          className='rounded-xl border border-slate-300/60 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40'
        >
          <svg className='icon' role='presentation' aria-hidden='true'>
            <use href='/icons.svg#documentation-icon'></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href='https://vite.dev/' target='_blank'>
                <img className='logo' src={viteLogo} alt='' />
                Explore Vite
              </a>
            </li>
            <li>
              <a href='https://react.dev/' target='_blank'>
                <img className='button-icon' src={reactLogo} alt='' />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div
          id='social'
          className='rounded-xl border border-slate-300/60 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40'
        >
          <svg className='icon' role='presentation' aria-hidden='true'>
            <use href='/icons.svg#social-icon'></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href='https://github.com/vitejs/vite' target='_blank'>
                <svg
                  className='button-icon'
                  role='presentation'
                  aria-hidden='true'
                >
                  <use href='/icons.svg#github-icon'></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href='https://chat.vite.dev/' target='_blank'>
                <svg
                  className='button-icon'
                  role='presentation'
                  aria-hidden='true'
                >
                  <use href='/icons.svg#discord-icon'></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href='https://x.com/vite_js' target='_blank'>
                <svg
                  className='button-icon'
                  role='presentation'
                  aria-hidden='true'
                >
                  <use href='/icons.svg#x-icon'></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href='https://bsky.app/profile/vite.dev' target='_blank'>
                <svg
                  className='button-icon'
                  role='presentation'
                  aria-hidden='true'
                >
                  <use href='/icons.svg#bluesky-icon'></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className='ticks'></div>
      <section id='spacer'></section>
    </>
  );
}

export default App;
