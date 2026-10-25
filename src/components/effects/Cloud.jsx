/*
 * Awan datar bergaya kartun (tanpa garis tepi) untuk animasi awan bergeser.
 */
export default function Cloud({ className = '', style }) {
  return (
    <svg className={`cloud ${className}`} style={style} viewBox="0 0 220 90" aria-hidden="true">
      <g fill="#fffbea">
        <circle cx="60" cy="55" r="28" />
        <circle cx="100" cy="40" r="36" />
        <circle cx="146" cy="52" r="30" />
        <circle cx="182" cy="62" r="20" />
        <rect x="40" y="55" width="150" height="27" rx="13" />
      </g>
      <rect x="44" y="70" width="142" height="12" rx="6" fill="#f1dfa6" opacity="0.55" />
    </svg>
  );
}
