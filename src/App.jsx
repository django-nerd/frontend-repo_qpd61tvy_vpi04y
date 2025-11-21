import Hero from './components/Hero'
import Features from './components/Features'
import AdPreview from './components/AdPreview'
import AccountsManager from './components/AccountsManager'
import CampaignBuilder from './components/CampaignBuilder'
import PaystackCTA from './components/PaystackCTA'

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Hero />
      <Features />
      <AdPreview />
      <AccountsManager />
      <CampaignBuilder />
      <PaystackCTA />
      <footer className="py-10 text-center text-sm text-blue-300/60">Built with ❤️ by your AI Ads Studio</footer>
    </div>
  )
}

export default App
