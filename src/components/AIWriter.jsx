import { useEffect, useState } from 'react'

const platforms = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter/X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'tiktok', label: 'TikTok' },
]

const tones = [
  { key: 'friendly', label: 'Friendly' },
  { key: 'professional', label: 'Professional' },
  { key: 'playful', label: 'Playful' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'inspirational', label: 'Inspirational' },
]

export default function AIWriter() {
  const [form, setForm] = useState({
    brief: '',
    platform: 'facebook',
    tone: 'friendly',
    brand: 'Nexus Ads',
    call_to_action: 'Learn more',
    keywords: 'growth, ai, ads',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const backend = import.meta.env.VITE_BACKEND_URL || ''

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const generate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        brief: form.brief,
        platform: form.platform,
        tone: form.tone,
        brand: form.brand || undefined,
        call_to_action: form.call_to_action || undefined,
        keywords: form.keywords
          ? form.keywords.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      }
      const res = await fetch(`${backend}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  const useInPostCreator = (v) => {
    const draft = {
      platform: form.platform,
      content: `${v.headline}\n\n${v.primary_text}\n\n${(v.hashtags||[]).join(' ')}`.trim(),
      media_url: '',
      hashtags: v.hashtags || [],
    }
    try {
      localStorage.setItem('nexus_post_draft', JSON.stringify(draft))
    } catch {}
    alert('Draft sent to Post Creator. Scroll down to Post Creator section to review and publish.')
  }

  return (
    <section id="ai-writer" className="relative py-16 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">AI Content Writer</h2>
          <p className="text-blue-200/80 mt-2">Generate on-brand headlines and post copy for your ads and social posts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-blue-200/70">Brief</label>
              <textarea name="brief" value={form.brief} onChange={handleChange} rows={5} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe your product, offer, target audience and key points" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-blue-200/70">Platform</label>
                <select name="platform" value={form.platform} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  {platforms.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Tone</label>
                <select name="tone" value={form.tone} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  {tones.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-blue-200/70">Brand</label>
                <input name="brand" value={form.brand} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your brand" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">CTA</label>
                <input name="call_to_action" value={form.call_to_action} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Learn more" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Keywords</label>
                <input name="keywords" value={form.keywords} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="ai, growth, launch" />
              </div>
            </div>
            <button onClick={generate} disabled={loading || !form.brief.trim()} className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-3 font-medium">{loading ? 'Generating…' : 'Generate Variations'}</button>
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
            <h4 className="font-semibold mb-4">Suggestions</h4>
            {!result && (
              <p className="text-blue-200/70 text-sm">Your AI suggestions will appear here.</p>
            )}
            {result && result.error && (
              <div className="text-red-300 text-sm">{String(result.error)}</div>
            )}
            {result && result.variations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.variations.map((v, i) => (
                  <div key={i} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                    <div className="font-semibold">{v.headline}</div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{v.primary_text}</p>
                    {!!(v.hashtags && v.hashtags.length) && (
                      <div className="mt-2 text-xs text-blue-200/70">{v.hashtags.join(' ')}</div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => navigator.clipboard?.writeText(`${v.headline}\n\n${v.primary_text}\n\n${(v.hashtags||[]).join(' ')}`)} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs">Copy</button>
                      <button onClick={() => useInPostCreator(v)} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white">Use in Post Creator</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
