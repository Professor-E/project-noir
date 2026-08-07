import * as THREE from 'three'

/**
 * The bag is built entirely from primitives — no imported meshes. A body box
 * carries the printed face, a smaller box folded over the crown stands in for
 * the roll-top (and reads as a bevel on the top edges), and two thin slabs at
 * the sides stand in for the gussets.
 *
 * Palette note: three.js materials take numeric colours, not CSS classes, so
 * the values below are the literal palette hexes from the design spec.
 */
const INK = '#14110F'
const CREMA = '#C8A882'
const BONE = '#F2EDE4'
const ASH = '#8A8178'

const LABEL_W = 512
const LABEL_H = 768

const BODY = { w: 1.2, h: 1.8, d: 0.45 }
const CROWN = { w: 1.14, h: 0.22, d: 0.4 }
const GUSSET = { w: 0.06, h: 1.76, d: 0.52 }

/** BoxGeometry material order: +x, -x, +y, -y, +z, -z. The label rides +z. */
const FRONT_FACE = 4

export type BagLabel = {
  texture: THREE.CanvasTexture
  /** Repaints the label canvas — used once web fonts finish loading. */
  redraw: () => void
}

type BagUserData = { label?: BagLabel }

/** Reads the label handle off a group built by `createBag`. */
export function bagLabel(group: THREE.Group): BagLabel | undefined {
  return (group.userData as BagUserData).label
}

function cssFont(variable: string, fallback: string, size: number): string {
  let family = fallback
  if (typeof document !== 'undefined') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
    if (value) family = `${value}, ${fallback}`
  }
  return `${size}px ${family}`
}

const displayFont = (size: number) =>
  cssFont('--font-instrument-serif', 'Georgia, "Times New Roman", serif', size)

const sansFont = (size: number) =>
  cssFont('--font-inter', 'Helvetica, Arial, sans-serif', size)

/**
 * Letter-spaced text, drawn glyph by glyph and centred on `centerX`. Canvas
 * `letterSpacing` is not universally supported, and the label leans on tracked
 * capitals throughout, so it is measured by hand.
 */
function tracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  tracking: number,
) {
  const chars = [...text]
  const width =
    chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + tracking * (chars.length - 1)
  const previousAlign = ctx.textAlign
  ctx.textAlign = 'left'
  let x = centerX - width / 2
  for (const c of chars) {
    ctx.fillText(c, x, y)
    x += ctx.measureText(c).width + tracking
  }
  ctx.textAlign = previousAlign
}

/** Paints the printed face: wordmark, product name, crema rule, roast ticks. */
function drawLabel(canvas: HTMLCanvasElement, roast: number, name: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const cx = LABEL_W / 2
  ctx.clearRect(0, 0, LABEL_W, LABEL_H)

  ctx.fillStyle = INK
  ctx.fillRect(0, 0, LABEL_W, LABEL_H)

  // Foil sheen baked into the albedo: a soft diagonal wash of bone and crema
  // falling off into void, so the face still catches light when the specular
  // highlight is somewhere else.
  const sheen = ctx.createLinearGradient(0, 0, LABEL_W, LABEL_H)
  sheen.addColorStop(0, 'rgba(242, 237, 228, 0.10)')
  sheen.addColorStop(0.38, 'rgba(242, 237, 228, 0.02)')
  sheen.addColorStop(0.56, 'rgba(200, 168, 130, 0.07)')
  sheen.addColorStop(0.82, 'rgba(10, 9, 8, 0.26)')
  sheen.addColorStop(1, 'rgba(10, 9, 8, 0.46)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, LABEL_W, LABEL_H)

  ctx.strokeStyle = 'rgba(200, 168, 130, 0.22)'
  ctx.lineWidth = 2
  ctx.strokeRect(30, 30, LABEL_W - 60, LABEL_H - 60)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  ctx.font = displayFont(46)
  ctx.fillStyle = BONE
  tracked(ctx, 'NOIR', cx, 124, 10)

  ctx.font = sansFont(15)
  ctx.fillStyle = ASH
  tracked(ctx, 'SINGLE ORIGIN', cx, 160, 6)

  // The name sets one word per line and steps down until the widest word fits.
  const words = name.split(' ')
  const maxWidth = LABEL_W - 130
  let size = words.length > 1 ? 96 : 116
  for (;;) {
    ctx.font = displayFont(size)
    const widest = Math.max(...words.map((w) => ctx.measureText(w).width))
    if (widest <= maxWidth || size <= 44) break
    size -= 4
  }
  ctx.textAlign = 'center'
  ctx.fillStyle = BONE
  const lineHeight = size * 0.92
  const top = 372 - ((words.length - 1) * lineHeight) / 2
  words.forEach((word, i) => ctx.fillText(word, cx, top + i * lineHeight))
  ctx.textAlign = 'left'

  ctx.fillStyle = CREMA
  ctx.fillRect(cx - 80, 452, 160, 2)

  const ticks = 5
  const tickW = 4
  const tickH = 30
  const gap = 22
  const span = ticks * tickW + (ticks - 1) * gap
  let x = cx - span / 2
  for (let i = 1; i <= ticks; i += 1) {
    ctx.fillStyle = i <= roast ? CREMA : 'rgba(138, 129, 120, 0.45)'
    ctx.fillRect(x, 540, tickW, tickH)
    x += tickW + gap
  }

  ctx.font = sansFont(14)
  ctx.fillStyle = ASH
  tracked(ctx, `ROAST ${roast} OF ${ticks}`, cx, 614, 6)

  ctx.font = sansFont(13)
  ctx.fillStyle = 'rgba(200, 168, 130, 0.75)'
  tracked(ctx, 'EST. 2019', cx, 692, 7)
}

function foilMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: INK,
    metalness: 0.35,
    roughness: 0.42,
    clearcoat: 0.3,
    clearcoatRoughness: 0.38,
  })
}

