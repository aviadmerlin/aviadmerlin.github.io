# Portfolio Website Brief: Aviad Merlin

Read this whole file before doing anything. Start in plan mode: propose the structure, the design direction and the content for each project, and wait for my approval before writing code.

## Goal

A personal portfolio site that helps me get a student position in hi-tech. Target roles: Data Analyst, Data Operations, PMO. Audience: recruiters and hiring managers who will spend about 60 seconds on the site, mostly after seeing my CV.

## Positioning

I'm a 3rd-year Industrial Engineering & Management student at Ruppin Academic Center. Most of my projects are systems I built, but I'm not applying as a developer. The story is: I understand how operations actually work, and I build the tools that make them organized and measurable. That bridges data and PMO.

Hero headline direction (propose 3 options in this spirit, plain and human, no buzzwords):
- "I turn messy operations into systems and data people can act on."

Every project must be told through a process and data lens, not a code lens. What was the messy process, what did I model, what does the system make visible or measurable.

## Language and hosting

- English only.
- GitHub Pages, repo `aviadmerlin.github.io` (account: aviadmerlin), so the site lives at the root URL.
- Prefer plain HTML/CSS/JS with no build step, so I can maintain it easily. If you think a static generator is clearly better, explain why in the plan first.

## Inspiration (take the idea, don't copy)

1. https://www.rondahan.com/ : clean dark layout, one-line identity, "open to student roles" line, project cards with cover art, compact About / Education / Experience / Toolkit, CV link.
2. https://nivaltmark.github.io : each project told as Problem, Built, Result; real screenshots of the running system with short captions explaining decisions; honest about what didn't ship.

## Structure

1. Hero: name, headline, one line "Open to Data Analyst, Data Operations and PMO student roles", buttons: See the work, CV, LinkedIn.
2. Selected work: project cards that open a case-study page per project.
3. About: short, first person, human. The angle: I come from running real operations (an event services business), so I build for problems I lived.
4. Education + Experience (short).
5. Toolkit: SQL, Python, Excel / Google Sheets, Git & GitHub, Figma, Claude Code. Only list what's true; ask me if unsure.
6. Contact: email, LinkedIn, GitHub.

Design: modern, minimal, dark and light mode, fully responsive, fast, accessible. Must look great on mobile. Add favicon, Open Graph image and meta tags.

## Projects

Pull content (README, docs, screenshots, demo video, tech stack) from my GitHub repos. If a repo is private, use `gh` with my auth. Look at all my repos and tell me if any other project is worth featuring, but don't add it without asking.

Case-study format for each project: Problem → What I built → Result / status → screenshots with captions → stack → links (live / repo / demo).

### 1. Sparkio: CRM for event vendors (lead project)
- Problem, in my words: I was an event vendor myself and saw from the inside that vendors work in a very messy way: Excel, WhatsApp, notes and calendars, all in different places with no integration between them.
- Use the screenshots, demo video and explanations from the Sparkio repo.
- Frame it as: I mapped how a vendor's business actually runs (leads, quotes, events, clients) and built one system that brings it together.

### 2. Sliding Doors: Microsoft x Premier League "Inside the Game" hackathon
- Solo entry, October 2026. Counterfactual "what if" match simulation with win probability and AI agents on Microsoft Foundry.
- Take details from the repo. Frame it around the modeling and the data, and around learning a new stack under a deadline.

## Hard rules

- Never invent numbers, users, results or outcomes. Use only figures found in the repos. If a case study needs a number you don't have, leave a clearly marked TODO and ask me.
- Don't write marketing fluff. No em dashes, no "passionate", "leveraging", "cutting-edge", "seamless". Write like a person talking.
- Ask before publishing my phone number.
- Ask me for my CV PDF and profile photo; put them in `/assets`. The CV file name must be `AviadMerlin-Resume.pdf`.
- Demo videos: GitHub blocks files over 100 MB, so compress (H.264 MP4, under ~15 MB) or embed from YouTube. Use a poster image and don't autoplay with sound.
- Optimize images (WebP, sensible sizes, lazy loading).

## Contact details

- Email: aviadmerlin@gmail.com
- LinkedIn: linkedin.com/in/aviad-merlin-b85b3b39b
- GitHub: github.com/aviadmerlin

## Done means

Site deployed on GitHub Pages, all links working, checked on mobile and desktop, Lighthouse scores above 90, and a short README explaining how to add a new project.
