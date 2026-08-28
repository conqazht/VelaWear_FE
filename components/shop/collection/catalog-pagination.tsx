"use client";

import { Fragment } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  getCatalogCopy,
  type CatalogPaginationProps,
} from "@/components/shop/collection/catalog-types";

export function CatalogPagination({ state, pages, onPage }: CatalogPaginationProps) {
  const { locale } = useI18n();
  const copy = getCatalogCopy(locale);
  if (pages <= 1) return null;

  const candidates = Array.from(
    new Set([1, Math.max(1, state.page - 1), state.page, Math.min(pages, state.page + 1), pages]),
  ).sort((a, b) => a - b);

  return (
    <div className="mt-12">
      <Pagination aria-label={copy.page}>
        <PaginationContent className="gap-1.5">
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (state.page > 1) onPage(state.page - 1);
              }}
              className={cn(
                "cursor-pointer rounded-sm border border-[#1c1a18]/15 px-3 py-1.5 text-xs text-[#1c1a18] transition-colors hover:bg-[#efe7dc]",
                state.page <= 1 && "pointer-events-none opacity-40",
              )}
              text={copy.previous}
            />
          </PaginationItem>

          {candidates.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && candidates[index - 1] !== page - 1 && (
                <PaginationItem>
                  <PaginationEllipsis className="text-[#1c1a18]/40" />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPage(page);
                  }}
                  isActive={page === state.page}
                  className={cn(
                    "size-9 cursor-pointer rounded-sm border text-xs font-medium transition-colors",
                    page === state.page
                      ? "border-[#1c1a18] bg-[#1c1a18] text-white hover:bg-[#1c1a18] hover:text-white"
                      : "border-[#1c1a18]/15 text-[#1c1a18] hover:border-[#1c1a18] hover:bg-[#efe7dc]",
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </Fragment>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (state.page < pages) onPage(state.page + 1);
              }}
              className={cn(
                "cursor-pointer rounded-sm border border-[#1c1a18]/15 px-3 py-1.5 text-xs text-[#1c1a18] transition-colors hover:bg-[#efe7dc]",
                state.page >= pages && "pointer-events-none opacity-40",
              )}
              text={copy.next}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
