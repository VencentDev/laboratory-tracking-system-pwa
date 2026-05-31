export const ACKNOWLEDGEMENT_REPORT_PRINTING_CLASS = "acknowledgement-report-printing";

export function printAcknowledgementReports(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  let hasCleanedUp = false;

  function cleanup() {
    if (hasCleanedUp) {
      return;
    }

    hasCleanedUp = true;
    document.body.classList.remove(ACKNOWLEDGEMENT_REPORT_PRINTING_CLASS);
    window.removeEventListener("afterprint", cleanup);
  }

  document.body.classList.add(ACKNOWLEDGEMENT_REPORT_PRINTING_CLASS);
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 1000);

  return true;
}
