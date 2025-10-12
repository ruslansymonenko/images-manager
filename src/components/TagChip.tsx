import React from "react";
import { X } from "lucide-react";
import { Tag } from "../utils/database";

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
  removable?: boolean;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TagChip: React.FC<TagChipProps> = ({
  tag,
  onRemove,
  onClick,
  removable = false,
  selected = false,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const baseClasses = `
    inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200
    ${sizeClasses[size]}
    ${selected ? "ring-2 ring-focus" : "bg-tertiary text-primary"}
    ${onClick ? "cursor-pointer hover:bg-hover" : ""}
    ${className}
  `.trim();

  const chipStyle = tag.color
    ? {
        backgroundColor: selected ? tag.color + "20" : tag.color + "10",
        color: tag.color,
        borderColor: selected ? tag.color : "transparent",
        borderWidth: selected ? "2px" : "1px",
      }
    : {};

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className={baseClasses}
      style={chipStyle}
      onClick={handleClick}
      title={tag.name}
    >
      <span className="truncate max-w-32">{tag.name}</span>
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 hover:bg-hover rounded-full p-0.5 transition-colors"
          title={`Remove ${tag.name} tag`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default TagChip;
