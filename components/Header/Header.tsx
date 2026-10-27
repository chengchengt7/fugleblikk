import Link from "next/link";
import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" aria-label="Fugleblikk home">
        <span aria-hidden="true">FU</span>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <g transform="translate(24 0) scale(-1 1)">
            <path d="M4.5 20.5 8.5 8C10 4.5 12 3 15 3c2.3 0 3.3 1.3 5.2 2.6l-1.5 1.6c-.9.9-.8 2-.1 4 1 3.6-1.3 6-5.3 6.6l-4-.8-2.6 3L4.5 20.5Z" />
          </g>
        </svg>
        <span aria-hidden="true">LEBLIKK</span>
      </Link>
    </header>
  );
}
