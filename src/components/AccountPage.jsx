import { useState } from 'react'
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react'
import { imageUrl } from '../data/products.js'

export default function AccountPage({ onBack }) {
  const [mode, setMode] = useState('sign-in')
  const [notice, setNotice] = useState('')
  const isCreatingAccount = mode === 'create'

  const changeMode = nextMode => {
    setMode(nextMode)
    setNotice('')
  }

  const submit = event => {
    event.preventDefault()
    event.currentTarget.reset()
    setNotice('Account access is not connected yet. No information was sent or saved.')
  }

  return <main className="account-page">
    <button className="account-back text-link" onClick={onBack}><ArrowLeft size={15} /> Back to shopping</button>
    <div className="account-layout">
      <div className="account-image">
        <img src={imageUrl('photo-1600210492486-724fe5c67fb0', 1200)} alt="A calm, sunlit living room" />
        <div><p className="eyebrow">BETTER THINGS, EVERY DAY</p><p className="serif">Make room for<br /><em>what matters.</em></p></div>
      </div>
      <section className="account-form-panel" aria-labelledby="account-title">
        <a href="#top" className="account-wordmark">MIRZA</a>
        <p className="eyebrow">YOUR MIRZA ACCOUNT</p>
        <h1 className="serif" id="account-title">{isCreatingAccount ? 'Join us.' : 'Welcome back.'}</h1>
        <p className="account-intro">{isCreatingAccount ? 'Create an account to keep your favourite things close.' : 'Sign in to pick up where you left off.'}</p>
        <div className="account-tabs" role="group" aria-label="Account options">
          <button type="button" aria-pressed={!isCreatingAccount} className={!isCreatingAccount ? 'active' : ''} onClick={() => changeMode('sign-in')}>Sign in</button>
          <button type="button" aria-pressed={isCreatingAccount} className={isCreatingAccount ? 'active' : ''} onClick={() => changeMode('create')}>Create account</button>
        </div>
        <form className="account-form" onSubmit={submit}>
          {isCreatingAccount && <label>Full name<input name="name" type="text" autoComplete="name" placeholder="Your name" required /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
          <label>Password<input name="password" type="password" autoComplete={isCreatingAccount ? 'new-password' : 'current-password'} placeholder="At least 8 characters" minLength={8} required /></label>
          <button className="gold-button account-submit" type="submit">{isCreatingAccount ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button>
          {notice && <p className="account-notice" role="status">{notice}</p>}
        </form>
        <p className="account-security"><LockKeyhole size={14} /> Sign-in is not connected. Form details are never sent or stored.</p>
      </section>
    </div>
  </main>
}
