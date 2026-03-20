function Card({ title, children }) {
  return (
    <div className="card">
      {title ? <h3>{title}</h3> : null}
      <div>{children}</div>
    </div>
  );
}

export default Card;