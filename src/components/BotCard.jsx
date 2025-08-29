import React from 'react'

export default function BotCard({ bot, onChange, onDelete, onSpeak }) {
  const [local, setLocal] = React.useState(bot)
  React.useEffect(() => setLocal(bot), [bot])

  function handleSave() {
    onChange(local.id, local)
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${bot.online ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-800'}`}>
            {bot.online ? 'Online' : 'Offline'}
          </span>
          <div className="font-semibold">{bot.name || '(unnamed)'}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs border px-2 py-1 rounded-lg" onClick={() => onChange(bot.id, { online: !bot.online })}>
            {bot.online ? 'Stop' : 'Start'}
          </button>
          <button className="text-xs border px-2 py-1 rounded-lg" onClick={() => onDelete(bot.id)}>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          <div className="text-xs text-neutral-500">Name</div>
          <input className="w-full border rounded-lg px-2 py-1" value={local.name} onChange={e=>setLocal(v=>({...v,name:e.target.value}))}/>
        </label>
        <label className="text-sm">
          <div className="text-xs text-neutral-500">Subject</div>
          <input className="w-full border rounded-lg px-2 py-1" value={local.subject} onChange={e=>setLocal(v=>({...v,subject:e.target.value}))}/>
        </label>
      </div>

      <label className="text-sm">
        <div className="text-xs text-neutral-500">Persona</div>
        <textarea rows={3} className="w-full border rounded-lg px-2 py-1" value={local.persona} onChange={e=>setLocal(v=>({...v,persona:e.target.value}))}></textarea>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          <div className="text-xs text-neutral-500">Active Start</div>
          <input className="w-full border rounded-lg px-2 py-1" value={local.activeStart} onChange={e=>setLocal(v=>({...v,activeStart:e.target.value}))}/>
        </label>
        <label className="text-sm">
          <div className="text-xs text-neutral-500">Active End</div>
          <input className="w-full border rounded-lg px-2 py-1" value={local.activeEnd} onChange={e=>setLocal(v=>({...v,activeEnd:e.target.value}))}/>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="text-sm">
          <div className="text-xs text-neutral-500">Talk (msg/hr)</div>
          <input type="number" className="w-full border rounded-lg px-2 py-1" value={local.talkFrequency} onChange={e=>setLocal(v=>({...v,talkFrequency:Number(e.target.value)}))}/>
        </label>
        <label className="text-sm">
          <div className="text-xs text-neutral-500">Delay Min (s)</div>
          <input type="number" className="w-full border rounded-lg px-2 py-1" value={local.delayMinSec} onChange={e=>setLocal(v=>({...v,delayMinSec:Number(e.target.value)}))}/>
        </label>
        <label className="text-sm">
          <div className="text-xs text-neutral-500">Delay Max (s)</div>
          <input type="number" className="w-full border rounded-lg px-2 py-1" value={local.delayMaxSec} onChange={e=>setLocal(v=>({...v,delayMaxSec:Number(e.target.value)}))}/>
        </label>
      </div>

      <div className="text-xs text-neutral-500">Last spoke: {bot.lastSpokeAt ? new Date(bot.lastSpokeAt).toLocaleTimeString() : '—'}</div>

      <div className="flex justify-end gap-2">
        <button className="border px-3 py-1 rounded-lg" onClick={handleSave}>Save</button>
        <button className="border px-3 py-1 rounded-lg" onClick={() => onSpeak(bot.id)}>Say Now</button>
      </div>
    </div>
  )
}