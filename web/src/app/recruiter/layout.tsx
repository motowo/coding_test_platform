import DashboardLayout from '@/app/dashboard/layout'

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}