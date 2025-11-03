import Link from "next/link";
import React from "react";

interface GameCardProps {
  title: string;
  href: string;
  category: "01" | "cricket";
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  href,
  category,
}) => {
  const bgColor = category === "01" ? "bg-blue-400" : "bg-green-300";

  return (
    <Link
      href={href}
      className={`w-full ${bgColor} border border-gray-200 rounded-lg shadow p-5 text-center`}
    >
      <h5 className="text-2xl font-bold tracking-tight text-gray-900">
        {title}
      </h5>
    </Link>
  );
};
