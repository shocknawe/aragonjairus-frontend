# aragonjairus-frontend

A React 18 + TypeScript app built with [Vite](https://vite.dev/) and styled with [Tailwind CSS](https://tailwindcss.com/).

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).\
The page reloads automatically (HMR) when you make edits.

### `npm test`

Runs the test suite with [Vitest](https://vitest.dev/) in watch mode.\
Use `npm test -- --run` for a single non-watch run.

### `npm run build`

Type-checks with `tsc` and builds the production bundle to the `dist` folder.

### `npm run preview`

Serves the production build from `dist` locally to preview it before deploying.

## Tailwind CSS

Tailwind is compiled by Vite through PostCSS (see `postcss.config.js` and
`tailwind.config.js`). Styles are authored in `src/tailwind.css` and imported
from `src/index.tsx` — there is no separate build step.

## Learn More

- [Vite documentation](https://vite.dev/guide/)
- [React documentation](https://react.dev/)
