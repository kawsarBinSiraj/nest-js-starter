import { UserRound } from "lucide-react"

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-20 text-center backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/40">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <UserRound className="size-7 text-slate-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Edit your profile details — coming soon.</p>
      </div>
    </div>
  )
}
