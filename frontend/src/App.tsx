import FloatingIcon from './FloatingIcon/FloatingIcon'

function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-white via-zinc-100 to-zinc-950 px-6 py-8 text-zinc-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border-2 border-zinc-950 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[5px_5px_0_rgba(0,0,0,0.95)]">
            Live support workspace
          </p>
          <h1 className="text-6xl font-black tracking-normal text-zinc-950 sm:text-7xl">Spur Chat</h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-zinc-700">
            A clean support experience with a floating assistant ready from the bottom-right corner.
          </p>
          <div className="mt-8 h-2 w-40 rounded-full bg-gradient-to-r from-zinc-950 via-zinc-600 to-white" />
        </div>
      </section>
      <FloatingIcon />
    </main>
  )
}

export default App
