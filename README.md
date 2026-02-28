# Web Desktop Environment

Since a few years back, I wanted to recreate the feeling of a real desktop inside a browser. Not just draggable divs—actual windows that behave like you expect: bring to front when clicked, minimize to a taskbar, snap to edges, etc.

Built this with React and TypeScript because I needed the type safety for the window state management. The dragging and resizing comes from react-rnd, which saved me weeks of writing that logic from scratch also zustand, becasuse that's what __we__ the cool guys use nowadays :D.

## What it actually does

You get a working desktop in the browser in which everything works as you expect:

- **Drag windows around** - Click the title bar, move them anywhere
- **Resize from any edge** - Just like real OS windows  
- **Click to focus** - Windows stack properly with z-index
- **Minimize and restore** - They go to the taskbar, not limbo
- **Right-click menus** - Context menus that actually work
- **Desktop icons** - Double-click to open apps

It also remembers your layout and preferences, such as color mode. Close the tab, come back later—your windows are where you left them (stored in localStorage, wihtout cookies or privacy concerns, __everything you do, stays in your machine__).

## The apps it includes

I built four basic apps so far to prove the system works:

- **Notepad** - Plain text editing with auto-save
- **Terminal** - Fake shell that runs... well, fake commands
- **File Explorer** - Browse the virtual file system
- **Calendar** - Just a calendar for now

## Tech choices

I picked these tools because I've never used many of them before and they don't fight each other (AFAIK):

| What | Why |
|------|-----|
| **React 18** | I know it, it works |
| **TypeScript** | Window state is complex—types catch bugs |
| **react-rnd** | 170k downloads/week, handles the hard drag/resize math |
| **Zustand** | State management without the boilerplate |
| **Mantine** | Good-looking components out of the box |
| **Framer Motion** | Animations that don't tank performance |

## Architecture

I went with hexagonal ("ports and adapters") just in case I want to be able to swap implementations later. The core logic lives in Domain/Application layers with zero React dependencies. React only exists in the Presentation layer.

```
Domain (pure logic)
  ↓
Application (ports + use cases)
  ↓
Infrastructure (react-rnd adapter, localStorage)
  ↓
Presentation (React components)
```

This means I could theoretically port this to Vue or even native desktop without touching the business logic. Probably won't, but I *could*.

## Quick start

```bash
git clone https://github.com/yourusername/web-desktop.git
cd web-desktop
bun install
bun run dev
```

Goes live on `http://localhost:5173`.

## How to use it

**Window controls:**
- Drag: Grab the title bar
- Resize: Any edge or corner
- Focus: Just click anywhere on the window
- Minimize: Hit the _ button (goes to taskbar)
- Close: X button or right-click → close

## Current state

I'm honestly not sure if anyone should use this for production. It's more of a proof-of-concept for my personal website. That said, here's where we are:

- [x] Project scaffolding done
- [x] Core domain entities (Window, DesktopIcon, FileSystem)
- [x] Application layer (ports + use cases)
- [x] Infrastructure adapters (WindowManagerAdapter, LocalStorageFileSystem, DefaultThemeProvider)
- [x] Global Zustand store with localStorage persistence
- [x] ESLint + Prettier configured
- [x] unit tests passing (Vitest)
- [ ] UI components
- [ ] Full feature set
- [ ] Built-in apps

## Contributing

If you actually want to work on this:

1. Fork it
2. Make a branch (`git checkout -b fix-whatever`)
3. Commit (`git commit -m "Fix whatever"`)
4. Push and open a PR

No bureaucratic process. Just make sure `bun run lint` and `bun run test:run` pass.

## License

MIT. Do whatever you want with it. I'd appreciate credit but won't sue you if you forget.

## Things I stole ideas from

- [react-rnd](https://github.com/bokuweb/react-rnd) - Literally couldn't have built this without it
- [Alistair Cockburn's Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) - Made me think harder about code organization
- [Mantine](https://mantine.dev/) - Made it look okay without design skills
- [Wallpaper 1](https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?cs=srgb&dl=pexels-jplenio-1103970.jpg&fm=jpg&w=5363&h=3575) 
- [Wallpaper 2](https://www.pexels.com/photo/multicolored-abstract-painting-1509534/) 

---

Built partly out of curiosity, partly to see if I could. React + TypeScript. That's it.
