import { Wifi, WifiOff } from 'lucide-react';

export default function ReconnectBanner({ status }) {
  const isConnected = status === 'connected';
  const label = isConnected ? 'Live connection restored' : 'Reconnecting to live feed';

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
        isConnected
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
      role="status"
    >
      {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span>{label}</span>
    </div>
  );
}
