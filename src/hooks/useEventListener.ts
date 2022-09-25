import { RefObject, useCallback, useEffect, useRef } from "react";
import { getRefElement } from "../heplers/helpers";

interface UseEventListener {
  eventName: keyof WindowEventMap;
  handler: EventListener;
  element?: RefObject<Element> | Document | Window;
}

export const useEventListener = ({
  eventName,
  handler,
  element = document,
}: UseEventListener) => {
  // Create a ref that stores handler
  const savedHandler = useRef<EventListener>();
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  const handleEventListener = useCallback((event: Event) => {
    savedHandler.current?.(event);
  }, []);

  useEffect(() => {
    const target = getRefElement(element);
    target?.addEventListener(eventName, handleEventListener);
    return () => target?.removeEventListener(eventName, handleEventListener);
  }, [eventName, element, handleEventListener]);
};
