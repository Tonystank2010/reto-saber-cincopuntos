import React, { useEffect, useState } from 'react'
import { supa, cloudConfigured } from './supabase.js'
import Login from './components/Login.jsx'
import Game from './components/Game.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(cloudConfigured)

  useEffect(() => {
    if (!supa) return
    supa.auth.getSession().then(({ data }) => {
      setUser(data.session ? data.session.user : null)
      setCargando(false)
    })
    const { data } = supa.auth.onAuthStateChange((_e, session) =>
      setUser(session ? session.user : null)
    )
    return () => data.subscription.unsubscribe()
  }, [])

  if (!cloudConfigured) {
    return (
      <>
        <div className="banner">
          Modo local: el progreso se guarda en este navegador.
          Configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para sincronizar en la nube.
        </div>
        <Game user={null} supa={null} />
      </>
    )
  }
  if (cargando) return <div className="cargando">Cargando…</div>
  return user ? <Game user={user} supa={supa} /> : <Login onListo={u => setUser(u)} supa={supa} />
}
