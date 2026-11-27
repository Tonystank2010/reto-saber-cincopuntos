import React, { useEffect, useRef, useState } from 'react'

const CLAVE_RESPALDO = 'rscp-ultimo-respaldo'
const INTERVALO_GUARDADO = 30000 // 30 s

export default function Game({ user, supa }) {
  const iframe = useRef(null)
  const estado = useRef(null)
  const restaurado = useRef(false)
  const [aviso, setAviso] = useState('')

  const guardar = React.useCallback(() => {
    const c = iframe.current && iframe.current.contentWindow
    if (!c) return
    c.postMessage({ origen: 'rs-app', tipo: 'rs-export-request' }, '/')
  }, [])

  useEffect(() => {
    const importar = datos => {
      iframe.current.contentWindow.postMessage(
        { origen: 'rs-app', tipo: 'rs-import', datos }, '/')
    }

    const restaurar = () => {
      if (restaurado.current) return
      restaurado.current = true
      try {
        const bruto = user
          ? null
          : localStorage.getItem(CLAVE_RESPALDO)
        if (bruto) importar(JSON.parse(bruto))
      } catch (_) {}
    }

    const enNube = async datos => {
      if (supa && user) {
        const { error } = await supa.from('progreso')
          .upsert({ user_id: user.id, datos, updated_at: new Date().toISOString() })
        if (error) {
          setAviso('Sin conexión con la nube: tu progreso queda guardado en este dispositivo y se sincronizará después.')
        } else {
          setAviso('')
        }
      }
      try { localStorage.setItem(CLAVE_RESPALDO, JSON.stringify(datos)) } catch (_) {}
    }

    const enMensaje = async ev => {
      if (ev.origin !== window.location.origin) return
      const m = ev.data
      if (!m || m.origen !== 'rs-iframe') return
      if (m.tipo === 'rs-lista') {
        restaurar()
        if (supa && user) {
          const { data, error } = await supa.from('progreso')
            .select('datos').eq('user_id', user.id).maybeSingle()
          if (error) {
            setAviso('Sin conexión con la nube: se usa el progreso guardado en este dispositivo.')
            restaurar()
          } else if (data && data.datos) {
            restaurado.current = true
            importar(data.datos)
          }
        }
      } else if (m.tipo === 'rs-export') {
        estado.current = m.datos
        await enNube(m.datos)
      }
    }
    window.addEventListener('message', enMensaje)

    const int = setInterval(guardar, INTERVALO_GUARDADO)
    const vis = () => {
      if (document.visibilityState === 'hidden' && estado.current) enNube(estado.current)
      else if (document.visibilityState === 'visible') guardar()
    }
    const ocultar = () => {
      if (estado.current) enNube(estado.current)
      else guardar()
    }
    document.addEventListener('visibilitychange', vis)
    window.addEventListener('pagehide', ocultar)
    const t0 = setTimeout(() => { guardar(); restaurar() }, 1200)

    return () => {
      window.removeEventListener('message', enMensaje)
      document.removeEventListener('visibilitychange', vis)
      window.removeEventListener('pagehide', ocultar)
      clearInterval(int); clearTimeout(t0)
    }
  }, [user, supa, guardar])

  return (
    <>
      {aviso && <div className="banner" role="status">{aviso}</div>}
      <iframe ref={iframe} title="Reto Saber" className="juego" src="/juego/Reto-Saber.html" />
    </>
  )
}
