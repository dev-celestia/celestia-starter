"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Inter } from "next/font/google";
import { Provider } from "@/components/provider";
import { sidebarComponents } from "@/components/sidebar";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

/**
 * Flatten the `components` folder into a small-caps separator + flat page
 * list, so the sidebar doesn't nest a "Components" page inside a
 * "Components" accordion. The folder's overview page is moved out as a
 * regular item right before the separator.
 */
function flattenComponentsFolder(root: PageTree.Root): PageTree.Root {
  const children: PageTree.Node[] = [];

  for (const node of root.children) {
    if (node.type === "folder" && node.$ref?.folder === "components") {
      const [overview, ...pages] = node.children;

      children.push(
        ...(overview?.type === "page" ? [overview] : []),
        { type: "separator", name: node.name },
        ...pages,
      );
    } else {
      children.push(node);
    }
  }

  return { ...root, children };
}

const sidebarTree = flattenComponentsFolder(source.getPageTree());

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>
          <DocsLayout
            tree={sidebarTree}
            {...baseOptions()}
            sidebar={{
              components: sidebarComponents,
            }}
          >
            {children}
          </DocsLayout>
        </Provider>
      </body>
    </html>
  );
}
