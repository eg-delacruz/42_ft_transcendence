import { useState, type FormEvent } from 'react';
import { useChatSocket } from '@/hooks/useChatSocket';

export function ChatPanel() {
  const { messages, activeRoomId, sendMessage, status } = useChatSocket();
  const [text, setText] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    await sendMessage({ roomId: activeRoomId ?? 'global', text: trimmedText });
    setText('');
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-slate-950/70 p-3 text-white">
      <div className="mb-2 flex-1 space-y-2 overflow-y-auto text-sm">
        {messages.map((message) => (
          <p key={message.messageId}>
            <span className="font-bold text-amber-300">{message.sender.email}:</span>{' '}
            {message.text}
          </p>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={status !== 'connected'}
          placeholder="Escribe un mensaje"
          className="min-w-0 flex-1 bg-slate-800 px-2 py-1 text-white outline-none"
        />
        <button
          type="submit"
          disabled={status !== 'connected' || !text.trim()}
          className="bg-amber-500 px-3 py-1 font-bold text-slate-950 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
