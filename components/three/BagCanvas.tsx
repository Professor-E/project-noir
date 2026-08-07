'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { bagLabel, createBag, disposeBag } from '@/components/three/CoffeeBag'
import { prefersReducedMotion } from '@/lib/motion'

/** Ambient spin, in radians per frame. */
const IDLE_SPIN = 0.0035
/** Per-frame decay applied to throw velocity and to the drag tilt. */
const DECAY = 0.94
/** Pointer pixels to radians. */
const DRAG_TO_RAD = 0.007
/** How far a vertical drag may pitch the bag before it stops following. */
const MAX_TILT = 0.35
/** Resting pitch, so the crown and the top edge are both readable. */
const BASE_TILT = 0.07
/** Below this the residual motion is invisible; snapping to 0 parks the loop. */
const EPSILON = 0.00002

/** Palette hexes from the design spec — three.js lights take numbers, not classes. */
const KEY_COLOR = 0xf2ede4
const RIM_COLOR = 0xc8a882
const AMBIENT_COLOR = 0xf2ede4

function hasWebGL(): boolean {
  try {
    const probe = document.createElement('canvas')
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
  } catch {
    return false
  }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

type Props = {
  roast: number
  name: string
  /** Static fallback shown when WebGL is unavailable. */
  image: string
}

export default function BagCanvas({ roast, name, image }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  // null until the capability check has run on the client; rendering the mount
  // (rather than the fallback) in the meantime keeps hydration identical.
  const [webgl, setWebgl] = useState<boolean | null>(null)

  useEffect(() => {
    // Deferred to an effect so the server-rendered markup and the client's
    // first paint match; WebGL only exists client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL())
  }, [])

  useEffect(() => {
    if (webgl !== true) return
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    // Read once at setup, matching how every other component in the project
    // treats the media query.
    const reduced = prefersReducedMotion()

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearAlpha(0)

    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.style.touchAction = 'none'
    canvas.style.cursor = 'grab'
    mount.appendChild(canvas)

    const key = new THREE.DirectionalLight(KEY_COLOR, 2.2)
    key.position.set(3, 4, 5)
    const rim = new THREE.DirectionalLight(RIM_COLOR, 1.1)
    rim.position.set(-4, 2, -3)
    const ambient = new THREE.AmbientLight(AMBIENT_COLOR, 0.35)
    scene.add(key, rim, ambient)

    const bag = createBag(roast, name)
    const label = bagLabel(bag)
    if (label) label.texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    bag.rotation.set(BASE_TILT, -0.42, 0)
    scene.add(bag)

    let dirty = true
    let dragging = false
    let lastX = 0
    let lastY = 0
    let velocity = 0
    let tilt = 0

    // Web fonts are usually still loading when the label is first painted, so
    // the display serif would fall back to Georgia. Repaint once they land.
    if (document.fonts) {
      document.fonts.ready
        .then(() => {
          if (disposed || !label) return
          label.redraw()
          dirty = true
        })
        .catch(() => {})
    }

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      dirty = true
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)

    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      velocity = 0
      canvas.style.cursor = 'grabbing'
      canvas.setPointerCapture(e.pointerId)
      dirty = true
      // No-op unless the reduced-motion branch above has parked the loop.
      start()
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      // The last frame's delta becomes the throw velocity the moment the
      // pointer is released.
      velocity = dx * DRAG_TO_RAD
      bag.rotation.y += velocity
      tilt = clamp(tilt + dy * DRAG_TO_RAD, -MAX_TILT, MAX_TILT)
      dirty = true
    }

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      canvas.style.cursor = 'grab'
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)

    let frame: number | null = null

    const tick = () => {
      let moving = false
      if (!dragging) {
        // Ambient motion only; the drag path above is user-initiated and stays
        // live under reduced motion.
        if (!reduced) {
          bag.rotation.y += IDLE_SPIN
          moving = true
        }
        if (Math.abs(velocity) > EPSILON) {
          bag.rotation.y += velocity
          velocity *= DECAY
          moving = true
        } else {
          velocity = 0
        }
        if (Math.abs(tilt) > EPSILON) {
          tilt *= DECAY
          moving = true
        } else {
          tilt = 0
        }
      }
      bag.rotation.x = BASE_TILT + tilt

      if (moving || dirty) {
        dirty = false
        renderer.render(scene, camera)
      }

      // With motion off there is no ambient spin, so once the residual throw
      // and tilt have decayed there is nothing left to drive: the loop parks
      // itself rather than burning a frame callback forever. A pointerdown
      // (still live under reduced motion) restarts it.
      if (reduced && !dragging && !moving) {
        frame = null
        return
      }

      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame !== null) return
      dirty = true
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      if (frame === null) return
      cancelAnimationFrame(frame)
      frame = null
    }

    // The loop only runs while the canvas is on screen. The observer fires
    // once on registration, so this is also what starts it.
    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start()
          else stop()
        }
      },
      { threshold: 0 },
    )
    visibility.observe(mount)

    return () => {
      disposed = true
      stop()
      visibility.disconnect()
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)

      scene.remove(bag)
      // Disposes every geometry, material and the label CanvasTexture.
      disposeBag(bag)
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }, [webgl, roast, name])

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      {webgl === false ? (
        <Image
          src={image}
          alt={`${name} in its bag`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          ref={mountRef}
          data-cursor
          role="img"
          aria-label={`${name} packaging, rendered in three dimensions. Drag to rotate.`}
          className="absolute inset-0"
        />
      )}
    </div>
  )
}
