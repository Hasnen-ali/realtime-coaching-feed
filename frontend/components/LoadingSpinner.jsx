export default function LoadingSpinner({ label = 'Loading', className = 'text-slate-600' }) {
  return (
    <div className={`flex items-center gap-3 text-sm font-medium ${className}`}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
