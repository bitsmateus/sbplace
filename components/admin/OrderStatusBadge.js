import { orderStatusLabel, orderStatusTone } from "@/lib/order-constants";

const TONES = {
  wait: "border-line text-mist",
  alert: "border-amber-400/60 bg-amber-400/10 text-amber-300",
  ok: "border-emerald-400/60 bg-emerald-400/10 text-emerald-300",
  info: "border-sky-400/60 bg-sky-400/10 text-sky-300",
  done: "border-gold/60 bg-gold/10 text-gold",
  bad: "border-red-400/60 bg-red-400/10 text-red-300",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        TONES[orderStatusTone(status)] || TONES.wait
      }`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
