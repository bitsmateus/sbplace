// Logo oficial (PNG branco com fundo transparente): usar só sobre fundo escuro.
export default function Logo({ className = "h-14" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="SB Place"
      width={200}
      height={174}
      decoding="async"
      className={`w-auto ${className}`}
    />
  );
}
