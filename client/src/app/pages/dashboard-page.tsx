import { useProfile } from '@/hooks/auth/use-profile';
import { useAuthStore } from '@/store/auth-store';
import { BadgeCheck, RefreshCw, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/dashboard/stat-card';
import { DataRow } from '@/components/dashboard/data-row';

export function DashboardPage() {
  const { isLoading, error } = useProfile();
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm font-medium text-destructive">Failed to load profile.</p>
        <Button variant="outline" className="h-9 rounded-xl" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value="1,284"
          label="Registered accounts"
          icon={<Users className="size-6 text-white" />}
          gradient="from-amber-400 to-orange-500"
        />
        <StatCard
          title="Active User"
          value={user?.name ?? 'You'}
          label={user?.role === 'admin' ? 'Administrator' : 'Member'}
          icon={<UserRound className="size-6 text-white" />}
          gradient="from-sky-400 to-blue-500"
        />
      </div>

      {/* ── Profile section ── */}
      <div className="space-y-1">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <ShieldCheck className="size-3.5" />
          Profile overview
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome, {user?.name ?? 'User'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your account information and current session details.
        </p>
      </div>

      <Separator className="bg-slate-200 dark:bg-slate-800" />

      <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        <DataRow label="Name" value={user?.name ?? 'N/A'} icon={<UserRound className="size-4" />} />
        <DataRow label="Email" value={user?.email ?? 'N/A'} icon={<BadgeCheck className="size-4" />} />
        <DataRow label="User ID" value={user?.id ?? 'N/A'} icon={<ShieldCheck className="size-4" />} mono />
      </div>
    </div>
  );
}

