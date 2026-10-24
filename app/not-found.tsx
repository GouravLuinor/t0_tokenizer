import { BrandedState } from "./tools/tokencraft/_components/shell/BrandedState";

const BUTTON =
  "inline-flex h-10 items-center rounded-md bg-gold px-4 text-[14px] font-semibold text-[#1d1400] hover:bg-[#f6b955] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-ink";

export default function NotFound() {
  return (
    <BrandedState
      title="404: off the board"
      actions={
        <a href="/tools/tokencraft" className={BUTTON}>
          Open the token counter
        </a>
      }
    >
      <p>That page doesn&apos;t exist. The counter and the rate board are one click away.</p>
    </BrandedState>
  );
}
