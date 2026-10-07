import useInView from '../hooks/useInView';

export default function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`animated-section ${isInView ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
