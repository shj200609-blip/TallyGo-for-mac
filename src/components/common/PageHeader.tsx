export default function PageHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex gap-2">{actions}</div>
    </div>
  )
}
