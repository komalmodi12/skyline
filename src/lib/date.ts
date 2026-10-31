// Aaj ki date India (IST) mein, "2026-10-31" format.
// Server ka schema aur form ka date input, dono yahi use karte hain.
export function todayInIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date()
  );
}
