import { useEffect, useMemo, useState } from 'react'

const defaultPlatforms = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter/X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'tiktok', label: 'TikTok' },
]

const COMMON_CURRENCIES = [
  'USD','EUR','GBP','NGN','GHS','KES','ZAR','INR','IDR','PHP','VND','JPY','BRL','MXN','CAD','AUD'
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
    setForm((f) => ({ ...f, [name]: name.includes('budget') || name.includes('age') || name === 'duration_days' ? Number(value) : value }))
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

  // Currency & location detection + overrides
  const [rates, setRates] = useState(null)
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1, country: 'US', loading: true })
  const [overrideCode, setOverrideCode] = useState('')
  const [roundLocal, setRoundLocal] = useState(true)
  const [durationDays, setDurationDays] = useState(7)
  const [autoTotal, setAutoTotal] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function detectCurrency() {
      try {
        const locRes = await fetch('https://ipapi.co/json/')
        const loc = await locRes.json().catch(() => ({}))
        const detectedCode = loc?.currency || 'USD'
        const country = loc?.country || 'US'

        const rateRes = await fetch('https://api.exchangerate.host/latest?base=USD')
        const rateData = await rateRes.json().catch(() => ({}))
        const allRates = rateData?.rates || {}
        const rate = allRates[detectedCode] || 1

        const code = overrideCode || detectedCode
        const symbol = new Intl.NumberFormat(undefined, { style: 'currency', currency: code })
          .formatToParts(1)
          .find((p) => p.type === 'currency')?.value || '$'

        if (!cancelled) {
          setRates(allRates)
          const useRate = allRates[code] || 1
          setCurrency({ code, symbol, rate: useRate, country, loading: false })
        }
      } catch (e) {
        if (!cancelled) setCurrency({ code: 'USD', symbol: '$', rate: 1, country: 'US', loading: false })
      }
    }
    detectCurrency()
    return () => { cancelled = true }
  }, [overrideCode])

  // Auto-calc total budget when enabled or when inputs change
  useEffect(() => {
    if (autoTotal) {
      setForm((f) => ({ ...f, total_budget: Number(((f.daily_budget || 0) * (durationDays || 0)).toFixed(2)) }))
    }
  }, [autoTotal, durationDays, form.daily_budget])

  const prettyRound = (value, code) => {
    if (!roundLocal) return value
    let v = value
    switch (code) {
      case 'NGN':
      case 'IDR':
      case 'VND':
        // round to nearest 50 for high-integer currencies
        v = Math.round(v / 50) * 50
        break
      case 'JPY':
        v = Math.round(v)
        break
      default:
        v = Math.round(v)
    }
    return v
  }

  const formatLocalRaw = (usd) => {
    const value = (Number(usd) || 0) * (currency.rate || 1)
    const rounded = prettyRound(value, currency.code)
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.code }).format(rounded)
    } catch {
      return `${currency.code} ${rounded.toFixed(0)}`
    }
  }

  const quickPlan = () => setForm((f) => ({ ...f, daily_budget: 0.7 }))

  const [creating, setCreating] = useState(false)
  const [createResp, setCreateResp] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishResp, setPublishResp] = useState(null)

  // Analytics & actions state
  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  const createCampaign = async () => {
    setCreating(true)
    setCreateResp(null)
    setAnalytics(null)
    try {
      const interests = form.audience_interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const payload = { ...form, audience_interests: interests, duration_days: durationDays, currency: currency.code }
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
      const payload = { campaign: { ...form, audience_interests: interests, duration_days: durationDays, currency: currency.code } }
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

  const fetchAnalytics = async (id) => {
    if (!id) return
    try {
      setLoadingAnalytics(true)
      setActionMsg('')
      const res = await fetch(api(`/api/campaigns/${id}/analytics`))
      const data = await res.json()
      setAnalytics(data)
    } catch (e) {
      setActionMsg('Failed to load analytics')
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const doBoost = async (id) => {
    if (!id) return
    try {
      setActionMsg('')
      const res = await fetch(api(`/api/campaigns/${id}/boost`), { method: 'POST' })
      const data = await res.json()
      setActionMsg(data?.message || 'Boost scheduled')
    } catch (e) {
      setActionMsg('Failed to boost')
    }
  }

  const doViral = async (id) => {
    if (!id) return
    try {
      setActionMsg('')
      const res = await fetch(api(`/api/campaigns/${id}/viral`), { method: 'POST' })
      const data = await res.json()
      setActionMsg(data?.message || 'Viral push initiated')
    } catch (e) {
      setActionMsg('Failed to start viral push')
    }
  }

  const shareUrlsFor = (id) => analytics?.share_urls || null

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
                <select name="objective" value={form.objective} onChange={handleChange} className="mt-1 w/full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
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
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm text-blue-200/70">Daily Budget (USD)</label>
                  <button type="button" onClick={quickPlan} className="text-xs px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40">Use $0.70/day</button>
                </div>
                <input type="number" step="0.1" min={0.7} name="daily_budget" value={form.daily_budget} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-blue-300/70">{currency.loading ? 'Detecting currency…' : `≈ ${formatLocalRaw(form.daily_budget)} per day`}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm text-blue-200/70">Total Budget (USD)</label>
                  <div className="flex items-center gap-2 text-xs">
                    <input id="autoTotal" type="checkbox" checked={autoTotal} onChange={(e)=>setAutoTotal(e.target.checked)} />
                    <label htmlFor="autoTotal" className="cursor-pointer">Auto-calc</label>
                  </div>
                </div>
                <input type="number" step="0.1" min={0} name="total_budget" value={form.total_budget} onChange={(e)=>{ setAutoTotal(false); handleChange(e) }} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="mt-1 text-xs text-blue-300/70">{currency.loading ? '' : `≈ ${formatLocalRaw(form.total_budget)} total`}</p>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm text-blue-200/70">Duration (days)</label>
                </div>
                <input type="number" min={1} step={1} value={durationDays} onChange={(e)=>setDurationDays(Number(e.target.value)||1)} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="mt-1 text-[11px] text-blue-300/60">Total = Daily × Days when Auto-calc is on.</p>
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="block text-sm text-blue-200/70">Currency</label>
                  <select value={overrideCode || currency.code} onChange={(e)=>setOverrideCode(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Detected ({currency.code})</option>
                    {COMMON_CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2">
                    <input id="roundLocal" type="checkbox" checked={roundLocal} onChange={(e)=>setRoundLocal(e.target.checked)} />
                    <label htmlFor="roundLocal" className="text-sm text-blue-200/80">Round local price</label>
                  </div>
                </div>
                <div className="flex items-end">
                  {!currency.loading && (
                    <p className="text-xs text-blue-300/70">Approximate pricing shown in {currency.code} for your location.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-blue-200/70">Location</label>
                <input name="audience_location" value={form.audience_location} onChange={handleChange} className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder={currency.loading ? '' : `Detected: ${currency.country}`} />
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

            {/* Analytics & Actions */}
            {createResp?.id && (
              <div className="mt-6 border-t border-slate-700/60 pt-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold">AI Insights</h5>
                  <div className="flex items-center gap-2">
                    <button onClick={() => fetchAnalytics(createResp.id)} className="text-xs rounded px-2 py-1 bg-indigo-600 hover:bg-indigo-700">{loadingAnalytics ? 'Loading…' : 'Analyze'}</button>
                    <button onClick={() => doBoost(createResp.id)} className="text-xs rounded px-2 py-1 bg-amber-600 hover:bg-amber-700">Boost</button>
                    <button onClick={() => doViral(createResp.id)} className="text-xs rounded px-2 py-1 bg-pink-600 hover:bg-pink-700">Viral</button>
                  </div>
                </div>
                {actionMsg && <p className="text-xs text-blue-300/80 mt-2">{actionMsg}</p>}

                {analytics && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <Stat label="Predicted reach" value={analytics.predicted_reach} />
                      <Stat label="Predicted clicks" value={analytics.predicted_clicks} />
                      <Stat label="CTR" value={`${analytics.predicted_ctr}%`} />
                      <Stat label="Cost per lead" value={`$${analytics.predicted_cpl}`} />
                      <Stat label="Leads (low)" value={analytics.predicted_leads_low} />
                      <Stat label="Leads (high)" value={analytics.predicted_leads_high} />
                      <Stat label="Risk score" value={analytics.risk_score} />
                    </div>
                    {analytics.suggestions?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-wide text-blue-300/70 mb-1">Suggestions</p>
                        <ul className="list-disc pl-5 space-y-1 text-blue-100/90">
                          {analytics.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analytics.share_urls && (
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-wide text-blue-300/70 mb-1">Share</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(analytics.share_urls).map(([k, v]) => (
                            <a key={k} href={v} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">{k}</a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
      <p className="text-xs text-blue-300/70">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  )
}
