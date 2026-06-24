import { ClipboardList } from 'lucide-react';

export function QuestBoardEmpty() {
  return (
    <div className="rounded-[1.5rem] border-2 border-dashed border-primary/25 bg-background/70 px-6 py-12 text-center">
      <ClipboardList className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
      <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide">No quests here</p>
      <p className="mt-2 text-sm text-muted-foreground">Try another filter or refresh the board.</p>
    </div>
  );
}
