import { useState } from 'react'

const defaultPlatforms = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter/X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'tiktok', label: 'TikTok' },
]

export default function CampaignBuilder() {
  const [form, setForm] = useState({
    name: '',
    objective: 'traffic',
    headline: '',
    primary_text: '',
    media_url: '',
    call_to_action: 'learn_more',
    destination_url: '',
    daily_budget: 10,
    total_budget: 100,
    audience_location: '',
    audience_age_min: 18,
    audience_age_max: 45,
    audience_interests: '',
    platforms: ['facebook', 'instagram'],
    social_accounts: [
      { platform: 'facebook', page_name: '', access_token: '' },
      { platform: 'instagram', page_name: '', access_token: '' },
      { platform: 'twitter', page_name: '', access_token: '' },
      { platform: 'linkedin', page_name: '', access_token: '' },
      { platform: 'tiktok', page_name: '', access_token: '' },
    ],
  })

  const backend = import.meta.env.VITE_BACKEND_URL || ''
  const api = (p) => `${backend}${p}`

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const togglePlatform = (key) => {
    setForm((f) => {
      const set = new Set(f.platforms)
      if (set.has(key)) set.delete(key)
      else set.add(key)
      return { ...f, platforms: Array.from(set) }
    })
  }

  const updateAccount = (idx, key, value) => {
    setForm((f) => {
      const arr = [...f.social_accounts]
      arr[idx] = { ...arr[idx], [key]: value }
      return { ...f, social_accounts: arr }
    })
  }

  // Image mode: manual or AI
  const [imageMode, setImageMode] = useState('manual')
  const [aiImg, setAiImg] = useState({ prompt: '', style: 'photo', width: 1024, height: 1024 })
  const [generatingImg, setGeneratingImg] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const styles = [
    { key: 'photo', label: 'Photo' },
    { key: '3d', label: '3D' },
    { key: 'illustration', label: 'Illustration' },
    { key: 'neon', label: 'Neon' },
    { key: 'minimal', label: 'Minimal' },
  ]

  const generateImage = async () => {
    if (!aiImg.prompt.trim()) {
      alert('Please enter a prompt for the AI image')
      return
    }
    try {
      setGeneratingImg(true)
      setGeneratedUrl('')
      const res = await fetch(api('/api/ai/image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiImg),
      })
      const data = await res.json()
      if (data.image_url) {
        setGeneratedUrl(data.image_url)
        // Optimistically set as campaign media URL
        setForm((f) => ({ ...f, media_url: data.image_url }))
      } else {
        alert('Failed to generate image')
      }
    } catch (e) {
      alert('Error generating image: ' + String(e))
    } finally {
      setGeneratingImg(false)
    }
  }

  const [creating, setCreating] = useState(false)
  const [createResp, setCreateResp] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishResp, setPublishResp] = useState(null)

  const createCampaign = async () => {
    setCreating(true)
    setCreateResp(null)
    try {
      const interests = form.audience_interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const payload = { ...form, audience_interests: interests }
      const res = await fetch(api('/api/campaigns'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setCreateResp(data)
    } catch (e) {
      setCreateResp({ error: String(e) })
    } finally {
      setCreating(false)
    }
  }

  const publish = async () => {
    setPublishing(true)
    setPublishResp(null)
    try {
      const interests = form.audience_interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const payload = { campaign: { ...form, audience_interests: interests } }
      const res = await fetch(api('/api/publish'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setPublishResp(data)
    } catch (e) {
      setPublishResp({ error: String(e) })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <section id="builder" className="relative py-16 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">AI Ads Campaign Builder</h2>
          <p className="text-blue-200/80 mt-2">Craft cross-network campaigns and queue publishing to up to 5 pages.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-blue-200/70">Campaign Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Spring Launch Sale" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Objective</label>
                <select name="objective" value={form.objective} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="traffic">Traffic</option>
                  <option value="conversions">Conversions</option>
                  <option value="engagement">Engagement</option>
                  <option value="lead_generation">Lead Generation</option>
                  <option value="reach">Reach</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-blue-200/70">Headline</label>
                <input name="headline" value={form.headline} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Unlock growth with AI" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-blue-200/70">Primary Text</label>
                <textarea name="primary_text" value={form.primary_text} onChange={handleChange} rows={4} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell your audience why this matters..." />
              </div>

              {/* Media input: manual vs AI */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-blue-200/70">Creative</span>
                  <div className="inline-flex rounded-lg overflow-hidden border border-slate-700/80">
                    <button type="button" className={`px-3 py-1.5 text-sm ${imageMode==='manual' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-200/80'}`} onClick={() => setImageMode('manual')}>Manual</button>
                    <button type="button" className={`px-3 py-1.5 text-sm ${imageMode==='ai' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-200/80'}`} onClick={() => setImageMode('ai')}>AI Image</button>
                  </div>
                </div>

                {imageMode === 'manual' ? (
                  <div>
                    <label className="block text-xs text-blue-200/60 mb-1">Media URL</label>
                    <input name="media_url" value={form.media_url} onChange={handleChange} className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-700/70 bg-slate-800/40 p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-blue-200/60 mb-1">Prompt</label>
                        <input value={aiImg.prompt} onChange={(e)=>setAiImg((s)=>({...s, prompt: e.target.value}))} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., smartphone floating in water splash, studio lighting" />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-200/60 mb-1">Style</label>
                        <select value={aiImg.style} onChange={(e)=>setAiImg((s)=>({...s, style: e.target.value}))} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                          {styles.map(s=> <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-blue-200/60 mb-1">Width</label>
                        <input type="number" min={256} max={2048} value={aiImg.width} onChange={(e)=>setAiImg((s)=>({...s, width: Number(e.target.value)||1024}))} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-200/60 mb-1">Height</label>
                        <input type="number" min={256} max={2048} value={aiImg.height} onChange={(e)=>setAiImg((s)=>({...s, height: Number(e.target.value)||1024}))} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <button type="button" onClick={generateImage} disabled={generatingImg} className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5">
                          {generatingImg ? 'Generating…' : 'Generate'}
                        </button>
                      </div>
                    </div>

                    {generatedUrl && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                        <div className="md:col-span-2 rounded-lg overflow-hidden border border-slate-700/70 bg-slate-900">
                          <img src={generatedUrl} alt="AI creative" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-2">
                          <button type="button" onClick={()=>setForm((f)=>({...f, media_url: generatedUrl}))} className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5">Use this image</button>
                          <button type="button" onClick={async ()=>{ try{ await navigator.clipboard.writeText(generatedUrl); alert('Image URL copied')}catch(e){}}} className="w-full rounded-lg bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5">Copy URL</button>
                          <div className="text-xs text-blue-200/70 break-all">{generatedUrl}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-blue-200/70">CTA</label>
                <select name="call_to_action" value={form.call_to_action} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="shop_now">Shop Now</option>
                  <option value="learn_more">Learn More</option>
                  <option value="sign_up">Sign Up</option>
                  <option value="contact_us">Contact Us</option>
                  <option value="download">Download</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-blue-200/70">Destination URL</label>
                <input name="destination_url" value={form.destination_url} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://your-site.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm text-blue-200/70">Daily Budget ($)</label>
                <input type="number" name="daily_budget" value={form.daily_budget} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Total Budget ($)</label>
                <input type="number" name="total_budget" value={form.total_budget} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Location</label>
                <input name="audience_location" value={form.audience_location} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Age Min</label>
                <input type="number" name="audience_age_min" value={form.audience_age_min} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70">Age Max</label>
                <input type="number" name="audience_age_max" value={form.audience_age_max} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-blue-200/70">Interests (comma separated)</label>
                <input name="audience_interests" value={form.audience_interests} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="fintech, ecommerce, ai" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Platforms</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {defaultPlatforms.map((p) => (
                  <button key={p.key} type="button" onClick={() => togglePlatform(p.key)} className={`px-3 py-1 rounded-full text-sm border ${form.platforms.includes(p.key) ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
            <h4 className="font-semibold">Social Pages (max 5)</h4>
            <p className="text-xs text-blue-300/70">Provide page name and access token for each platform you want to publish to.</p>
            <div className="space-y-3 mt-4">
              {form.social_accounts.slice(0,5).map((acc, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-blue-300/70 w-24">{acc.platform}</span>
                    <input value={acc.page_name} onChange={(e) => updateAccount(idx, 'page_name', e.target.value)} placeholder="Page name" className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <input value={acc.access_token} onChange={(e) => updateAccount(idx, 'access_token', e.target.value)} placeholder="Access token" className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button onClick={createCampaign} disabled={creating} className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-3 font-medium">{creating ? 'Creating...' : 'Save as draft'}</button>
              <button onClick={publish} disabled={publishing} className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-3 font-medium">{publishing ? 'Publishing...' : 'Queue publish (5 pages max)'}</button>
            </div>

            {createResp && (
              <div className="mt-4 text-xs text-blue-100/80 break-words">
                <pre className="whitespace-pre-wrap">{JSON.stringify(createResp, null, 2)}</pre>
              </div>
            )}
            {publishResp && (
              <div className="mt-4 text-xs text-blue-100/80 break-words">
                <pre className="whitespace-pre-wrap">{JSON.stringify(publishResp, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
