export default function TestimonialCard({ name, role, quote, avatar }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-quote">"{quote}"</div>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{avatar}</div>
        <div>
          <strong>{name}</strong>
          <span>{role}</span>
        </div>
      </div>
    </div>
  );
}
