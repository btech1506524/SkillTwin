export default function FeatureCard({ icon, title, description, onExplore }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" className="learn-more" onClick={onExplore}>Explore →</button>
    </div>
  );
}
