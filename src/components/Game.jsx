import React, { useEffect, useRef } from 'react'

const CLAVE_RESPALDO = 'rscp-ultimo-respaldo'
const INTERVALO_GUARDADO = 30000 // 30 s

// Envoltura del demo (iframe) con puente postMessage:
//  - pide el estado del juego (rs-export-request) -> lo guarda en Supabase o local
//  - al entrar, restaura el progreso guardado (rs-import)
export default function Game({ user, supa }) {
  const iframe = useRef(null)
  const estado = useRef(null)

  const guardar = React.useCallback(() => {
    const c = iframe.current && iframe.current.contentWindow
    if (!c) return
    c.postMessage({ origen: 'rs-app', tipo: 'rs-export-request' }, '*')
  }, [])

  useEffect(() => {
    const restaurar = () => {
      try {
        const bruto = user
          ? null // en la nube se carga del servidor
          : localStorage.getItem(CLAVE_RESPALDO)
        if (bruto) iframe.current.contentWindow.postMessage(
          { origen: 'rs-app', tipo: 'rs-import', datos: JSON.parse(bruto) }, '*')
      } catch (_) {}
    }

    const enNube = async datos => {
      if (supa && user) {
        await supa.from('progreso').upsert({ user_id: user.id, datos, updated_at: new Date().toISOString() })
      }
      try { localStorage.setItem(CLAVE_RESPALDO, JSON.stringify(datos)) } catch (_) {}
    }

    const enMensaje = async ev => {
      const m = ev.data
      if (!m || m.origen !== 'rs-iframe') return
      if (m.tipo === 'rs-lista') {
        if (supa && user) {
          const { data } = await supa.from('progreso').select('datos').eq('user_id', user.id).maybeSingle()
          if (data && data.datos) iframe.current.contentWindow.postMessage(
            { origen: 'rs-app', tipo: 'rs-import', datos: data.datos }, '*')
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
    document.addEventListener('visibilitychange', vis)
    // restaurar cuando el iframe este listo
    const t0 = setTimeout(() => { guardar(); restaurar() }, 1200)

    return () => {
      window.removeEventListener('message', enMensaje)
      document.removeEventListener('visibilitychange', vis)
      clearInterval(int); clearTimeout(t0)
    }
  }, [user, supa, guardar])

  return <iframe ref={iframe} title="Reto Saber" className="juego" src="/demo/Reto-Saber-Demo.html" />
}
