import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1
        className={cn(
          "mt-2 scroll-m-20 text-3xl font-bold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2
        className={cn(
          "mt-10 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight first:mt-0",
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3
        className={cn(
          "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4
        className={cn(
          "mt-6 scroll-m-20 text-lg font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    p: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p
        className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
    ),
    ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
    ),
    li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <li className={cn("mt-2", className)} {...props} />
    ),
    blockquote: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLElement>) => (
      <blockquote
        className={cn(
          "mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground",
          className
        )}
        {...props}
      />
    ),
    table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className={cn("w-full", className)} {...props} />
      </div>
    ),
    tr: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableRowElement>) => (
      <tr
        className={cn("m-0 border-t border-border p-0", className)}
        {...props}
      />
    ),
    th: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th
        className={cn(
          "border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
          className
        )}
        {...props}
      />
    ),
    td: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td
        className={cn(
          "border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre
        className={cn(
          "mb-4 mt-6 overflow-x-auto rounded-lg bg-card p-4",
          className
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
          className
        )}
        {...props}
      />
    ),
    hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className="my-4 border-border md:my-8" {...props} />
    ),
    a: ({
      className,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        className={cn(
          "font-medium text-primary underline underline-offset-4 hover:opacity-80",
          className
        )}
        {...props}
      />
    ),
    ...components,
  };
}
