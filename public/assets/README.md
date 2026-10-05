# MM Motors assets

Replace these placeholders with production assets:
- `logo.svg` — official MM Motors logo (stylized MM + sports-car silhouette)
- `og.jpg` — 1200x630 social preview
- `hero.webp` — optional compressed hero image/video fallback
- `workshop.webp` — new branch workshop photo
- `gallery-01.webp` ... — actual workshop/customer work

3D model:
- Put the optimized GLB at `public/models/mm-car.glb`.
- The current hero intentionally uses a lightweight procedural placeholder so the site works immediately without a binary asset.
- To swap in GLB, replace `ProceduralCar` in `src/main.jsx` with a `useGLTF('/models/mm-car.glb')` component and keep the lighting/camera setup.


## Service card images
The five service cards now use automotive image URLs directly in `src/main.jsx`. Replace each `image` URL in the `services` array with your own MM Motors photos when ready.
