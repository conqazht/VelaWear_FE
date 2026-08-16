"use client";

import { useState } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type ReviewCommentProps = {
  comment?: string | null;
  clamp?: boolean;
  className?: string;
};

export function ReviewComment({
  comment,
  clamp = false,
  className,
}: ReviewCommentProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const content = comment?.trim();

  if (!content) {
    return (
      <p className={cn("italic text-[#1c1a18]/45", className)}>
        {t("reviews.noComment")}
      </p>
    );
  }

  const mayOverflow = clamp && content.length > 140;

  return (
    <div className={className}>
      <p
        className={cn(
          "whitespace-pre-wrap text-[15px] leading-6 text-[#1c1a18]/75",
          mayOverflow && !expanded && "line-clamp-3",
        )}
      >
        {content}
      </p>
      {mayOverflow ? (
        <button
          type="button"
          className="mt-2 text-xs font-semibold underline underline-offset-4 hover:text-[#b5573a]"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? t("reviews.less") : t("reviews.more")}
        </button>
      ) : null}
    </div>
  );
}
