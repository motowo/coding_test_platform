import DashboardLayout from '@/app/dashboard/layout'

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}