import { useState, useCallback, useRef } from 'react';

/**
 * useGestureEngine - A unified engine for handling Tap, Drag, and Zoom
 * across gaming modules.
 */
export const useGestureEngine = (options = {}) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [zoom, setZoom] = useState(options.minZoom || 1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0, t: 0 });
  const isDraggingInternal = useRef(false);
  const dragThreshold = options.threshold || 10;

  const handleStart = useCallback((x, y) => {
    isDraggingInternal.current = false;
    startPos.current = { x, y };
    lastPos.current = { x, y, t: Date.now() };
    setIsDragging(false);
  }, []);

  const handleMove = useCallback((x, y) => {
    if (!lastPos.current.t) return;

    const dx = x - lastPos.current.x;
    const dy = y - lastPos.current.y;
    const dt = Date.now() - lastPos.current.t;

    const totalDx = x - startPos.current.x;
    const totalDy = y - startPos.current.y;

    if (!isDraggingInternal.current) {
      if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > dragThreshold) {
        isDraggingInternal.current = true;
        setIsDragging(true);
      }
    }

    if (isDraggingInternal.current) {
      // Handle Panning if dragging is enabled and we are zoomed in
      if (!optionsRef.current.disableDrag && zoom > 1) {
        setPan(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
      }

      if (optionsRef.current.onDragMove) {
        optionsRef.current.onDragMove({
          x, y,
          dx, dy,
          vx: dx / (dt || 1),
          vy: dy / (dt || 1),
          totalDx, totalDy
        });
      }
    }

    lastPos.current = { x, y, t: Date.now() };
  }, [dragThreshold, zoom]);

  const handleEnd = useCallback(() => {
    if (!lastPos.current.t) return;

    if (!isDraggingInternal.current) {
      // CLEAR TAP - No movement detected
      if (optionsRef.current.onTap) {
        optionsRef.current.onTap({ x: lastPos.current.x, y: lastPos.current.y });
      }
    } else {
      if (optionsRef.current.onDragEnd) {
        optionsRef.current.onDragEnd({
          offset: {
            x: lastPos.current.x - startPos.current.x,
            y: lastPos.current.y - startPos.current.y
          }
        });
      }
    }

    isDraggingInternal.current = false;
    setIsDragging(false);
    lastPos.current = { x: 0, y: 0, t: 0 };
  }, []);

  return {
    zoom,
    pan,
    isDragging,
    setZoom,
    setPan,
    handlers: {
      onPointerDown: (e) => handleStart(e.clientX, e.clientY),
      onPointerMove: (e) => handleMove(e.clientX, e.clientY),
      onPointerUp: handleEnd,
      onPointerCancel: handleEnd,
      onPointerLeave: handleEnd,
      style: { touchAction: 'none' }
    }
  };
};
