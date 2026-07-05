"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <footer className="mt-auto bg-[#121110] text-[#f7f4ef] border-t border-white/5 pt-28 pb-16 transition-all duration-300 relative overflow-hidden">
      {/* Huge low-opacity typography watermark behind the footer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute left-10 bottom-0 text-[18vw] font-bold text-white/[0.012] tracking-widest uppercase select-none pointer-events-none font-serif leading-none"
      >
        VELA
      </motion.div>

      <motion.div
        className="max-w-[1280px] mx-auto px-6 md:px-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-12 pb-20 border-b border-white/5">
          {/* Column 1: Elegant Branding, slogan, and description */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-5 flex flex-col items-start pr-0 md:pr-12"
          >
            <h2 className="font-serif text-5xl md:text-7xl font-bold text-white tracking-tight uppercase leading-none mb-4">
              Vela.
            </h2>
            <p className="font-serif italic text-[#b5573a] text-lg md:text-xl tracking-wide mb-6">
              The Art of Slow Living
            </p>
            <p className="text-[#a89e93] text-sm leading-relaxed max-w-sm font-light">
              Một studio thiết kế và may tailor thời trang tối giản độc lập. Chúng tôi chọn lọc chất liệu tự nhiên, chế tác tỉ mỉ và đồng hành cùng phong cách sống tĩnh lặng bền vững.
            </p>
          </motion.div>

          {/* Spacer column */}
          <div className="hidden md:block md:col-span-1" />

          {/* Column 2: Collection */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[2px] text-white">
                Collection
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light"
                >
                  Autumn Collection
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light"
                >
                  Minimalist Tailoring
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-1.5 text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light"
                >
                  Slow Weaving Study
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3: Studio */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[2px] text-white">
                Studio
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/help" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light">
                  About Our Vision
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light">
                  Sustainable Ethics
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light">
                  Craft Journal
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: Contact */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5573a]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[2px] text-white">
                Contact
              </h4>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="mailto:hello@velawear.vn" className="text-sm text-[#a89e93] hover:text-[#ffb59f] transition-colors font-light break-all">
                  hello@velawear.vn
                </a>
              </li>
              <li className="text-sm text-[#a89e93] font-light">
                +84 (0) 902 345 678
              </li>
              <li className="text-sm text-[#a89e93] font-light">
                Hanoi Studio, Vietnam
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Footer bottom bar */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#a89e93]/50 font-light"
        >
          <p>© 2026 VELA WEAR. ALL RIGHTS RESERVED.</p>
          
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <a href="#" className="hover:text-white transition-colors">Pinterest</a>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
