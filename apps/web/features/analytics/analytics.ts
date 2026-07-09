export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Analytics Event] Category: ${category} | Action: ${action} | Label: ${label || "None"} | Value: ${value !== undefined ? value : "None"}`
    );
  }

  // Inject into window dataLayer if present (Google Analytics/Tag Manager standard)
  if (typeof window !== "undefined") {
    const win = window as Window & { dataLayer?: unknown[] };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({
      event: "codeatlas_event",
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
    });
  }
};
