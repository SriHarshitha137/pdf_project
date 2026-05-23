import Link from "next/link";
import Icon from "./Icon";
import { icons, Tool } from "@/lib/data";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.id}`} className="tool-card">
      <div className="tool-card-num">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div
        className="tool-icon"
        style={{ background: tool.color + "15", border: `1px solid ${tool.color}25` }}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke={tool.color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {Array.isArray(tool.icon)
            ? tool.icon.map((p, i) => <path key={i} d={p} />)
            : <path d={tool.icon} />}
        </svg>
      </div>
      <h3>{tool.label}</h3>
      <p>{tool.desc}</p>
      <div className="tool-arrow">
        <Icon d={icons.chevronRight} size={15} />
      </div>
    </Link>
  );
}
