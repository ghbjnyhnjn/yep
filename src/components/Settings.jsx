import React from 'react'

export default function Settings({ settings, onChange }) {
  const [local, setLocal] = React.useState(settings)

  React.useEffect(() => setLocal(settings), [settings])

  function save() {
    onChange(local)
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
      <div className="font-semibold">Settings</div>
      <label className="text-sm">
        <div className="text-xs text-neutral-500">Use OpenAI (Optional)</div>
        <select className="w-full border rounded-lg px-2 py-1" value={local.useOpenAI ? 'yes':'no'} onChange={e=>setLocal(v=>({...v,useOpenAI:e.target.value==='yes'}))}>
          <option value="no">No (local pseudo‑AI)</option>
          <option value="yes">Yes (requires API key)</option>
        </select>
      </label>
      <label className="text-sm">
        <div className="text-xs text-neutral-500">OpenAI API Key</div>
        <input type="password" className="w-full border rounded-lg px-2 py-1" value={local.openaiKey} onChange={e=>setLocal(v=>({...v,openaiKey:e.target.value}))}/>
        <div className="text-[11px] text-neutral-500 mt-1">Warning: the key is stored in your browser localStorage.</div>
      </label>
      <label className="text-sm">
        <div className="text-xs text-neutral-500">Model</div>
        <input className="w-full border rounded-lg px-2 py-1" value={local.model} onChange={e=>setLocal(v=>({...v,model:e.target.value}))}/>
      </label>
      <div className="flex justify-end">
        <button className="border rounded-lg px-3 py-1" onClick={save}>Save</button>
      </div>
    </div>
  )
}