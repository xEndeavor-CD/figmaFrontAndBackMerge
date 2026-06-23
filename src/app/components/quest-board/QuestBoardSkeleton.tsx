export function QuestBoardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.5rem] border-2 border-primary/15 bg-card/60 px-5 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted/80" />
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
