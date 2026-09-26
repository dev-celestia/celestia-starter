import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Server-safe markdown rendering for public post pages. react-markdown does
 * not render raw HTML unless explicitly enabled — stored content cannot inject
 * script tags (PRD section 5, stored-XSS requirement).
 */
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mt-8 text-3xl font-bold tracking-tight" {...props} />,
          h2: (props) => <h2 className="mt-8 text-2xl font-bold tracking-tight" {...props} />,
          h3: (props) => <h3 className="mt-6 text-xl font-semibold" {...props} />,
          h4: (props) => <h4 className="mt-6 text-lg font-semibold" {...props} />,
          p: (props) => <p className="leading-7" {...props} />,
          a: (props) => (
            <a className="font-medium text-primary underline underline-offset-4" {...props} />
          ),
          ul: (props) => <ul className="list-disc space-y-1 ps-6" {...props} />,
          ol: (props) => <ol className="list-decimal space-y-1 ps-6" {...props} />,
          li: (props) => <li className="leading-7" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-s-2 border-primary/40 ps-4 italic text-muted-foreground"
              {...props}
            />
          ),
          hr: () => <hr className="border-border" />,
          img: ({ alt, ...props }) => (
            <img className="rounded-xl border" loading="lazy" alt={alt ?? ""} {...props} />
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <code className={`${className ?? ""} block overflow-x-auto`} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: (props) => (
            <pre
              className="overflow-x-auto rounded-xl border bg-muted/50 p-4 font-mono text-[13px] leading-6"
              {...props}
            />
          ),
          table: (props) => (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th className="border-b bg-muted/50 px-3 py-2 text-start font-medium" {...props} />
          ),
          td: (props) => <td className="border-b px-3 py-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
