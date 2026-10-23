"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "motion/react";

const HERO_IMAGES = [
  "/images/agora-headphones.jpg",
  "/images/agora-laptop.jpg",
  "/images/agora-mechanical-keyboard.jpg",
  "/images/agora-mirrorless-camera.jpg",
  "/images/agora-perfume.jpg",
  "/images/agora-smartphone.jpg",
  "/images/agora-smartwatch.jpg",
  "/images/agora-sneaker.jpg",
  "/images/agora-sneaker-new.jpg",
];

export function StorefrontHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-zinc-950 text-white sm:rounded-[2rem] lg:rounded-[2.5rem]">
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/[0.05] blur-3xl" />

      <div className="relative grid lg:min-h-[530px] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left: content */}
        <div className="relative z-10 flex min-w-0 flex-col justify-center px-6 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12 lg:px-12 lg:py-14 xl:px-16">
          <motion.div
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300 sm:text-[11px]">
                Your everyday marketplace
              </span>
            </div>

            {/* Heading */}
            <h1 className="mt-7 max-w-xl text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-[3.25rem] xl:text-[4rem]">
              Discover more.

              <span className="mt-1 block text-zinc-400">
                Shop better.
              </span>

              <span className="mt-1 block">
                Live Agora.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
              Explore electronics, fashion, lifestyle essentials,
              and more — all in one thoughtfully designed
              marketplace.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                Shop collection

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="#discover"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore categories

                <ArrowDown
                  size={16}
                  className="transition-transform group-hover:translate-y-0.5"
                />
              </a>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.2,
              duration: 0.5,
            }}
            className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:gap-5"
          >
            <TrustItem
              icon={<ShieldCheck size={17} />}
              label="Secure"
              detail="Checkout"
            />

            <TrustItem
              icon={<Truck size={17} />}
              label="Order"
              detail="Tracking"
            />

            <TrustItem
              icon={<PackageCheck size={17} />}
              label="Easy"
              detail="Shopping"
            />
          </motion.div>
        </div>

        {/* Right: animated product showcase */}
        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: 24 }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: reduceMotion ? 0 : 0.15,
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative flex min-w-0 flex-col justify-center overflow-hidden pb-6 lg:py-10"
        >
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-24 bg-gradient-to-r from-zinc-950 to-transparent lg:block" />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-zinc-950 to-transparent sm:w-24" />

          <div className="flex flex-col gap-3 sm:gap-4">
            <SlidingRow
              images={HERO_IMAGES.slice(0, 5)}
              direction="left"
              duration={30}
              priority
              reduceMotion={Boolean(reduceMotion)}
            />

            <SlidingRow
              images={[
                ...HERO_IMAGES.slice(5),
                HERO_IMAGES[0],
              ]}
              direction="right"
              duration={34}
              reduceMotion={Boolean(reduceMotion)}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SlidingRow({
  images,
  direction,
  duration,
  priority = false,
  reduceMotion = false,
}: {
  images: string[];
  direction: "left" | "right";
  duration: number;
  priority?: boolean;
  reduceMotion?: boolean;
}) {
  const repeatedImages = [...images, ...images];

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex w-max gap-3 sm:gap-4"
        animate={
          reduceMotion
            ? { x: "0%" }
            : {
                x:
                  direction === "left"
                    ? ["0%", "-50%"]
                    : ["-50%", "0%"],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                x: {
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                },
              }
        }
      >
        {repeatedImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative h-36 w-52 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 sm:h-44 sm:w-64 lg:h-52 lg:w-72"
          >
            <Image
              src={src}
              alt=""
              fill
              priority={priority && index < 3}
              sizes="(max-width: 640px) 208px, (max-width: 1024px) 256px, 288px"
              className="object-cover transition-transform duration-700 hover:scale-[1.04]"
            />

            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function TrustItem({
  icon,
  label,
  detail,
}: {
  icon: ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 text-zinc-400">
        {icon}
      </div>

      <p className="truncate text-xs font-semibold text-white sm:text-sm">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[10px] text-zinc-500 sm:text-xs">
        {detail}
      </p>
    </div>
  );
}
