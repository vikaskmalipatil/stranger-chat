"use client"
import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"

// Initialize socket outside the component
const socket = io("https://stranger-chat-kbrm.onrender.com", { transports: ["websocket"] })

const SUGGESTED_INTERESTS = [
  "Gaming", "Music", "Coding", "Movies", "Anime", 
  "Sports", "Art", "Tech", "Travel", "Fitness"
]

export default function Chat() {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [selectedTags, setSelectedTags] = useState([])
  const [customInterest, setCustomInterest] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [users, setUsers] = useState({ online: 0, waiting: 0 })
  const [typing, setTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Fix Hydration Error
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    socket.on("status", (data) => {
      addMessage("system", data.msg)
      if (data.type === "connected") setIsSearching(false)
      if (data.type === "disconnected") setIsSearching(true)
    })

    socket.on("chat", (msg) => { 
      setMessages(p => [...p, { type: 'stranger', text: msg, id: Date.now() }])
      setTyping(false) 
    })

    socket.on("typing", () => { 
      setTyping(true)
      setTimeout(() => setTyping(false), 1500) 
    })

    socket.on("stats", (data) => setUsers(data))

    return () => {
      socket.off("status")
      socket.off("chat")
      socket.off("typing")
      socket.off("stats")
    }
  }, [mounted])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  if (!mounted) return null

  const addMessage = (type, text) => setMessages(prev => [...prev, { type, text, id: Date.now() }])

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const startChat = () => {
    const finalTags = [...selectedTags]
    if (customInterest.trim()) {
      finalTags.push(...customInterest.split(",").map(t => t.trim()))
    }
    socket.emit("set-interests", finalTags)
    setIsSearching(true)
    setMessages([])
  }

  const sendMessage = () => {
    if (!input.trim()) return
    socket.emit("chat", input)
    addMessage("you", input)
    setInput("")
  }

  const handleNext = () => {
    socket.emit("next")
    setMessages([])
    setIsSearching(true)
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-slate-50 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-black text-blue-600 flex items-center gap-2">
            <span className="p-1 bg-blue-600 text-white rounded shadow-sm">SC</span> 
            STRANGER CHAT
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {users.online} Online • {users.waiting} Searching
          </p>
        </div>
        {(isSearching || messages.length > 0) && (
          <button 
            onClick={handleNext}
            className="bg-slate-800 hover:bg-black text-white px-5 py-2 rounded-lg font-bold text-xs transition-all active:scale-95"
          >
            NEXT
          </button>
        )}
      </header>

      {!isSearching && messages.length === 0 ? (
        /* Setup Screen */
        <div className="flex-1 flex flex-col justify-center bg-white rounded-3xl p-8 border border-slate-200 shadow-xl overflow-y-auto">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Find a match</h2>
          <p className="text-slate-500 mb-6 font-medium text-sm">Pick some interests or leave it empty for random people.</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {SUGGESTED_INTERESTS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all border-2 ${
                  selectedTags.includes(tag) 
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Interests (Optional)</label>
          <input 
            className="w-full p-4 border-2 border-slate-100 rounded-2xl mb-8 focus:border-blue-500 outline-none transition-all font-medium" 
            placeholder="gaming, memes, music..." 
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
          />

          <button 
            onClick={startChat} 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            Start Matching
          </button>
        </div>
      ) : (
        /* Chat Interface */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl p-4 shadow-inner mb-4 space-y-4 border border-slate-200">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.type === 'you' ? 'justify-end' : m.type === 'stranger' ? 'justify-start' : 'justify-center'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm ${
                  m.type === 'you' ? 'bg-blue-600 text-white rounded-tr-none' : 
                  m.type === 'stranger' ? 'bg-slate-100 text-slate-800 rounded-tl-none' : 
                  'text-slate-400 text-[11px] italic font-normal text-center'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && <div className="text-[10px] font-bold text-blue-500 animate-pulse ml-2">STRANGER IS TYPING...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg">
            <input 
              className="flex-1 p-3 bg-transparent outline-none font-medium"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
                else socket.emit("typing");
              }}
            />
            <button 
              onClick={sendMessage} 
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  )
}