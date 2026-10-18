"use client";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";
import { LuBookOpen } from "react-icons/lu";

const SOCIALS = [
  { label: "Facebook", href: "#", icon: FaFacebookF },
  { label: "Instagram", href: "#", icon: FaInstagram },
  { label: "YouTube", href: "#", icon: FaYoutube },
  { label: "LinkedIn", href: "#", icon: FaLinkedinIn },
];

const EXPLORE = [
  { href: "/books", label: "Books" },
  { href: "/receipts", label: "Receipts" },
];

const Footer = () => {
  return (
    <footer className="border-t border-accent/70 bg-linear-to-b from-background to-accent">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Link href="/books" className="inline-flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-background">
              <LuBookOpen className="size-5" />
            </span>
            <span className="text-2xl font-bold text-primary">Borrowly</span>
          </Link>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
            Browse, reserve and borrow books all in one cozy place.
          </p>
          <ul className="mt-6 flex gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border-2 border-accent-deep text-primary transition hover:bg-primary hover:text-background"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <nav aria-label="Footer">
          <h3 className="text-lg font-bold text-secondary">Explore</h3>
          <ul className="mt-4 space-y-2.5">
            {EXPLORE.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-muted transition hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Info */}
        <div>
          <h3 className="text-lg font-bold text-secondary">Visit us</h3>
          <ul className="mt-4 space-y-2.5 text-muted">
            <li>Mon – Sat, 9:00 – 18:00</li>
            <li>hello@borrowly.app</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-accent-deep/40 py-5 text-center text-sm text-muted">
        © 2026 Borrowly. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
