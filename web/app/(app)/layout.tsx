import { AppLayout } from '@/components/layout'

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
