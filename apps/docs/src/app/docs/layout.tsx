import { DocsLayout } from "@/components/DocsLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <DocsLayout>{children}</DocsLayout>;
}