/**
 * Builds the bag. The returned group is centred on the origin and carries its
 * label handle on `userData.label`; dispose it with `disposeBag`.
 */
export function createBag(roast: number, name: string): THREE.Group {
  const group = new THREE.Group()

  const canvas = document.createElement('canvas')
  canvas.width = LABEL_W
  canvas.height = LABEL_H
  drawLabel(canvas, roast, name)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  const foil = foilMaterial()

  // The printed face keeps the same physical parameters as the foil, but its
  // base colour is white so the texture reads as authored — multiplying the
  // map by ink would crush the crema and bone print to near black.
  const printed = foilMaterial()
  printed.color = new THREE.Color(0xffffff)
  printed.map = texture

  const bodyGeometry = new THREE.BoxGeometry(BODY.w, BODY.h, BODY.d)
  const faces = [foil, foil, foil, foil, foil, foil]
  faces[FRONT_FACE] = printed
  group.add(new THREE.Mesh(bodyGeometry, faces))

  // Roll-top: a shallower, narrower box seated on the crown and pitched
  // forward a few degrees, the way a folded bag leans over its own seal.
  const crown = new THREE.Mesh(new THREE.BoxGeometry(CROWN.w, CROWN.h, CROWN.d), foil)
  crown.position.y = BODY.h / 2 + CROWN.h / 2 - 0.01
  crown.rotation.x = 0.09
  group.add(crown)

  // Side gussets: thin slabs standing just proud of the body in depth so the
  // silhouette shows a pleat rather than a plain slab.
  const gussetGeometry = new THREE.BoxGeometry(GUSSET.w, GUSSET.h, GUSSET.d)
  for (const side of [-1, 1]) {
    const gusset = new THREE.Mesh(gussetGeometry, foil)
    gusset.position.x = side * (BODY.w / 2 - GUSSET.w / 2 + 0.01)
    group.add(gusset)
  }

  // Re-centre on the origin: the crown pushes the composite bounding box up,
  // so every child is shifted back by the box centre rather than leaving the
  // bag spinning about a point below its middle.
  const centre = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3())
  for (const child of group.children) child.position.sub(centre)

  const label: BagLabel = {
    texture,
    redraw: () => {
      drawLabel(canvas, roast, name)
      texture.needsUpdate = true
    },
  }
  ;(group.userData as BagUserData).label = label

  return group
}

/**
 * Releases every GPU resource the group owns. Geometries and materials are
 * deduplicated first — the foil material and the gusset geometry are shared
 * across meshes — and each material's map is disposed with it.
 */
export function disposeBag(group: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()

  group.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    geometries.add(mesh.geometry)
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of list) materials.add(material)
  })

  for (const geometry of geometries) geometry.dispose()
  for (const material of materials) {
    const withMap = material as THREE.MeshPhysicalMaterial
    withMap.map?.dispose()
    material.dispose()
  }

  delete (group.userData as BagUserData).label
  group.clear()
}
