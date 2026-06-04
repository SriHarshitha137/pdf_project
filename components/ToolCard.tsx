import Link from "next/link";
import { Tool } from "@/lib/data";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.id}`} className="tool-card">
      <div className="tool-card-icon">
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {Array.isArray(tool.icon) ? tool.icon.map((p, i) => <path key={i} d={p} />) : <path d={tool.icon} />}
        </svg>
      </div>
      <h3>{tool.label}</h3>
      <p>{tool.desc}</p>
    </Link>
  );
}
