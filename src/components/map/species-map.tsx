'use client'

import { useEffect, useRef } from 'react'

export type ObsMarker = {
  lat: number
  lng: number
  speciesName: string
  photoUrl: string | null
  groupName: string | null
}

type Props = {
  markers: ObsMarker[]
  height?: number
}

const NISHIIZU_CENTER = { lat: 34.775, lng: 138.748 }

const GROUP_PIN: Record<string, { color: string; emoji: string }> = {
  '魚類':       { color: '#1a7090', emoji: '🐟' },
  'ウミウシ':   { color: '#c05830', emoji: '🐙' },
  '甲殻類':    { color: '#906020', emoji: '🦀' },
  '頭足類':    { color: '#2a6080', emoji: '🦑' },
  '海藻・海草': { color: '#1a6038', emoji: '🌿' },
  'その他':    { color: '#4a4a6a', emoji: '🐚' },
}
const DEFAULT_PIN = { color: '#888888', emoji: '❓' }

function pinHtml(groupName: string | null): string {
  const { color, emoji } = (groupName ? GROUP_PIN[groupName] : null) ?? DEFAULT_PIN
  return `
    <div style="
      position:relative;
      width:38px;height:38px;
      border-radius:50%;
      background:${color};
      border:3px solid rgba(255,255,255,0.95);
      box-shadow:0 3px 12px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:18px;line-height:1;
    ">
      ${emoji}
      <div style="
        position:absolute;bottom:-9px;left:50%;
        transform:translateX(-50%);
        width:0;height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:10px solid ${color};
      "></div>
    </div>
  `
}

export function SpeciesMap({ markers, height = 480 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const init = async () => {
      const L = await import('leaflet')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(containerRef.current!, {
        center: [NISHIIZU_CENTER.lat, NISHIIZU_CENTER.lng],
        zoom: 12,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      for (const m of markers) {
        const icon = L.divIcon({
          html:       pinHtml(m.groupName),
          iconSize:   [38, 48],
          iconAnchor: [19, 48],
          className:  '',
        })

        const photoHtml = m.photoUrl
          ? `<img src="${m.photoUrl}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-top:6px;display:block;">`
          : ''

        const popup = L.popup({ maxWidth: 180 }).setContent(`
          <div style="font-size:13px;font-weight:800;color:#0d2d42;line-height:1.3;">${m.speciesName}</div>
          ${photoHtml}
        `)

        L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(popup)
      }

      if (markers.length > 0) {
        try {
          const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]))
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
        } catch {
          // all markers at same point
        }
      }

      mapRef.current = map
    }

    init()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={containerRef} style={{ width: '100%', height, background: '#c5dfe8' }} />
    </>
  )
}
