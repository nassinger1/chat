import type { UserStatus } from "@services/api.types";
import "./styles.css";

const LABELS: Record<UserStatus, string> = {
  online: "Online",
  offline: "Offline",
};

export function StatusDot({ status }: { status: UserStatus }) {
  return <span className={`status-dot ${status}`}>{LABELS[status]}</span>;
}
