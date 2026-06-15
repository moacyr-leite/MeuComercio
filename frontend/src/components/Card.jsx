function Card({ title, subtitle, description, value, imageLabel, actions }) {
  return (
    <article className="card">
      <div className="card-image" aria-hidden="true">
        <span>{imageLabel || 'IMG'}</span>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <h3>{title}</h3>
          {value && <span className="card-value">{value}</span>}
        </div>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {description && <p className="card-text">{description}</p>}
        {actions && <div className="card-actions">{actions}</div>}
      </div>
    </article>
  );
}

export default Card;
