'use client'

import { useEffect, useRef } from 'react'

export type ObsMarker = {
  lat: number
  lng: number
  speciesName: string
  photoUrl: string | null
}

type Props = {
  markers: ObsMarker[]
  height?: number
}

const NISHIIZU_CENTER = { lat: 34.775, lng: 138.748 }

export function SpeciesMap({ markers, height = 480 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const init = async () => {
      const L = await import('leaflet')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

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
          html: `<div style="
            width:16px;height:22px;
            background:#e8714a;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize:   [16, 22],
          iconAnchor: [8, 22],
          className:  '',
        })

        const photoHtml = m.photoUrl
          ? `<img src="${m.photoUrl}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-top:6px;display:block;">`
          : ''

        const popup = L.popup({ maxWidth: 180, className: 'obs-popup' }).setContent(`
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
          // markers might all be same point
        }
      }

      mapRef.current = map
    }

    init()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  // markers changes are handled by key on parent — no dep needed here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={containerRef} style={{ width: '100%', height, background: '#c5dfe8' }} />
    </>
  )
}
