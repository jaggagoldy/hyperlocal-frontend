'use client';

// Vendor onboarding entry. Replaced the heavy multi-step WorkspaceBuilder takeover
// (which crashed on the mobile PWA) with a lightweight, mobile-safe "Add your
// business" flow. The full storefront builder now lives in the dashboard's
// "Design Storefront" (best on desktop). See AddBusinessFlow for the logic.
import AddBusinessFlow from './AddBusinessFlow';

export default function VendorRegisterPage() {
  return <AddBusinessFlow />;
}
