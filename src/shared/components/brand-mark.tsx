export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#2168f6] font-extrabold text-white shadow-[0_10px_28px_rgba(33,104,246,0.22)] ${
          compact ? "h-10 w-10 text-sm" : "h-16 w-16 text-2xl"
        }`}
      >
        TT
      </div>
      {!compact && (
        <>
          <h1 className="mt-5 text-5xl font-extrabold tracking-normal text-slate-950">
            TikTakTuk
          </h1>
          <p className="mt-3 text-lg font-semibold text-slate-500">
            Platform Manajemen Pertunjukan & Tiket
          </p>
        </>
      )}
    </div>
  );
}
