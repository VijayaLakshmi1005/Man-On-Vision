import { useEffect, useRef, useCallback } from 'react';

/**
 * AAA-Quality Production Swipe & Drag Hook
 * Supports Mobile Touch, Desktop Mouse Drag, and Trackpad Gestures
 */
export const useSwipe = (onSwipe, options = {}) => {
  const {
    threshold = 50,         // Minimum distance for a swipe
    velocityThreshold = 0.3, // Pixels per ms for a "flick"
    preventScroll = true,    // Prevent default scroll behavior
    lockDirection = true,   // Focus on one direction (horizontal or vertical)
    enabled = true          // Toggle hook
  } = options;

  const state = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isSwiping: false,
    currentX: 0,
    currentY: 0,
  });

  const handleStart = useCallback((x, y) => {
    state.current = {
      startX: x,
      startY: y,
      startTime: Date.now(),
      isSwiping: true,
      currentX: x,
      currentY: y,
    };
  }, []);

  const handleMove = useCallback((x, y) => {
    if (!state.current.isSwiping) return;
    state.current.currentX = x;
    state.current.currentY = y;
  }, []);

  const handleEnd = useCallback(() => {
    if (!state.current.isSwiping) return;

    const { startX, startY, startTime, currentX, currentY } = state.current;
    state.current.isSwiping = false;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const deltaTime = Date.now() - startTime;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Calculate velocity (px/ms)
    const velocityX = absX / deltaTime;
    const velocityY = absY / deltaTime;

    // Detection logic
    if (absX < threshold && absY < threshold && velocityX < velocityThreshold && velocityY < velocityThreshold) {
      return; // Too small move
    }

    // Determine direction
    if (lockDirection) {
      if (absX > absY) {
        // Horizontal
        if (absX > threshold || velocityX > velocityThreshold) {
          onSwipe(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        // Vertical
        if (absY > threshold || velocityY > velocityThreshold) {
          onSwipe(deltaY > 0 ? 'down' : 'up');
        }
      }
    } else {
      // Freeform (could trigger diagonal if we wanted, but standard 2048 is 4-way)
      if (absX > absY && (absX > threshold || velocityX > velocityThreshold)) {
        onSwipe(deltaX > 0 ? 'right' : 'left');
      } else if (absY > absX && (absY > threshold || velocityY > velocityThreshold)) {
        onSwipe(deltaY > 0 ? 'down' : 'up');
      }
    }
  }, [onSwipe, threshold, velocityThreshold, lockDirection]);

  useEffect(() => {
    if (!enabled) return;

    const target = window;

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e) => {
      if (preventScroll && state.current.isSwiping) {
        // Check if movement is significant enough to justify preventing scroll
        const dx = Math.abs(e.touches[0].clientX - state.current.startX);
        const dy = Math.abs(e.touches[0].clientY - state.current.startY);
        if (dx > 5 || dy > 5) {
            if (e.cancelable) e.preventDefault();
        }
      }
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => handleEnd();

    const onMouseDown = (e) => {
      handleStart(e.clientX, e.clientY);
    };

    const onMouseMove = (e) => {
      handleMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => handleEnd();

    // Passive: false is needed for preventDefault() to work on touchmove
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: false });
    target.addEventListener('touchend', onTouchEnd, { passive: true });

    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('mousemove', onMouseMove);
    target.addEventListener('mouseup', onMouseUp);

    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('mousemove', onMouseMove);
      target.removeEventListener('mouseup', onMouseUp);
    };
  }, [enabled, handleStart, handleMove, handleEnd, preventScroll]);

  return {
    isSwiping: state.current.isSwiping
  };
};
