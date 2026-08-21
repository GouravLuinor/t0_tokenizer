import { permanentRedirect } from "next/navigation";

export default function Home() {
  // Canonical tool route — "/" consolidates to the full metadata-bearing path
  permanentRedirect("/tools/tokencraft");
}
