import React from 'react'
import { motion } from 'framer-motion'
import Chat from './components/Chat.jsx'
import BotCard from './components/BotCard.jsx'
import Settings from './components/Settings.jsx'
import { Store } from './store.js'
import { generateAI } from './lib/ai.js'

function withinActiveWindow(bot, date = new Date()) {
  const [sh, sm] = bot.activeStart.split(':').map(Number)
  const [eh, em] = bot.activeEnd.split(':').map(Number)
  const start = new Date(date); start.setHours(sh||0, sm||0, 0, 0)
  const end = new Date(date); end.setHours(eh||0, em||0, 0, 0)
  if (start <= end) return date >= start && date <= end
  // window crosses midnight
  return date >= start || date <= end
}

export default function App() {
  const [state, setState] = React.useState(Store.get())

  function sync(newState) {
    setState(newState)
  }

  function addBot() {
    const name = prompt('Bot name?', 'HypeDude')
    if (!name) return
    const subject = prompt('Subject/topic for this bot?', 'beaming')
    const st = Store.addBot({ name, subject })
    sync(st)
  }

  function updateBot(id, patch) {
    const st = Store.updateBot(id, patch)
    sync(st)
  }

  function removeBot(id) {
    const st = Store.removeBot(id)
    sync(st)
  }

  async function sendUserMessage(text) {
    // Topic extraction: "topic: something"
    const topicMatch = text.match(/^(topic|subjects?):\s*(.+)$/i)
    if (topicMatch) {
      const topic = topicMatch[2].trim()
      const st = Store.addTopic(topic)
      sync(st)
    }
    const st1 = Store.addMessage({ author: 'You', text })
    sync(st1)
    // trigger some bots to respond soon
    scheduleBotResponses({ reason: 'user' })
  }

  function nowMs() { return Date.now() }

  function scheduleTime(bot) {
    const min = Math.max(3, bot.delayMinSec||15)
    const max = Math.max(min+2, bot.delayMaxSec||60)
    return nowMs() + (min*1000 + Math.random() * (max-min) * 1000)
  }

  const scheduledRef = React.useRef([]) // [{botId, atMs}]

  function scheduleBotResponses({ reason='random' }={}) {
    const st = Store.get()
    const activeBots = st.bots.filter(b => b.online && withinActiveWindow(b))
    if (!activeBots.length) return

    // pick 1-3 bots depending on reason and randomness
    const count = Math.max(1, Math.min(activeBots.length, reason==='user' ? 2 : (Math.random()<0.5?1:2)))
    const shuffled = [...activeBots].sort(()=>Math.random()-0.5)
    const pick = shuffled.slice(0, count)
    const already = new Set(scheduledRef.current.map(x=>x.botId))

    pick.forEach(bot => {
      if (already.has(bot.id)) return
      scheduledRef.current.push({ botId: bot.id, atMs: scheduleTime(bot), reason })
    })
  }

  // Periodic scheduler: random chatter
  React.useEffect(() => {
    const t = setInterval(() => {
      // approx target msgs/hr -> per minute chance
      const st = Store.get()
      const bots = st.bots.filter(b => b.online && withinActiveWindow(b))
      bots.forEach(bot => {
        const perMinute = (bot.talkFrequency || 6) / 60
        if (Math.random() < perMinute * 0.9) {
          // schedule one
          scheduledRef.current.push({ botId: bot.id, atMs: scheduleTime(bot), reason: 'random' })
        }
      })
    }, 60 * 1000)
    return () => clearInterval(t)
  }, [])

  // Tick loop to deliver scheduled messages
  React.useEffect(() => {
    const t = setInterval(async () => {
      const due = []
      const future = []
      const now = nowMs()
      for (const item of scheduledRef.current) {
        if (item.atMs <= now) due.push(item) else future.push(item)
      }
      scheduledRef.current = future

      if (due.length) {
        const st = Store.get()
        for (const item of due) {
          const bot = st.bots.find(b => b.id === item.botId)
          if (!bot || !bot.online || !withinActiveWindow(bot)) continue
          // generate text
          const text = await generateAI({ settings: st.settings, bot, topics: st.topics, history: st.messages })
          st.messages.push({ id: crypto.randomUUID(), ts: Date.now(), author: bot.name, text })
          bot.lastSpokeAt = Date.now()
          // chance to farewell if leaving window soon
          const minsLeft = Math.abs((new Date().setSeconds(0,0) - Date.now())/60000)
          if (minsLeft < 1 && Math.random() < 0.1) {
            st.messages.push({ id: crypto.randomUUID(), ts: Date.now()+1000, author: bot.name, text: bot.farewell || 'gtg, bye' })
          }
        }
        Store.set(st)
        sync(st)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [])

  function sayNow(botId) {
    // immediate schedule
    const st = Store.get()
    const bot = st.bots.find(b => b.id === botId)
    if (!bot) return
    scheduledRef.current.push({ botId, atMs: Date.now()+1500, reason: 'manual' })
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">Multi‑Bot Chat Simulator</div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <button className="border rounded-lg px-2 py-1" onClick={addBot}>Add Bot</button>
            <button className="border rounded-lg px-2 py-1" onClick={()=>{ const st=Store.reset(); setState(st) }}>Reset</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full grid md:grid-cols-[320px,1fr,320px] gap-4 p-4">
        {/* Left: Bots */}
        <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="space-y-3">
          <div className="text-sm text-neutral-600">Bots (last talked time shown on each card)</div>
          {state.bots.map(bot => (
            <BotCard key={bot.id} bot={bot} onChange={updateBot} onDelete={removeBot} onSpeak={sayNow} />
          ))}
        </motion.div>

        {/* Middle: Chat */}
        <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="rounded-2xl border bg-white shadow-sm min-h-[70vh] flex flex-col">
          <div className="border-b p-3 text-sm text-neutral-600">Shared Chat</div>
          <Chat messages={state.messages} onSend={sendUserMessage} topics={state.topics} />
        </motion.div>

        {/* Right: Settings */}
        <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="space-y-3">
          <Settings settings={state.settings} onChange={(p)=>{ const st=Store.setSettings(p); sync(st) }} />
          <div className="rounded-2xl border bg-white p-4 text-xs text-neutral-600">
            <div className="font-semibold mb-1">Tips</div>
            <ul className="list-disc ml-4 space-y-1">
              <li>Type <code>topic: beaming</code> to add a topic the bots will chat about.</li>
              <li>Use Settings to enable OpenAI for richer replies (demo-only; key stored locally).</li>
              <li>Each bot has talk frequency and human-like delays.</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  )
}