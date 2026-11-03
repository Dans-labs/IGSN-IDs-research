import { useEffect, useState } from 'react'
import GLMap, { NavigationControl } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import type { IControl, Map as MaplibreMap } from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import DrawRectangleMode from 'mapbox-gl-draw-rectangle-mode'
import { Input } from '@base-ui/react/input'
import type { Feature, FeatureCollection } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { useFieldContext } from './form-context'
import MapPinIcon from '@heroicons/react/24/solid/MapPinIcon'
import PencilSquareIcon from '@heroicons/react/24/solid/PencilSquareIcon'
import CursorArrowRaysIcon from '@heroicons/react/24/solid/CursorArrowRaysIcon'
import { m } from '#/paraglide/messages'
import { Button as BaseButton } from '@base-ui/react/button'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { FormButton as Button } from './Buttons'

setWorkerUrl(workerUrl)

// this CJS package can arrive as { default: mode } depending on the bundler; unwrap it
const DrawRectangle = DrawRectangleMode.default ?? DrawRectangleMode

/* What lives in the form: plain numbers, easy to validate and edit by hand. */
export type GeoFeature =
  | { id: string; type: 'point'; lng: number; lat: number }
  | {
      id: string
      type: 'bbox'
      west: number
      south: number
      east: number
      north: number
    }

const FIELDS = {
  point: ['lng', 'lat'],
  bbox: ['west', 'south', 'east', 'north'],
} as const

const TOOLS = [
  ['simple_select', m.select(), CursorArrowRaysIcon],
  ['draw_point', m.addPoint(), MapPinIcon],
  ['draw_rectangle', m.addBoundingBox(), PencilSquareIcon],
] as const

const r = (n: number) => Math.round(n * 1e6) / 1e6

/* The only two functions that know how our model maps to the map.
   Add a `crs` to GeoFeature later and transform in here; nothing else changes. */
const toDraw = (f: GeoFeature): Feature => ({
  id: f.id,
  type: 'Feature',
  properties: {},
  geometry:
    f.type === 'point'
      ? { type: 'Point', coordinates: [f.lng, f.lat] }
      : {
          type: 'Polygon',
          coordinates: [
            [
              [f.west, f.south],
              [f.east, f.south],
              [f.east, f.north],
              [f.west, f.north],
              [f.west, f.south],
            ],
          ],
        },
})

const fromDraw = (fc: FeatureCollection): Array<GeoFeature> =>
  fc.features.flatMap((f): Array<GeoFeature> => {
    const id = String(f.id)
    if (f.geometry.type === 'Point') {
      const [lng, lat] = f.geometry.coordinates
      return [{ id, type: 'point', lng: r(lng), lat: r(lat) }]
    }
    if (f.geometry.type === 'Polygon') {
      // any polygon the user ends up with is reduced to its bounding box
      const ring = f.geometry.coordinates[0]
      const xs = ring.map((c) => c[0])
      const ys = ring.map((c) => c[1])
      return [
        {
          id,
          type: 'bbox',
          west: r(Math.min(...xs)),
          south: r(Math.min(...ys)),
          east: r(Math.max(...xs)),
          north: r(Math.max(...ys)),
        },
      ]
    }
    return []
  })

