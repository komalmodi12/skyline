import Link from "next/link";
import NavLink from "./NavLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-navy/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-[5vw]">
        <Link href="/" className="font-serif text-2xl text-gold">
          Skyline
        </Link>
        <nav aria-label="Main" className="flex gap-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/properties">Homes</NavLink>
        </nav>
      </div>
    </header>
  );
}
