import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Minimal monochrome article renderer for admin-written theory content. */
export function Markdown({ children }) {
  return (
    <div className="text-[15px] leading-7 text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mt-8 mb-3 text-lg font-semibold tracking-tight" {...p} />,
          h2: (p) => <h2 className="mt-8 mb-3 text-base font-semibold tracking-tight" {...p} />,
          h3: (p) => <h3 className="mt-6 mb-2 text-sm font-semibold tracking-tight" {...p} />,
          p: (p) => <p className="my-4" {...p} />,
          ul: (p) => <ul className="my-4 list-disc space-y-1.5 pl-5" {...p} />,
          ol: (p) => <ol className="my-4 list-decimal space-y-1.5 pl-5" {...p} />,
          a: (p) => (
            <a
              className="underline underline-offset-2 hover:text-muted-foreground"
              target="_blank"
              rel="noreferrer"
              {...p}
            />
          ),
          blockquote: (p) => (
            <blockquote
              className="my-4 border-l-2 border-border pl-4 text-muted-foreground"
              {...p}
            />
          ),
          hr: () => <hr className="my-8 border-border" />,
          table: (p) => (
            <div className="my-5 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...p} />
            </div>
          ),
          th: (p) => (
            <th
              className="border border-border px-3 py-1.5 text-left font-medium text-muted-foreground"
              {...p}
            />
          ),
          td: (p) => <td className="border border-border px-3 py-1.5 align-top" {...p} />,
          code: ({ className, children, ...rest }) => {
            const block = typeof className === "string" && className.includes("language-");
            if (block) {
              return (
                <code className="block font-mono text-[13px] leading-6" {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded border border-border px-1 py-0.5 font-mono text-[13px]"
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre: (p) => (
            <pre
              className="my-5 overflow-x-auto rounded-md border border-border bg-hover p-4"
              {...p}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
