"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

import {
  Baby,
  BookOpen,
  Boxes,
  ChevronDown,
  Cpu,
  Dumbbell,
  Gem,
  HeartPulse,
  House,
  LayoutGrid,
  Menu,
  Monitor,
  Search,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Utensils,
  Watch,
  X,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/types/product";

interface CategoryNavigationProps {
  categories: Category[];
}

const RAIL_WIDTH = 54;
const MIN_SCROLL_Y = 300;
const SCROLL_THRESHOLD = 20;

function getCategoryIcon(name: string): LucideIcon {
  const category = name.toLowerCase();

  if (
    category.includes("electronic") ||
    category.includes("computer") ||
    category.includes("laptop") ||
    category.includes("tech")
  ) {
    return Monitor;
  }

  if (
    category.includes("phone") ||
    category.includes("mobile")
  ) {
    return Smartphone;
  }

  if (
    category.includes("fashion") ||
    category.includes("clothing") ||
    category.includes("apparel")
  ) {
    return Shirt;
  }

  if (
    category.includes("beauty") ||
    category.includes("cosmetic") ||
    category.includes("skincare")
  ) {
    return Sparkles;
  }

  if (
    category.includes("home") ||
    category.includes("living") ||
    category.includes("furniture")
  ) {
    return House;
  }

  if (
    category.includes("sport") ||
    category.includes("fitness") ||
    category.includes("outdoor")
  ) {
    return Dumbbell;
  }

  if (
    category.includes("food") ||
    category.includes("grocery") ||
    category.includes("kitchen")
  ) {
    return Utensils;
  }

  if (
    category.includes("baby") ||
    category.includes("kids") ||
    category.includes("children")
  ) {
    return Baby;
  }

  if (
    category.includes("book") ||
    category.includes("education")
  ) {
    return BookOpen;
  }

  if (
    category.includes("game") ||
    category.includes("gaming")
  ) {
    return Cpu;
  }

  if (
    category.includes("jewelry") ||
    category.includes("accessories")
  ) {
    return Gem;
  }

  if (
    category.includes("watch") ||
    category.includes("watches")
  ) {
    return Watch;
  }

  if (
    category.includes("health") ||
    category.includes("wellness")
  ) {
    return HeartPulse;
  }

  if (
    category.includes("hardware") ||
    category.includes("component")
  ) {
    return Cpu;
  }

  if (
    category.includes("shopping") ||
    category.includes("general")
  ) {
    return ShoppingBag;
  }

  return Boxes;
}

export function CategoryNavigation({
  categories,
}: CategoryNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoryId = searchParams.get("categoryId");
  const activeSearch = searchParams.get("search") ?? "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState(activeSearch);
  const [mounted, setMounted] = useState(false);

  const [showFloatingRail, setShowFloatingRail] =
    useState(false);

  const [railLeft, setRailLeft] = useState<number | null>(
    null
  );

  const menuRef = useRef<HTMLDivElement>(null);
  const previousScrollY = useRef(0);
  const scrollDirection = useRef<"up" | "down">("up");
  const scrollDistance = useRef(0);

  const railVisible =
    pathname === "/" &&
    showFloatingRail &&
    railLeft !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setQuery(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  function navigate(
    updates: Record<string, string | null>
  ) {
    const params = new URLSearchParams(
      pathname === "/" ? searchParams.toString() : ""
    );

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");

    const queryString = params.toString();

    router.push(
      `${queryString ? `/?${queryString}` : "/"}#products`,
      { scroll: true }
    );
  }

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    navigate({
      search: query.trim() || null,
    });

    setMenuOpen(false);
  }

  function handleCategorySelect(
    categoryId: number | null
  ) {
    navigate({
      categoryId:
        categoryId === null
          ? null
          : String(categoryId),
    });

    setMenuOpen(false);
  }


  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    function updateRailPosition() {
      const products =
        document.getElementById("products");

      if (!products) {
        setRailLeft(null);
        return;
      }

      const rect = products.getBoundingClientRect();
      const availableSpace = rect.left;

      if (availableSpace < RAIL_WIDTH + 24) {
        setRailLeft(null);
        return;
      }

      setRailLeft(
        Math.round(
          (availableSpace - RAIL_WIDTH) / 2
        )
      );
    }

    updateRailPosition();

    window.addEventListener(
      "resize",
      updateRailPosition
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateRailPosition
      );
    };
  }, [pathname]);


  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    previousScrollY.current = window.scrollY;
    scrollDirection.current = "up";
    scrollDistance.current = 0;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      const difference =
        currentScrollY - previousScrollY.current;

      previousScrollY.current = currentScrollY;

      if (currentScrollY < MIN_SCROLL_Y) {
        setShowFloatingRail(false);
        scrollDirection.current = "up";
        scrollDistance.current = 0;
        return;
      }

      if (Math.abs(difference) < 1) {
        return;
      }

      const direction =
        difference > 0 ? "down" : "up";

      if (direction !== scrollDirection.current) {
        scrollDirection.current = direction;
        scrollDistance.current = 0;
      }

      scrollDistance.current += Math.abs(difference);

      if (
        scrollDistance.current <
        SCROLL_THRESHOLD
      ) {
        return;
      }

      setShowFloatingRail(
        direction === "down"
      );

      scrollDistance.current = 0;
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [pathname]);

  return (
    <>
      {/* Integrated header search */}
      <form
        onSubmit={handleSearch}
        role="search"
        className="flex h-11 w-full min-w-0 items-center overflow-visible rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200 sm:h-12"
      >
        {/* Categories selector */}
        <div
          ref={menuRef}
          className="relative flex h-full shrink-0 items-center"
        >
          <button
            type="button"
            aria-label="Browse categories"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="agora-category-menu"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            className="flex h-full items-center gap-1.5 rounded-l-full px-3 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-200/60 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <Menu size={17} />

            <span className="hidden sm:inline">
              Categories
            </span>

            <ChevronDown
              size={13}
              className={`hidden text-zinc-500 transition-transform sm:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Category dropdown */}
          {menuOpen && (
            <nav
              id="agora-category-menu"
              aria-label="Shop by category"
              className="absolute left-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            >
              <div className="border-b border-zinc-100 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                  Explore Agora
                </p>

                <h2 className="mt-1 text-base font-semibold text-zinc-950">
                  Shop by category
                </h2>
              </div>

              <div className="max-h-[min(65vh,500px)] overflow-y-auto py-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCategorySelect(null)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    !activeCategoryId
                      ? "bg-zinc-950 font-semibold text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <LayoutGrid size={17} />
                  All products
                </button>

                {categories.map((category) => {
                  const active =
                    activeCategoryId ===
                    String(category.id);

                  const Icon = getCategoryIcon(
                    category.name
                  );

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        handleCategorySelect(
                          category.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                        active
                          ? "bg-zinc-950 font-semibold text-white"
                          : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <Icon size={17} />

                      <span>
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          )}
        </div>

        {/* Divider */}
        <span className="h-5 w-px shrink-0 bg-zinc-300" />

        {/* Search input */}
        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search products..."
          aria-label="Search products"
          className="agora-header-search-input h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 text-sm text-zinc-900 shadow-none outline-none ring-0 placeholder:text-zinc-400 focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 sm:px-4 [&::-webkit-search-cancel-button]:hidden"
        />

        {/* Clear search */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search input"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-950"
          >
            <X size={16} />
          </button>
        )}

        {/* Search submit */}
        <button
          type="submit"
          aria-label="Search products"
          title="Search products"
          className="mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition hover:bg-zinc-800 sm:h-9 sm:w-9"
        >
          <Search size={17} />
        </button>
      </form>

      {/* Floating category rail */}
      {mounted &&
        createPortal(
          pathname === "/" &&
            railLeft !== null ? (
            <nav
              aria-label="Floating product categories"
              aria-hidden={!railVisible}
              className={`fixed top-1/2 z-50 flex max-h-[70vh] -translate-y-1/2 flex-col gap-1 overflow-y-auto rounded-2xl border border-zinc-200 bg-white/95 p-1.5 shadow-[0_15px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-[opacity,transform] duration-300 ${
                railVisible
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-5 opacity-0"
              }`}
              style={{
                left: railLeft,
              }}
            >
              <FloatingCategoryLink
                href="/#products"
                label="All products"
                active={!activeCategoryId}
                tabIndex={
                  railVisible ? 0 : -1
                }
                Icon={LayoutGrid}
              />

              {categories.map((category) => (
                <FloatingCategoryLink
                  key={category.id}
                  href={`/?categoryId=${category.id}#products`}
                  label={category.name}
                  active={
                    activeCategoryId ===
                    String(category.id)
                  }
                  tabIndex={
                    railVisible ? 0 : -1
                  }
                  Icon={getCategoryIcon(
                    category.name
                  )}
                />
              ))}
            </nav>
          ) : null,
          document.body
        )}
    </>
  );
}

function FloatingCategoryLink({
  href,
  label,
  active,
  tabIndex,
  Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  tabIndex: number;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={
        active ? "page" : undefined
      }
      tabIndex={tabIndex}
      className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
        active
          ? "bg-zinc-950 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={1.8}
      />

      <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-950 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block group-focus-visible:block">
        {label}
      </span>
    </Link>
  );
}
