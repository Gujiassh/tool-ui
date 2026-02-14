export type VideoMediaEvent = "mute" | "unmute";

export function getMuteMediaEvent(
  previousMuted: boolean,
  nextMuted: boolean,
): VideoMediaEvent | null {
  if (previousMuted === nextMuted) {
    return null;
  }

  return nextMuted ? "mute" : "unmute";
}
