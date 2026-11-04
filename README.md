# aviadmerlin.github.io

Source for my portfolio site, live at [aviadmerlin.github.io](https://aviadmerlin.github.io).

Plain HTML/CSS/JS, no build step, no framework. Open any `.html` file directly in a browser to preview it, or just push to `main` and GitHub Pages redeploys automatically.

## Structure

```
index.html                   Home page: hero, selected work, about, education/experience, toolkit, contact
projects/*.html               One case-study page per project
404.html                      Custom not-found page
css/style.css                 Everything: color tokens (light + dark), layout, components
js/main.js                    Theme toggle + mobile nav toggle
assets/images/<project>/      Screenshots and demo clips, per project
assets/favicon/                Favicon set + web manifest
assets/og-image.png            Open Graph / social share card
assets/AviadMerlin-Resume.pdf  CV, linked from the hero
```

Header and footer markup is duplicated at the top/bottom of every page rather than built via includes. That keeps the site a true zero-build static site (works from a plain `file://` URL too) and it's a small enough amount of markup that copy-pasting is simpler than wiring up includes.

## Adding a new project

1. Add a card to the `#work` section in `index.html` (copy an existing `.project-card` block): cover image, one-line problem framing, a few stack tags, a link to the new case-study page.
2. Create `projects/<project-slug>.html` by copying an existing case-study page (e.g. `projects/sparkio.html`) and keep the same section order: Problem → What I built → Result/status → Screenshots → Stack → Links.
3. Drop screenshots in `assets/images/<project-slug>/`. Convert to WebP first (`cwebp -q 82 input.png -o output.webp`) and keep each image under ~100KB where possible. For video clips, prefer a short muted MP4 over a GIF (smaller, and it gets a `poster` image):
   ```
   ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p -vf "scale=900:-2" -an output.mp4
   ```
4. Use real figures only. If a number isn't in the source repo, leave it out rather than estimate it.

## Theme

Colors live as CSS custom properties in `css/style.css` under `[data-theme="dark"]` and `[data-theme="light"]`. The toggle button flips `data-theme` on `<html>` and remembers the choice in `localStorage` (key `am-theme`); a small inline script in each page's `<head>` applies the saved/preferred theme before first paint, so there's no flash of the wrong theme.

## Deployment

GitHub Pages, deploying from `main` at the repo root. Pushing to `main` is the whole deploy process.
