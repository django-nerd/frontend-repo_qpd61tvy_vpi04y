import { useEffect, useState } from 'react'

export default function PostsFeed() {
  const backend = import.meta.env.VITE_BACKEND_URL || ''
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [openPostId, setOpenPostId] = useState(null)
  const [comments, setComments] = useState({})
  const [chats, setChats] = useState({})
  const [newComment, setNewComment] = useState({})
  const [newChat, setNewChat] = useState({})
  const api = (p) => `${backend}${p}`

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch(api('/api/posts'))
      const data = await res.json()
      setPosts(data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(api(`/api/posts/${postId}/comments`))
      const data = await res.json()
      setComments((c) => ({ ...c, [postId]: data || [] }))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchChat = async (postId) => {
    try {
      const res = await fetch(api(`/api/posts/${postId}/chat`))
      const data = await res.json()
      setChats((c) => ({ ...c, [postId]: data || [] }))
    } catch (e) {
      console.error(e)
    }
  }

  const addComment = async (postId) => {
    const text = (newComment[postId]?.text || '').trim()
    if (!text) return
    try {
      await fetch(api(`/api/posts/${postId}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: newComment[postId]?.author || 'Anon' }),
      })
      setNewComment((s) => ({ ...s, [postId]: { text: '', author: s[postId]?.author || 'Anon' } }))
      fetchComments(postId)
    } catch (e) {
      console.error(e)
    }
  }

  const addChatMessage = async (postId) => {
    const message = (newChat[postId]?.message || '').trim()
    if (!message) return
    try {
      await fetch(api(`/api/posts/${postId}/chat`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, author: newChat[postId]?.author || 'Anon' }),
      })
      setNewChat((s) => ({ ...s, [postId]: { message: '', author: s[postId]?.author || 'Anon' } }))
      fetchChat(postId)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const toggleOpen = (postId) => {
    setOpenPostId((id) => (id === postId ? null : postId))
    fetchComments(postId)
    fetchChat(postId)
  }

  return (
    <section id="posts-feed" className="py-16 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Posts Feed</h2>
          <p className="text-blue-200/80 mt-2">View queued/scheduled posts and collaborate with comments and chat.</p>
        </div>

        {loading ? (
          <p className="text-blue-200/80">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-blue-200/80">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/60">
                <button onClick={() => toggleOpen(p.id)} className="w-full flex items-start justify-between gap-4 p-4 text-left">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300/70">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{p.platform}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{p.status}</span>
                      {p.scheduled_at && <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{new Date(p.scheduled_at).toLocaleString()}</span>}
                    </div>
                    <p className="mt-2 text-sm md:text-base line-clamp-3">{p.content}</p>
                  </div>
                  {p.media_url && (
                    <img src={p.media_url} alt="media" className="w-20 h-20 object-cover rounded-lg hidden sm:block" />
                  )}
                </button>

                {openPostId === p.id && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Comments */}
                      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                        <h4 className="font-semibold text-sm">Comments</h4>
                        <div className="mt-2 max-h-48 overflow-auto space-y-2 pr-1">
                          {(comments[p.id] || []).map((c) => (
                            <div key={c.id} className="text-sm p-2 rounded bg-slate-900 border border-slate-700">
                              <p className="text-blue-300/80 text-xs">{c.author || 'Anon'} · {c.created_at ? new Date(c.created_at).toLocaleString() : ''}</p>
                              <p>{c.text}</p>
                            </div>
                          ))}
                          {(comments[p.id] || []).length === 0 && (
                            <p className="text-xs text-blue-300/70">No comments yet.</p>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <input value={newComment[p.id]?.author || ''} onChange={(e)=>setNewComment((s)=>({...s, [p.id]: { ...(s[p.id]||{}), author: e.target.value }}))} placeholder="Your name (optional)" className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                          <div className="flex gap-2">
                            <input value={newComment[p.id]?.text || ''} onChange={(e)=>setNewComment((s)=>({...s, [p.id]: { ...(s[p.id]||{}), text: e.target.value }}))} placeholder="Add a comment" className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={()=>addComment(p.id)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2">Send</button>
                          </div>
                        </div>
                      </div>

                      {/* Chat */}
                      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                        <h4 className="font-semibold text-sm">Chat</h4>
                        <div className="mt-2 max-h-48 overflow-auto space-y-2 pr-1">
                          {(chats[p.id] || []).map((m) => (
                            <div key={m.id} className="text-sm p-2 rounded bg-slate-900 border border-slate-700">
                              <p className="text-blue-300/80 text-xs">{m.author || 'Anon'} · {m.created_at ? new Date(m.created_at).toLocaleString() : ''}</p>
                              <p>{m.message}</p>
                            </div>
                          ))}
                          {(chats[p.id] || []).length === 0 && (
                            <p className="text-xs text-blue-300/70">No messages yet.</p>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <input value={newChat[p.id]?.author || ''} onChange={(e)=>setNewChat((s)=>({...s, [p.id]: { ...(s[p.id]||{}), author: e.target.value }}))} placeholder="Your name (optional)" className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                          <div className="flex gap-2">
                            <input value={newChat[p.id]?.message || ''} onChange={(e)=>setNewChat((s)=>({...s, [p.id]: { ...(s[p.id]||{}), message: e.target.value }}))} placeholder="Type a message" className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={()=>addChatMessage(p.id)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2">Send</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
