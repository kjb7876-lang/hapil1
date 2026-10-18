The RC227 change is limited to one reviewed paving cell in DIST01. It does
not interpret the entire cave illustration as floor. The exact source image
is `assets/maps/rc53/dist01-spider-cave.webp`, SHA256
`921ac7d2a2893aa53374a459b27d9ae87e4cc5c50cbdf0281259875820e72526`.

The original painting, the RC138 map rectangle and projection
`X=640+27(x-y), Y=13.5(x+y)` put the cell's corners at:

| World foot surface corner | Native projected point |
| --- | --- |
| (5.4, 20.2) | (240.4, 345.6) |
| (9.0, 20.2) | (337.6, 394.2) |
| (9.0, 25.0) | (208.0, 459.0) |
| (5.4, 25.0) | (110.8, 410.4) |

These corners bound continuous paving below the painted northwest rock wall.
The implementation intersects that cell with the existing 64-edge native
ellipse and insets every edge by the requested actor radius. At player radius
0.8, centers are restricted to x=6.2..8.2 and y=21.0..24.2. The old mirrored
rectangle had required x>=7.6, cutting through this paving. The union adds
4.48 square world units to the existing floor and retains the broad old left
area. The unreviewed rock point (4.5,23), x<6.2 foot positions, upper cave
decoration and outside-map samples remain blocked. There is no collision
mask for those painted rocks being removed: the old stop was the mirrored
Persona square in `RC134.polygon`, delegated by ordinary RC138 terrain.

The map asset path must still match both the authored map row and current
native map. A different map or active Persona disables the cell. All other
54 combat maps retain the original geometry. Boss right-side placement stays
at its existing 14..16 across band. The cell lies inside the old floor's
projected bounding rectangle, so the camera fitting budget is unchanged.

Native terrain, legal point projection, actor guards, final RC137 ray
constraint and blink use the same floor union. RC223's original side predicate
continues to use the unchanged Persona polygon: the added cell therefore
retains the existing 0.9 movement/attack multipliers and timed HP cost. Guest
input cannot acquire the host-owned extension through fallback side checks.

The CPU replay starts at (7.8,22) with the same northwest directional input.
With the new cell absent it stops at approximately (7.6,21.9333); with the
cell loaded it reaches (6.2,21.4667). The test records nativeAll, allowed,
canMove, final walkable and applied coordinates, verifies the complete radius
at the cell vertices, checks outside points, guest authority, Persona,
54 other maps, checkpoint re-enrollment and PC/landscape camera formulas.
Incoming HP commit and body envelopes remain fixtures. This is not a fresh
browser, trusted touch, hardware GPU or natural campaign verification.

The published-main preservation baseline b0b919d4 passes the unchanged 152nd
extension guard. The RC225/226 candidate fails because its exact runtime
bytes and added assets are missing from that chain. RC227 appends a new
immutable extension from that exact baseline, with per-file preimages,
SHA256 outputs, Git blob IDs, modes, reasons and a complete runtime inventory
fingerprint. Historical pins and negative inventory/byte/mode/symlink checks
remain in force. Local publication manifest validation is separate from any
public request or deployment.

Chromium's sandbox helper initialization remains blocked in this environment.
No sandbox or security setting is changed. The earlier RC225 browser captures
remain evidence for their original SHA only; RC227 images are explicitly CPU
source diagnostics.
