import { useEffect, useState } from 'react';
import useInView from '../hooks/useInView';

export default function CountUp({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView();

  // ERR-038 FIX: Robust check for initial mount and viewport trigger
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const target = Number(end) || 0;
    if (target <= 0) return;

    const stepTime = 16;
    const totalSteps = Math.max(1, duration / stepTime);
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}
