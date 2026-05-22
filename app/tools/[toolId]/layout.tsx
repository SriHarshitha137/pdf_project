import { tools } from "@/lib/data";

export async function generateMetadata({ params }: { params: { toolId: string } }) {
  const tool = tools.find((t) => t.id === params.toolId);
  if (!tool) return { title: "Tool – PDFKit Pro" };
  return {
    title: `${tool.label} – PDFKit Pro`,
    description: tool.desc,
  };
}

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
