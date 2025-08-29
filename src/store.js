// Simple localStorage-backed store for bots and chat
const LS_KEY = 'mbs_state_v1';

const defaultBot = () => ({
  id: crypto.randomUUID(),
  name: 'ChillBro',
  persona: 'chill, lowercase, says yo wsg gtg sometimes',
  subject: 'random vibes',
  topics: [],
  slangLevel: 80,
  talkFrequency: 10, // msgs/hour target
  delayMinSec: 20,
  delayMaxSec: 90,
  activeStart: '10:00',
  activeEnd: '22:00',
  teachNewcomers: true,
  humanRandomness: 60,
  farewell: 'gtg, ttyl',
  online: true,
  lastSpokeAt: 0,
});

const defaultSettings = {
  useOpenAI: false,
  openaiKey: '',
  model: 'gpt-4o-mini',
};

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) throw new Error();
    const st = JSON.parse(raw);
    return { ...st, settings: { ...defaultSettings, ...(st.settings||{}) } };
  } catch {
    const initial = {
      bots: [defaultBot()],
      messages: [],
      topics: [],
      settings: { ...defaultSettings },
    };
    save(initial);
    return initial;
  }
}

function save(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export const Store = {
  get: load,
  set: save,
  reset() {
    localStorage.removeItem(LS_KEY);
    return load();
  },
  addBot(bot) {
    const st = load();
    st.bots.unshift({ ...defaultBot(), ...bot, id: crypto.randomUUID(), lastSpokeAt: 0 });
    save(st);
    return st;
  },
  updateBot(id, patch) {
    const st = load();
    st.bots = st.bots.map(b => b.id === id ? { ...b, ...patch } : b);
    save(st);
    return st;
  },
  removeBot(id) {
    const st = load();
    st.bots = st.bots.filter(b => b.id !== id);
    save(st);
    return st;
  },
  addMessage(msg) {
    const st = load();
    st.messages.push({ id: crypto.randomUUID(), ts: Date.now(), ...msg });
    save(st);
    return st;
  },
  setSettings(patch) {
    const st = load();
    st.settings = { ...st.settings, ...patch };
    save(st);
    return st;
  },
  addTopic(topic) {
    const st = load();
    if (!st.topics.includes(topic)) st.topics.push(topic);
    save(st);
    return st;
  }
};