/** A fixed row of what the studio makes. */
export function Strip({ items }: { items: string[] }) {
  return (
    <div className="strip">
      <ul className="wrap strip__list">
        {items.map((item) => (
          <li key={item} className="strip__item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