/* Keeps its own text so half-typed values ("-", "1.") don't get clobbered. */
function NumberInput({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (n: number) => void
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => {
    if (Number(text) !== value) setText(String(value)) // value changed from the map
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <label className="flex flex-1 flex-col text-xs capitalize gap-1">
      {label}
      <Input
        inputMode="decimal"
        value={text}
        className="h-8 w-full border p-1 border rounded-sm text-base border-gray-300"
        onChange={(e) => {
          setText(e.target.value)
          const n = parseFloat(e.target.value)
          if (!isNaN(n)) onCommit(n)
        }}
      />
    </label>
  )
}

export default function GeoField({ label }: { label: string }) {
  const field = useFieldContext<Array<GeoFeature>>()
  const features = field.state.value
  const [map, setMap] = useState<MaplibreMap>()
  const [mode, setMode] = useState('simple_select')
  const [draw] = useState(
    () =>
      new MapboxDraw({
        displayControlsDefault: false,
        modes: { ...MapboxDraw.modes, draw_rectangle: DrawRectangle },
      }),
  )

  const commit = (next: Array<GeoFeature>) => {
    field.handleChange(next)
    field.handleBlur()
  }

  // 1. mount draw on the map once it has loaded
  useEffect(() => {
    if (!map) return
    const control = draw as unknown as IControl // draw is typed against mapbox-gl's Map
    map.addControl(control)
    return () => void map.removeControl(control)
  }, [map, draw])

  // 2. map -> form (re-subscribes every render, so it never sees stale state)
  useEffect(() => {
    if (!map) return
    const m = map as any // 'draw.*' events aren't in maplibre's event map
    const sync = () => commit(fromDraw(draw.getAll()))
    const handlers: Record<string, (e: any) => void> = {
      'draw.create': sync,
      'draw.update': sync,
      'draw.delete': sync,
      'draw.modechange': (e) => setMode(e.mode),
    }
    Object.entries(handlers).forEach(([event, fn]) => m.on(event, fn))
    return () =>
      Object.entries(handlers).forEach(([event, fn]) => m.off(event, fn))
  })

  // 3. form -> map (draw.set fires no events, so there is no loop)
  useEffect(() => {
    if (!map) return
    if (JSON.stringify(fromDraw(draw.getAll())) !== JSON.stringify(features)) {
      draw.set({ type: 'FeatureCollection', features: features.map(toDraw) })
    }
  }, [map, features, draw])

  // manual add: drops the shape into the current view so it is visible right away
  // const add = (type: GeoFeature['type']) => {
  //   if (!map) return
  //   const id = crypto.randomUUID()
  //   const { lng, lat } = map.getCenter()
  //   const [[w, s], [e, n]] = map.getBounds().toArray()
  //   const dx = (e - w) / 4
  //   const dy = (n - s) / 4
  //   commit([
  //     ...features,
  //     type === 'point'
  //       ? { id, type, lng: r(lng), lat: r(lat) }
  //       : {
  //           id,
  //           type,
  //           west: r(w + dx),
  //           south: r(s + dy),
  //           east: r(e - dx),
  //           north: r(n - dy),
  //         },
  //   ])
  // }

  const update = (id: string, patch: Record<string, number>) =>
    commit(features.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  return (
    <div className="flex flex-col gap-1 mb-2">
      <span className="text-xs">{label}</span>

      <div className="relative h-96 border border-gray-300 rounded-sm overflow-hidden">
        <GLMap
          initialViewState={{ longitude: 4.34, latitude: 52.08, zoom: 6 }}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          onLoad={(e) => setMap(e.target)}
        >
          <NavigationControl position="top-left" />
        </GLMap>

        <div className="absolute right-2 top-2 flex flex-col bg-white/80 border border-gray-300 rounded-sm shadow-sm">
          {TOOLS.map(([m, text, Icon], i) => (
            <BaseButton
              key={m}
              type="button"
              disabled={!map}
              aria-pressed={mode === m}
              className={`aria-pressed:bg-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-100 ${i === TOOLS.length - 1 ? '' : 'border-b border-gray-300'}`}
              onClick={() => {
                draw.changeMode(m as 'simple_select')
                setMode(m) // highlight right away; draw.modechange resets it when draw switches itself
              }}
              aria-label={text}
            >
              <Icon className="inline-block w-4 h-4" />
            </BaseButton>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">{m.mapDescription()}</p>

      <ul className="flex flex-col gap-2">
        {features.map((f) => (
          <li key={f.id} className="flex items-end gap-2">
            <span className="w-10 pb-2 text-xs uppercase text-neutral-500">
              {m[f.type]()}
            </span>
            {FIELDS[f.type].map((key) => (
              <NumberInput
                key={key}
                label={key}
                value={(f as Record<string, any>)[key]}
                onCommit={(n) => update(f.id, { [key]: n })}
              />
            ))}
            <Button
              aria-label="Delete"
              onClick={() => commit(features.filter((x) => x.id !== f.id))}
              text="✕"
            />
          </li>
        ))}
      </ul>

      {/* 
      // Manual controls for adding points and bounding boxes
      <div className="flex gap-2">
        <Button
          disabled={!map}
          onClick={() => add('point')}
          text={m.addPoint()}
        />
        <Button
          disabled={!map}
          onClick={() => add('bbox')}
          text={m.addBoundingBox()}
        />
      </div> */}

      {field.state.meta.errors.map((e, i) => (
        <p key={i} role="alert" className="text-sm text-red-500">
          {e?.message ?? String(e)}
        </p>
      ))}
    </div>
  )
}
