export interface TocIndicatorState {
  top: number | null;
  transition: string;
}

interface ResolveTocIndicatorStateInput {
  reducedMotion: boolean;
  measuredTop: number | null;
  hasPositioned?: boolean;
}

export function resolveTocIndicatorState({
  reducedMotion,
  measuredTop,
  hasPositioned = false,
}: ResolveTocIndicatorStateInput): TocIndicatorState {
  if (measuredTop === null) {
    return {
      top: null,
      transition: "none",
    };
  }

  return {
    top: measuredTop,
    transition:
      reducedMotion || !hasPositioned ? "none" : "top 150ms ease-out",
  };
}
