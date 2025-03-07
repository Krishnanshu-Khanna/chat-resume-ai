"use client";

import { useState } from "react";
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CreditCard, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/resumes", label: "Resume Builder" },
    { href: "/chat", label: "Document Chat" },
    { href: "/interview", label: "Mock Interview" },
  ];

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logo}
            alt="CVHelper Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-tight dark:text-white">
            CV Helper
          </span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-purple-700 dark:text-purple-400 after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:bg-purple-600 dark:after:bg-purple-500"
                  : "text-gray-700 hover:scale-105 hover:text-purple-400 dark:text-gray-300 dark:hover:text-purple-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Controls (Always Visible) */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <UserButton
            appearance={{
              baseTheme: theme === "dark" ? dark : undefined,
              elements: {
                avatarBox: { width: 35, height: 35 },
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Billing"
                labelIcon={<CreditCard className="size-4" />}
                href="/billing"
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <nav className="flex flex-col items-center gap-3 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-gray-700 dark:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="h-0.1 w-[90%] mx-4 bg-primary" />
          <div className="mt-4 flex items-center gap-4">
            <ThemeToggle />
            <UserButton
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: {
                  avatarBox: { width: 35, height: 35 },
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Billing"
                  labelIcon={<CreditCard className="size-4" />}
                  href="/billing"
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </nav>
      )}
    </header>
  );
}
