import { DocsToc } from "./docs-toc";

export function DocsTocWrapper() {
  return (
    <div className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-16">
        <DocsToc />
      </div>
    </div>
  );
}
