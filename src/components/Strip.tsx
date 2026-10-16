/** A fixed, centred line of what I make. */
export function Strip({ items }: { items: string[] }) {
  return (
    <div className="strip">
      <ul className="strip__list">
        {items.map((item) => (
          <li key={item} className="strip__item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
