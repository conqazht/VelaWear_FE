export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block w-full text-[10px] font-semibold uppercase tracking-widest text-[#1c1a18]/60">
      {children}
    </label>
  );
}
