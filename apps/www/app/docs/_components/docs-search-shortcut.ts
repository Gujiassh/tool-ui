export type SearchShortcutEvent = Pick<
  KeyboardEvent,
  "metaKey" | "ctrlKey" | "key" | "preventDefault" | "defaultPrevented"
>;

const handledShortcutEvents = new WeakSet<SearchShortcutEvent>();

export const triggerSearchFromShortcut = (
  event: SearchShortcutEvent,
  onOpen: () => void,
) => {
  if (handledShortcutEvents.has(event) || event.defaultPrevented) return false;

  const isModifierPressed = event.metaKey || event.ctrlKey;
  const isShortcutKey = event.key.toLowerCase() === "k";

  if (!isModifierPressed || !isShortcutKey) return false;

  handledShortcutEvents.add(event);
  event.preventDefault();
  onOpen();
  return true;
};
