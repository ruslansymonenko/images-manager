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
    ${
      selected
        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500"
        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
    }
    ${onClick ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" : ""}
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
          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          title={`Remove ${tag.name} tag`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default TagChip;
