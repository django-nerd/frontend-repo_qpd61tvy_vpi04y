import { useEffect, useRef, useState } from 'react'

function HighlightMentions({ text }) {
  if (!text) return null
  const parts = text.split(/(@[A-Za-z0-9_]+)/g)
  return (
    <span>
      {parts.map((p, i) => (
        /@[A-Za-z0-9_]+/.test(p) ? (
          <span key={i} className="text-emerald-300">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      ))}
    </span>
  )
}

export default function PostsFeed() {
  const backend = import.meta.env.VITE_BACKEND_URL || ''
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [openPostId, setOpenPostId] = useState(null)
  const [comments, setComments] = useState({})
  const [chats, setChats] = useState({})
  const [newComment, setNewComment] = useState({})
  const [newChat, setNewChat] = useState({})
  const [editingComment, setEditingComment] = useState({}) // {postId: {id, text, attachment_url}}
  const [editingChat, setEditingChat] = useState({}) // {postId: {id, message, attachment_url}}
  const sseRef = useRef(null)
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
        body: JSON.stringify({ text, author: newComment[postId]?.author || 'Anon', attachment_url: newComment[postId]?.attachment_url || undefined }),
      })
      setNewComment((s) => ({ ...s, [postId]: { text: '', author: s[postId]?.author || 'Anon', attachment_url: '' } }))
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
        body: JSON.stringify({ message, author: newChat[postId]?.author || 'Anon', attachment_url: newChat[postId]?.attachment_url || undefined }),
      })
      setNewChat((s) => ({ ...s, [postId]: { message: '', author: s[postId]?.author || 'Anon', attachment_url: '' } }))
      fetchChat(postId)
    } catch (e) {
      console.error(e)
    }
  }

  const startEditComment = (postId, c) => setEditingComment((s) => ({ ...s, [postId]: { id: c.id, text: c.text, attachment_url: c.attachment_url || '' } }))
  const cancelEditComment = (postId) => setEditingComment((s) => ({ ...s, [postId]: undefined }))
  const saveEditComment = async (postId) => {
    const ec = editingComment[postId]
    if (!ec) return
    try {
      await fetch(api(`/api/posts/${postId}/comments/${ec.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ec.text, attachment_url: ec.attachment_url || null }),
      })
      setEditingComment((s) => ({ ...s, [postId]: undefined }))
      fetchComments(postId)
    } catch (e) {
      console.error(e)
    }
  }
  const deleteComment = async (postId, id) => {
    try {
      await fetch(api(`/api/posts/${postId}/comments/${id}`), { method: 'DELETE' })
      fetchComments(postId)
    } catch (e) { console.error(e) }
  }

  const startEditChat = (postId, m) => setEditingChat((s) => ({ ...s, [postId]: { id: m.id, message: m.message, attachment_url: m.attachment_url || '' } }))
  const cancelEditChat = (postId) => setEditingChat((s) => ({ ...s, [postId]: undefined }))
  const saveEditChat = async (postId) => {
    const ec = editingChat[postId]
    if (!ec) return
    try {
      await fetch(api(`/api/posts/${postId}/chat/${ec.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: ec.message, attachment_url: ec.attachment_url || null }),
      })
      setEditingChat((s) => ({ ...s, [postId]: undefined }))
      fetchChat(postId)
    } catch (e) { console.error(e) }
  }
  const deleteChat = async (postId, id) => {
    try {
      await fetch(api(`/api/posts/${postId}/chat/${id}`), { method: 'DELETE' })
      fetchChat(postId)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // lightweight polling for near-realtime
  useEffect(() => {
    if (!openPostId) return
    const t = setInterval(() => {
      fetchComments(openPostId)
      fetchChat(openPostId)
    }, 5000)
    return () => clearInterval(t)
  }, [openPostId])

  // SSE realtime updates
  useEffect(() => {
    if (!backend) return
    const ev = new EventSource(`${backend}/api/stream`)
    sseRef.current = ev
    ev.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (!msg) return
        if (msg.type === 'comment_created' || msg.type === 'comment_updated' || msg.type === 'comment_deleted') {
          if (msg.post_id && msg.post_id === openPostId) {
            fetchComments(msg.post_id)
          }
        }
        if (msg.type === 'chat_created' || msg.type === 'chat_updated' || msg.type === 'chat_deleted') {
          if (msg.post_id && msg.post_id === openPostId) {
            fetchChat(msg.post_id)
          }
        }
        if (msg.type === 'toppost_created') {
          // optional: refresh posts feed not needed
        }
      } catch (_) {}
    }
    ev.onerror = () => {
      // auto-reconnect by closing and reopening on error
      ev.close()
      setTimeout(() => {
        sseRef.current = new EventSource(`${backend}/api/stream`)
      }, 2000)
    }
    return () => {
      try { ev.close() } catch (_) {}
    }
  }, [backend, openPostId])

  const toggleOpen = (postId) => {
    setOpenPostId((id) => (id === postId ? null : postId))
    fetchComments(postId)
    fetchChat(postId)
  }

  const pushEmoji = (setter, postId, field, emoji) => {
    setter((s) => ({
      ...s,
      [postId]: {
        ...(s[postId] || {}),
        [field]: ((s[postId]?.[field] || '') + ' ' + emoji).trim()
      }
    }))
  }

  const Field = ({ value, onChange, placeholder }) => (
    <input value={value || ''} onChange={onChange} placeholder={placeholder} className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 w-full" />
  )

  return (
    <section id="posts-feed" className="py-12 sm:py-16 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Posts Feed</h2>
          <p className="text-blue-200/80 mt-2 text-sm sm:text-base">View queued/scheduled posts and collaborate with comments and chat.</p>
        </div>

        {loading ? (
          <p className="text-blue-200/80">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-blue-200/80">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/60">
                <button onClick={() => toggleOpen(p.id)} className="w-full flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300/70">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{p.platform}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{p.status}</span>
                      {p.scheduled_at && <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{new Date(p.scheduled_at).toLocaleString()}</span>}
                    </div>
                    <p className="mt-2 text-sm md:text-base line-clamp-3 break-words"><HighlightMentions text={p.content} /></p>
                  </div>
                  {p.media_url && (
                    <img src={p.media_url} alt="media" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg hidden xs:block sm:block" />
                  )}
                </button>

                {openPostId === p.id && (
                  <div className="px-3 sm:px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {/* Comments */}
                      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                        <h4 className="font-semibold text-sm">Comments</h4>
                        <div className="mt-2 max-h-64 overflow-auto space-y-2 pr-1">
                          {(comments[p.id] || []).map((c) => (
                            <div key={c.id} className="text-sm p-2 rounded bg-slate-900 border border-slate-700">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-blue-300/80 text-xs truncate">{c.author || 'Anon'} · {c.created_at ? new Date(c.created_at).toLocaleString() : ''}</p>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => startEditComment(p.id, c)} className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Edit</button>
                                  <button onClick={() => deleteComment(p.id, c.id)} className="text-xs px-2 py-1 rounded bg-rose-700 hover:bg-rose-600">Delete</button>
                                </div>
                              </div>
                              {editingComment[p.id]?.id === c.id ? (
                                <div className="mt-2 space-y-2">
                                  <Field value={editingComment[p.id]?.text} onChange={(e)=>setEditingComment((s)=>({...s, [p.id]: { ...(s[p.id]||{}), text: e.target.value }}))} placeholder="Edit comment" />
                                  <Field value={editingComment[p.id]?.attachment_url} onChange={(e)=>setEditingComment((s)=>({...s, [p.id]: { ...(s[p.id]||{}), attachment_url: e.target.value }}))} placeholder="Attachment URL (optional)" />
                                  <div className="flex gap-2">
                                    <button onClick={()=>saveEditComment(p.id)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2">Save</button>
                                    <button onClick={()=>cancelEditComment(p.id)} className="rounded-lg bg-slate-700 hover:bg-slate-600 text-white px-3 py-2">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 space-y-2 break-words">
                                  <p><HighlightMentions text={c.text} /></p>
                                  {c.attachment_url && (
                                    c.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                      <img src={c.attachment_url} alt="attachment" className="max-h-40 rounded border border-slate-700" />
                                    ) : (
                                      <a href={c.attachment_url} target="_blank" rel="noreferrer" className="text-emerald-400 underline">Attachment</a>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {(comments[p.id] || []).length === 0 && (
                            <p className="text-xs text-blue-300/70">No comments yet.</p>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <Field value={newComment[p.id]?.author || ''} onChange={(e)=>setNewComment((s)=>({...s, [p.id]: { ...(s[p.id]||{}), author: e.target.value }}))} placeholder="Your name (optional)" />
                          <div className="flex items-center gap-2 flex-wrap">
                            {['👍','🎯','🔥','✨','💡','✅'].map(em=> (
                              <button key={em} onClick={()=>pushEmoji(setNewComment, p.id, 'text', em)} className="text-lg px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">{em}</button>
                            ))}
                          </div>
                          <Field value={newComment[p.id]?.text || ''} onChange={(e)=>setNewComment((s)=>({...s, [p.id]: { ...(s[p.id]||{}), text: e.target.value }}))} placeholder="Add a comment (supports @mentions)" />
                          <Field value={newComment[p.id]?.attachment_url || ''} onChange={(e)=>setNewComment((s)=>({...s, [p.id]: { ...(s[p.id]||{}), attachment_url: e.target.value }}))} placeholder="Attachment URL (optional)" />
                          <button onClick={()=>addComment(p.id)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 w-full sm:w-auto">Send Comment</button>
                        </div>
                      </div>

                      {/* Chat */}
                      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                        <h4 className="font-semibold text-sm">Chat</h4>
                        <div className="mt-2 max-h-64 overflow-auto space-y-2 pr-1">
                          {(chats[p.id] || []).map((m) => (
                            <div key={m.id} className="text-sm p-2 rounded bg-slate-900 border border-slate-700">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-blue-300/80 text-xs truncate">{m.author || 'Anon'} · {m.created_at ? new Date(m.created_at).toLocaleString() : ''}</p>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => startEditChat(p.id, m)} className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Edit</button>
                                  <button onClick={() => deleteChat(p.id, m.id)} className="text-xs px-2 py-1 rounded bg-rose-700 hover:bg-rose-600">Delete</button>
                                </div>
                              </div>
                              {editingChat[p.id]?.id === m.id ? (
                                <div className="mt-2 space-y-2">
                                  <Field value={editingChat[p.id]?.message} onChange={(e)=>setEditingChat((s)=>({...s, [p.id]: { ...(s[p.id]||{}), message: e.target.value }}))} placeholder="Edit message" />
                                  <Field value={editingChat[p.id]?.attachment_url} onChange={(e)=>setEditingChat((s)=>({...s, [p.id]: { ...(s[p.id]||{}), attachment_url: e.target.value }}))} placeholder="Attachment URL (optional)" />
                                  <div className="flex gap-2">
                                    <button onClick={()=>saveEditChat(p.id)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2">Save</button>
                                    <button onClick={()=>cancelEditChat(p.id)} className="rounded-lg bg-slate-700 hover:bg-slate-600 text-white px-3 py-2">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 space-y-2 break-words">
                                  <p><HighlightMentions text={m.message} /></p>
                                  {m.attachment_url && (
                                    m.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                      <img src={m.attachment_url} alt="attachment" className="max-h-40 rounded border border-slate-700" />
                                    ) : (
                                      <a href={m.attachment_url} target="_blank" rel="noreferrer" className="text-emerald-400 underline">Attachment</a>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {(chats[p.id] || []).length === 0 && (
                            <p className="text-xs text-blue-300/70">No messages yet.</p>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <Field value={newChat[p.id]?.author || ''} onChange={(e)=>setNewChat((s)=>({...s, [p.id]: { ...(s[p.id]||{}), author: e.target.value }}))} placeholder="Your name (optional)" />
                          <div className="flex items-center gap-2 flex-wrap">
                            {['👋','😁','🚀','🙌','🤝','💬'].map(em=> (
                              <button key={em} onClick={()=>pushEmoji(setNewChat, p.id, 'message', em)} className="text-lg px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">{em}</button>
                            ))}
                          </div>
                          <Field value={newChat[p.id]?.message || ''} onChange={(e)=>setNewChat((s)=>({...s, [p.id]: { ...(s[p.id]||{}), message: e.target.value }}))} placeholder="Type a message (supports @mentions)" />
                          <Field value={newChat[p.id]?.attachment_url || ''} onChange={(e)=>setNewChat((s)=>({...s, [p.id]: { ...(s[p.id]||{}), attachment_url: e.target.value }}))} placeholder="Attachment URL (optional)" />
                          <button onClick={()=>addChatMessage(p.id)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 w-full sm:w-auto">Send Message</button>
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
