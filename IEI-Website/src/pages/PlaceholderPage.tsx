
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="py-4">
      <h1 className="font-display font-black text-2xl md:text-3xl text-[#201E1D] tracking-tight">
        {title}
      </h1>
    </div>
  );
}

