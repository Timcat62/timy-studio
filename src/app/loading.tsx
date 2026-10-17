/** Shown right away while a page that needs the server (shop, account, project) is being prepared. */
export default function Loading() {
  return (
    <div className="page-loading" role="status">
      <span className="page-loading__ring" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
