export default function DemoBadge(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      Demo Mode
    </span>
  );
}
