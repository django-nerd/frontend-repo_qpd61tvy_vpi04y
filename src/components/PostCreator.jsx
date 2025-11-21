import { useEffect, useMemo, useState } from 'react'

const platforms = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter/X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'tiktok', label: 'TikTok' },
]

export default function PostCreator() {
  const [form, setForm] = useState({
    platform: 'facebook',
    content: '',
    media_url: '',
    hashtags: '',
    scheduled_at: '',
  })
  const [creating, setCreating] = useState(false)
  const [resp, setResp] = useState(null)
  const backend = import.meta.env.VITE_BACKEND_URL || ''

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexus_post_draft')
      if (raw) {
        const d = JSON.parse(raw)
        setForm((f) => ({
          ...f,
          platform: d.platform || 'facebook',
          content: d.content || '',
          media_url: d.media_url || '',
          hashtags: (d.hashtags || []).join(', '),
        }))
      }
    } catch {}
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const createPost = async () => {
    setCreating(true)
    setResp(null)
    try {
      const payload = {
        platform: form.platform,
        content: form.content,
        media_url: form.media_url || undefined,
        hashtags: form.hashtags
          ? form.hashtags.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : undefined,
      }
      const res = await fetch(`${backend}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setResp(data)
    } catch (e) {
      setResp({ error: String(e) })
    } finally {
      setCreating(false)
    }
  }

  return (
    <section id="post-creator" className="relative py-16 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Post Creator</h2>
          <p className="text-blue-200/80 mt-2">Compose a social post and queue it for publishing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-blue-200/70">Platform</label>
                <select name="platform" value={form.platform} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  {platforms.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-blue-200/70">Media URL (optional)</label>
                <input name="media_url" value={form.media_url} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-sm text-blue-200/70">Content</label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={6} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Write your post copy..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-blue-200/70">Hashtags (comma separated)</label>
                <input name="hashtags" value={form.hashtags} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="#growth, #ads" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Schedule (optional)</label>
                <input type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button onClick={createPost} disabled={creating || !form.content.trim()} className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-3 font-medium">{creating ? 'Saving…' : 'Queue Post'}</button>

            {resp && (
              <div className="mt-4 text-xs text-blue-100/80 break-words">
                <pre className="whitespace-pre-wrap">{JSON.stringify(resp, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
            <h4 className="font-semibold">Tips</h4>
            <ul className="mt-2 text-sm text-blue-200/80 list-disc list-inside space-y-1">
              <li>Keep copy concise and value-driven.</li>
              <li>Use 3–8 hashtags; fewer on LinkedIn/Twitter.</li>
              <li>Schedule for peak engagement times.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
