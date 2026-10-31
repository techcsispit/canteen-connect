interface Props {
  status: string; // "received" | "preparing" | "ready" | "completed" | "cancelled"
}

const STEPS = [
  { key: "received", label: "Order Received", icon: "📝" },
  { key: "preparing", label: "In the Kitchen", icon: "🍳" },
  { key: "ready", label: "Ready for Pickup", icon: "🔔" },
  { key: "completed", label: "Completed", icon: "✅" },
];

export default function OrderTracker({ status }: Props) {
  const normStatus = (status || "received").toLowerCase();
  const isCancelled = normStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="order-tracker tracker-cancelled">
        <span className="tracker-cancelled-badge">❌ Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === normStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="order-tracker" aria-label={`Order status: ${normStatus}`}>
      <div className="tracker-steps">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.key}
              className={`tracker-step ${isDone ? "step-done" : ""} ${isCurrent ? "step-current" : ""}`}
            >
              <div className="step-circle" aria-hidden="true">
                {isDone ? "✓" : step.icon}
              </div>
              <span className="step-label">{step.label}</span>
              {idx < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
