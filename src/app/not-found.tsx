import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page-head">
      <h1 className="display">Nothing here.</h1>
      <p className="lede">This page doesn't exist, or the link is incomplete.</p>
      <p style={{ marginTop: "2rem" }}>
        <Link href="/" className="btn btn--ghost">
          Back to the homepage
        </Link>
      </p>
    </div>
  );
}
