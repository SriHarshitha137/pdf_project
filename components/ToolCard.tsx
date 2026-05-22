import Link from "next/link";
import Icon from "./Icon";
import { icons, Tool } from "@/lib/data";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.id}`} style={{ textDecoration: "none" }}>
      <div className="tool-card">
        <div className="tool-icon" style={{ background: tool.color + "18" }}>
          <svg
            width={22}
            height={22}
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
          <Icon d={icons.chevronRight} size={16} />
        </div>
      </div>
    </Link>
  );
}
