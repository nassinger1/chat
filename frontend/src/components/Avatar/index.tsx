import "./styles.css";

const COLORS = ["#ffd9a8", "#bfe8c2", "#bcd7f7", "#e6c6f2", "#f7c6c6"];

export function Avatar({ name }: { name: string }) {
  const color = COLORS[name.length % COLORS.length];

  return (
    <span className="avatar" style={{ background: color }}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
