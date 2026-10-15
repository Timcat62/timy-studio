import { brandPaths, type BrandName } from "@/lib/brand-icons";
import { links, linktreeUrl, site } from "@/lib/config";
import { Icon } from "./Icon";

export function BrandIcon({ name }: { name: BrandName }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={brandPaths[name]} />
    </svg>
  );
}

interface Props {
  /** Which link groups to show, in order. */
  groups?: string[];
  /** Also show the Linktree and email icons. */
  extras?: boolean;
}

/** Small round logo buttons for your social and music links. Each has an accessible name and a tooltip. */
export function SocialLinks({ groups = ["social", "listen", "community"], extras = true }: Props) {
  const items = groups.flatMap((g) => links.filter((l) => l.group === g && l.icon && l.href));
  return (
    <ul className="socials">
      {items.map((l) => (
        <li key={l.label}>
          <a className="social" href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}>
            <BrandIcon name={l.icon!} />
          </a>
        </li>
      ))}
      {extras ? (
        <>
          <li>
            <a className="social" href={linktreeUrl} target="_blank" rel="noopener noreferrer" aria-label="All links (Linktree)" title="All links (Linktree)">
              <BrandIcon name="linktree" />
            </a>
          </li>
          <li>
            <a className="social" href={`mailto:${site.email}`} aria-label={`Email ${site.email}`} title={site.email}>
              <Icon name="mail" />
            </a>
          </li>
        </>
      ) : null}
    </ul>
  );
}
