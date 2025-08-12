import DashboardLayout from '@/app/dashboard/layout'

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}