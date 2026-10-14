/** Slow strip of capabilities under the hero. Duplicated once so the loop is seamless. */
export function Ticker({ items }: { items: string[] }) {
  const group = (hidden: boolean) => (
    <div className="ticker__group" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="ticker__item">
          {item}
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker" role="presentation">
      <div className="ticker__track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
