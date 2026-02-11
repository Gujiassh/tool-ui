interface ResolveNewAnimationIdsInput {
  seenIds: Set<string>;
  currentIds: string[];
  treatAsInitialSnapshot?: boolean;
}

export interface ResolveNewAnimationIdsResult {
  newIds: Set<string>;
  nextSeenIds: Set<string>;
}

export function resolveNewAnimationIds({
  seenIds,
  currentIds,
  treatAsInitialSnapshot = seenIds.size === 0,
}: ResolveNewAnimationIdsInput): ResolveNewAnimationIdsResult {
  const nextSeenIds = new Set(seenIds);

  if (treatAsInitialSnapshot) {
    for (const id of currentIds) {
      nextSeenIds.add(id);
    }

    return {
      newIds: new Set<string>(),
      nextSeenIds,
    };
  }

  const newIds = new Set<string>();

  for (const id of currentIds) {
    if (!nextSeenIds.has(id)) {
      newIds.add(id);
      nextSeenIds.add(id);
    }
  }

  return {
    newIds,
    nextSeenIds,
  };
}
