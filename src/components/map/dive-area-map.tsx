'use client'

import { useState, useCallback } from 'react'

type Coords = { x: number; y: number }

type Props = {
  areaId: string
  selectedCoords: Coords | null
  onPinPlace: (coords: Coords) => void
}

const AREA_CONFIGS: Record<string, { name: string; color: string; features: Array<{ type: string; x: number; y: number; w?: number; h?: number; r?: number; label?: string }> }> = {
  default: {
    name: 'エリアマップ',
    color: '#1a6b8a',
    features: [
      { type: 'rect', x: 0, y: 140, w: 400, h: 60, label: '海岸線' },
      { type: 'ellipse', x: 200, y: 250, r: 40, label: '浅瀬' },
      { type: 'ellipse', x: 120, y: 320, r: 25, label: 'ポイントA' },
      { type: 'ellipse', x: 280, y: 310, r: 30, label: 'ポイントB' },
    ],
  },
}

export function DiveAreaMap({ areaId, selectedCoords, onPinPlace }: Props) {
  const [hovering, setHovering] = useState(false)
  const W = 360
  const H = 240

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const y = ((e.clientY - rect.top) / rect.height) * H
    onPinPlace({ x: Math.round(x), y: Math.round(y) })
  }, [onPinPlace, W, H])

  return (
    <div
      className="map-container"
      style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-base)', overflow: 'hidden' }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{ display: 'block', cursor: 'crosshair' }}
      >
        {/* Water background */}
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d6eef5" />
            <stop offset="100%" stopColor="#b8daea" />
          </linearGradient>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(63,126,152,0.12)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="url(#waterGrad)" />
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Depth contours */}
        <ellipse cx={W/2} cy={H*0.85} rx={W*0.55} ry={H*0.25} fill="none" stroke="rgba(63,126,152,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        <ellipse cx={W/2} cy={H*0.85} rx={W*0.35} ry={H*0.15} fill="none" stroke="rgba(63,126,152,0.3)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Coastline */}
        <path
          d={`M 0 ${H*0.35} Q ${W*0.15} ${H*0.3} ${W*0.3} ${H*0.32} Q ${W*0.45} ${H*0.28} ${W*0.55} ${H*0.3} Q ${W*0.7} ${H*0.32} ${W*0.85} ${H*0.28} Q ${W*0.95} ${H*0.25} ${W} ${H*0.27} L ${W} 0 L 0 0 Z`}
          fill="#d4c4a8"
          stroke="#c4b090"
          strokeWidth="1.5"
        />

        {/* Shore texture */}
        <path
          d={`M 0 ${H*0.35} Q ${W*0.15} ${H*0.3} ${W*0.3} ${H*0.32} Q ${W*0.45} ${H*0.28} ${W*0.55} ${H*0.3} Q ${W*0.7} ${H*0.32} ${W*0.85} ${H*0.28} Q ${W*0.95} ${H*0.25} ${W} ${H*0.27}`}
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="3"
        />

        {/* Labels */}
        <text x={W*0.1} y={H*0.2} fontSize="9" fill="rgba(139,101,60,0.7)" fontFamily="sans-serif">陸</text>
        <text x={W*0.5} y={H*0.65} fontSize="8" fill="rgba(63,126,152,0.5)" fontFamily="sans-serif" textAnchor="middle">— 10m —</text>
        <text x={W*0.5} y={H*0.8} fontSize="8" fill="rgba(63,126,152,0.5)" fontFamily="sans-serif" textAnchor="middle">— 20m —</text>

        {/* Crosshair hint when hovering without pin */}
        {hovering && !selectedCoords && (
          <>
            <text x={W/2} y={H*0.55} fontSize="11" fill="rgba(63,126,152,0.6)" fontFamily="sans-serif" textAnchor="middle">
              タップして位置を指定
            </text>
          </>
        )}

        {/* Placed pin */}
        {selectedCoords && (
          <g>
            <circle
              cx={selectedCoords.x}
              cy={selectedCoords.y}
              r={12}
              fill="rgba(224,138,60,0.2)"
              stroke="none"
            >
              <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <path
              d={`M ${selectedCoords.x} ${selectedCoords.y - 20} C ${selectedCoords.x - 8} ${selectedCoords.y - 20} ${selectedCoords.x - 8} ${selectedCoords.y - 12} ${selectedCoords.x} ${selectedCoords.y} C ${selectedCoords.x + 8} ${selectedCoords.y - 12} ${selectedCoords.x + 8} ${selectedCoords.y - 20} ${selectedCoords.x} ${selectedCoords.y - 20} Z`}
              fill="var(--accent-sun)"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx={selectedCoords.x} cy={selectedCoords.y - 14} r={3} fill="white" />
          </g>
        )}
      </svg>
    </div>
  )
}
