const STYLES = {
  disponivel: "bg-paper text-ink",
  reservada: "bg-accent text-ink",
  vendida: "bg-ink text-mist border border-line",
};

const LABELS = {
  disponivel: "Disponível",
  reservada: "Reservada",
  vendida: "Vendida",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.disponivel;
  const label = LABELS[status] || status;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${style}`}
    >
      {label}
    </span>
  );
}
