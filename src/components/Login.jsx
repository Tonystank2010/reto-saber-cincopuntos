import React, { useState } from 'react'

export default function Login({ supa }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const entrar = async crear => {
    setError(''); setOcupado(true)
    try {
      const r = crear
        ? await supa.auth.signUp({ email, password: pass })
        : await supa.auth.signInWithPassword({ email, password: pass })
      if (r.error) setError(r.error.message)
    } finally { setOcupado(false) }
  }

  return (
    <div className="login">
      <img src="/icon.svg" alt="" width="72" height="72" />
      <h1>Reto Saber · Cinco Puntos</h1>
      <p className="muted">Crea tu cuenta o entra para guardar tu progreso en la nube.</p>
      <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={pass}
             onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && entrar(false)} />
      <button disabled={ocupado || !email || pass.length < 6} onClick={() => entrar(false)}>Entrar</button>
      <button className="secundario" disabled={ocupado || !email || pass.length < 6} onClick={() => entrar(true)}>
        Crear cuenta
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
