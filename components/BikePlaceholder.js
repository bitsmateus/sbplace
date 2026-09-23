// Ilustração de bicicleta em linha, usada onde ainda não há foto.
// A cor vem de `currentColor`, então basta definir `text-*` no className.
export default function BikePlaceholder({ className = "" }) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Bicicleta (foto em breve)"
      className={className}
    >
      <circle cx="70" cy="115" r="42" />
      <circle cx="250" cy="115" r="42" />
      <path d="M70 115 L130 55 L215 55 L250 115" />
      <path d="M130 55 L160 115 L70 115" />
      <path d="M160 115 L215 55" />
      <path d="M125 42 H150" />
      <path d="M215 55 L205 32 H228" />
      <circle cx="160" cy="115" r="7" />
    </svg>
  );
}
