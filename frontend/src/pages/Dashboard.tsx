"use client"
// dashboard UI only — components replaced with inline UI

export default function DashboardPage() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back — create quizzes quickly using AI</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-md border px-3 py-2">Settings</button>
            <button className="rounded-md bg-primary text-white px-4 py-2">New Quiz</button>
          </div>
        </div>

        {/* Top widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-tr from-primary/20 to-transparent flex items-center justify-center text-2xl">🧠</div>
                <div>
                  <div className="text-lg font-semibold">AI Quiz Generator</div>
                  <div className="text-sm text-muted-foreground">Generate quizzes from text, PDF, audio, video or YouTube</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="px-3 py-2 rounded-md bg-primary text-white">Create from Text</button>
                <button className="px-3 py-2 rounded-md border">Create from PDF</button>
                <button className="px-3 py-2 rounded-md border">Create from YouTube</button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                  <div className="text-2xl font-bold mt-1">42</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Usage</div>
                  <div className="text-sm">12 generated quizzes this month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="text-sm text-muted-foreground">Recent activity</div>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-between">
                <div className="text-sm">Generated quiz from article</div>
                <div className="text-xs text-muted-foreground">2h ago</div>
              </li>
              <li className="flex items-center justify-between">
                <div className="text-sm">Saved quiz: React Basics</div>
                <div className="text-xs text-muted-foreground">1d ago</div>
              </li>
              <li className="flex items-center justify-between">
                <div className="text-sm">Edited quiz: World History</div>
                <div className="text-xs text-muted-foreground">3d ago</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <FeatureCard title="Generate from Text" subtitle="Paste or type text" emoji="📄" />
          <FeatureCard title="Generate from PDF" subtitle="Upload a PDF" emoji="📑" />
          <FeatureCard title="Generate from Audio" subtitle="Upload audio file" emoji="🎧" />
          <FeatureCard title="Generate from Video" subtitle="Upload a video" emoji="🎬" />
          <FeatureCard title="Generate from YouTube" subtitle="Provide a URL" emoji="▶️" />
        </div>

        {/* Bottom area: informational cards */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-2">My Quizzes</h4>
            <p className="text-sm text-muted-foreground">Quick access to quizzes you've created or saved.</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-2">Team Activity</h4>
            <p className="text-sm text-muted-foreground">See how your team uses credits and generated quizzes.</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-2">Billing</h4>
            <p className="text-sm text-muted-foreground">Manage credits and subscription.</p>
            <div className="mt-4">
              <button className="px-4 py-2 rounded-md bg-primary text-white">Top up credits</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <div className={`bg-card rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="text-3xl">{emoji}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="px-3 py-2 rounded-md border">Open</button>
        <div className="text-xs text-muted-foreground">Free • 1 credit</div>
      </div>
    </div>
  )
}
