export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="h-20 rounded bg-gray-200" />
        <div className="h-20 rounded bg-gray-200" />
      </div>
    </div>
  );
}
