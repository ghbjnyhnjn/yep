import React from 'react'

export default function Chat({ messages, onSend, topics }) {
  const [text, setText] = React.useState('')
  const listRef = React.useRef(null)

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map(m => (
          <div key={m.id} className="flex items-start gap-2">
            <div className={`text-xs px-2 py-0.5 rounded-full ${m.author==='You'?'bg-blue-600 text-white':'bg-neutral-200 text-neutral-800'}`}>{m.author}</div>
            <div className="text-sm">{m.text}</div>
            <div className="ml-auto text-[10px] text-neutral-500">{new Date(m.ts).toLocaleTimeString()}</div>
          </div>
        ))}
        {topics?.length ? (
          <div className="text-[11px] text-neutral-500 mt-2">Topics: {topics.join(', ')}</div>
        ) : null}
      </div>
      <div className="border-t p-3 flex items-center gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Type here… (hint: try 'topic: beaming')"
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') handleSend() }}
        />
        <button className="border rounded-xl px-4 py-2" onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}