'use client'

import { useEffect, useRef, useCallback } from 'react'

export type LatLng = { lat: number; lng: number }

type Props = {
  markerPos: LatLng | null
  onMapClick: (pos: LatLng) => void
  center?: LatLng
  zoom?: number
  height?: number
}

const NISHIIZU_CENTER: LatLng = { lat: 34.775, lng: 138.748 }

export function LeafletMap({
  markerPos,
  onMapClick,
  center = NISHIIZU_CENTER,
  zoom = 13,
  height = 320,
}: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<import('leaflet').Map | null>(null)
  const markerRef     = useRef<import('leaflet').Marker | null>(null)
  const onClickRef    = useRef(onMapClick)
  onClickRef.current  = onMapClick

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let L: typeof import('leaflet')

    const init = async () => {
      L = await import('leaflet')

      /* Fix default marker icon paths broken by webpack */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      map.on('click', e => {
        onClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng })
      })

      mapRef.current = map
    }

    init()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Update marker when markerPos changes */
  const updateMarker = useCallback(async (pos: LatLng | null) => {
    if (!mapRef.current) return
    const L = await import('leaflet')

    markerRef.current?.remove()
    markerRef.current = null

    if (!pos) return

    const icon = L.divIcon({
      html: `
        <div style="
          width:20px;height:28px;
          background:#e8714a;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:2.5px solid #fff;
          box-shadow:0 3px 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize:   [20, 28],
      iconAnchor: [10, 28],
      className:  '',
    })

    const marker = L.marker([pos.lat, pos.lng], { icon }).addTo(mapRef.current)
    markerRef.current = marker
    mapRef.current.panTo([pos.lat, pos.lng])
  }, [])

  useEffect(() => { updateMarker(markerPos) }, [markerPos, updateMarker])

  return (
    <>
      {/* Leaflet CSS from CDN — loaded once */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height,
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          background: '#c5dfe8',
        }}
      />
    </>
  )
}
