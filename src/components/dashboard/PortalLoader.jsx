import { SkeletonList } from '../common/Skeleton.jsx';
import Notice from '../common/Notice.jsx';
import Button from '../common/Button.jsx';

/** Handles the loading and error states every portal list shares. */
export default function PortalLoader({ loading, error, reload, children, rows = 3 }) {
  if (loading) return <SkeletonList rows={rows} />;
  if (error) {
    return (
      <Notice tone="error" title="We couldn’t load this information" action={<Button size="sm" variant="outline" onClick={reload}>Try again</Button>}>
        {error.message}
      </Notice>
    );
  }
  return children;
}
