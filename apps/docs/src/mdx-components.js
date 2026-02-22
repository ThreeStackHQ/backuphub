"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMDXComponents = useMDXComponents;
const utils_1 = require("@/lib/utils");
function useMDXComponents(components) {
    return {
        h1: ({ className, ...props }) => (<h1 className={(0, utils_1.cn)("mt-2 scroll-m-20 text-3xl font-bold tracking-tight", className)} {...props}/>),
        h2: ({ className, ...props }) => (<h2 className={(0, utils_1.cn)("mt-10 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight first:mt-0", className)} {...props}/>),
        h3: ({ className, ...props }) => (<h3 className={(0, utils_1.cn)("mt-8 scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props}/>),
        h4: ({ className, ...props }) => (<h4 className={(0, utils_1.cn)("mt-6 scroll-m-20 text-lg font-semibold tracking-tight", className)} {...props}/>),
        p: ({ className, ...props }) => (<p className={(0, utils_1.cn)("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}/>),
        ul: ({ className, ...props }) => (<ul className={(0, utils_1.cn)("my-6 ml-6 list-disc", className)} {...props}/>),
        ol: ({ className, ...props }) => (<ol className={(0, utils_1.cn)("my-6 ml-6 list-decimal", className)} {...props}/>),
        li: ({ className, ...props }) => (<li className={(0, utils_1.cn)("mt-2", className)} {...props}/>),
        blockquote: ({ className, ...props }) => (<blockquote className={(0, utils_1.cn)("mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground", className)} {...props}/>),
        table: ({ className, ...props }) => (<div className="my-6 w-full overflow-y-auto">
        <table className={(0, utils_1.cn)("w-full", className)} {...props}/>
      </div>),
        tr: ({ className, ...props }) => (<tr className={(0, utils_1.cn)("m-0 border-t border-border p-0", className)} {...props}/>),
        th: ({ className, ...props }) => (<th className={(0, utils_1.cn)("border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props}/>),
        td: ({ className, ...props }) => (<td className={(0, utils_1.cn)("border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props}/>),
        pre: ({ className, ...props }) => (<pre className={(0, utils_1.cn)("mb-4 mt-6 overflow-x-auto rounded-lg bg-card p-4", className)} {...props}/>),
        code: ({ className, ...props }) => (<code className={(0, utils_1.cn)("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", className)} {...props}/>),
        hr: ({ ...props }) => (<hr className="my-4 border-border md:my-8" {...props}/>),
        a: ({ className, ...props }) => (<a className={(0, utils_1.cn)("font-medium text-primary underline underline-offset-4 hover:opacity-80", className)} {...props}/>),
        ...components,
    };
}
//# sourceMappingURL=mdx-components.js.map