const PALETTE = [
  "#db2777",
  "#e11d48",
  "#c026d3",
  "#be185d",
  "#a21caf",
  "#f43f5e",
  "#9d174d",
];

function colorForName(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function initialsForName(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default function Avatar({
  name,
  photoUrl,
  size = 96,
  className = "",
}: {
  name: string;
  photoUrl?: string;
  size?: number;
  className?: string;
}) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: colorForName(name),
        fontSize: size * 0.36,
      }}
    >
      {initialsForName(name)}
    </div>
  );
}
