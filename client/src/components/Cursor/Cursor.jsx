import { useEffect, useRef, useState } from 'react';
import './Cursor.scss';

function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOverIframe, setIsOverIframe] = useState(false);

  useEffect(() => {
    // Check if device supports hover (not touch device)
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    // Mouse position
    const mouse = { x: 0, y: 0 };
    // Ring position (follows with delay)
    const ringPos = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Check if mouse is over iframe
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      const isIframe = elementUnderCursor?.tagName === 'IFRAME' ||
                       elementUnderCursor?.closest('iframe') !== null;
      setIsOverIframe(isIframe);

      // Move dot instantly
      if (dot) {
        dot.style.transform = `translate(-50%, -50%) translate(${mouse.x}px, ${mouse.y}px)`;
        dot.style.opacity = isIframe ? '0' : '1';
      }

      // Hide ring over iframe too
      if (ring && isIframe) {
        ring.style.opacity = '0';
      } else if (ring) {
        ring.style.opacity = '0.6';
      }
    };

    // Smooth follow animation for ring (lerp)
    const animateRing = () => {
      // Linear interpolation - ring follows mouse with delay
      ringPos.x += (mouse.x - ringPos.x) * 0.15;
      ringPos.y += (mouse.y - ringPos.y) * 0.15;

      if (ring) {
        ring.style.transform = `translate(-50%, -50%) translate(${ringPos.x}px, ${ringPos.y}px)`;
      }

      requestAnimationFrame(animateRing);
    };

    // Handle hover on interactive elements
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [role="button"]');

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Start animation
    const rafId = requestAnimationFrame(animateRing);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // Don't render on touch devices
  const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  if (!hasHover) return null;

  return (
    <div className="cursor">
      <div ref={dotRef} className="cursor__dot"></div>
      <div
        ref={ringRef}
        className={`cursor__ring ${isHovered ? 'cursor__ring--hovered' : ''}`}
      ></div>
    </div>
  );
}

export default Cursor;
