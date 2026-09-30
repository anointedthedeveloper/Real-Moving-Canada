import { useMemo, useRef, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Notice from '../../components/common/Notice.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import DataTable from '../../components/dashboard/DataTable.jsx';
import FilterTabs from '../../components/dashboard/FilterTabs.jsx';
import SearchInput from '../../components/dashboard/SearchInput.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { fetchDocuments, uploadDocument } from '../../services/portalService.js';
import { fmtDate } from '../../utils/format.js';

const CATEGORIES = [
  { value: 'all', label: 'All documents' },
  { value: 'move', label: 'Move documents' },
  { value: 'quote', label: 'Quotes' },
  { value: 'invoice', label: 'Invoices & receipts' },
  { value: 'upload', label: 'Uploads' },
];
const MAX_MB = 10;
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.heic,.doc,.docx';

const COLUMNS = [
  {
    key: 'name', label: 'Document', render: (d) => (
      <span className="doc-name"><span className="icon-tile"><Icon name="file" /></span><span><strong>{d.name}</strong><small>{[d.fileType, d.size].filter(Boolean).join(' · ')}</small></span></span>
    ),
  },
  { key: 'category', label: 'Category', render: (d) => CATEGORIES.find((c) => c.value === d.category)?.label || d.category },
  { key: 'reference', label: 'Reference' },
  { key: 'updatedAt', label: 'Updated', render: (d) => fmtDate(d.updatedAt) },
  {
    key: 'actions', label: 'Actions', render: (d) => (
      <span className="row-actions">
        {d.url && <a className="icon-link" href={d.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${d.name}`}><Icon name="eye" /></a>}
        {d.url && <a className="icon-link" href={d.url} download aria-label={`Download ${d.name}`}><Icon name="download" /></a>}
      </span>
    ),
  },
];

export default function DocumentsPage() {
  useDocumentTitle('Documents', undefined, { noindex: true });
  const { data, loading, error, reload } = useAsync(fetchDocuments);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [upload, setUpload] = useState({ busy: false, error: '', done: '' });
  const fileRef = useRef(null);

  const docs = data?.items || [];
  const rows = useMemo(() => docs.filter((d) =>
    (category === 'all' || d.category === category) && `${d.name} ${d.reference}`.toLowerCase().includes(query.toLowerCase())), [docs, category, query]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) { setUpload({ busy: false, error: `That file is larger than ${MAX_MB} MB. Please choose a smaller file.`, done: '' }); return; }
    setUpload({ busy: true, error: '', done: '' });
    try {
      await uploadDocument(file);
      setUpload({ busy: false, error: '', done: `${file.name} was uploaded.` });
      reload();
    } catch (err) {
      setUpload({ busy: false, error: err.message, done: '' });
    }
  };

  return (
    <>
      <PageIntro title="Documents" text="View, download, or upload documents related to your moves."
        action={<Button icon="upload" loading={upload.busy} onClick={() => fileRef.current?.click()}>Upload document</Button>} />
      <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} onChange={onFile} aria-label="Choose a document to upload" />
      {upload.error && <Notice tone="error" className="mb-1">{upload.error}</Notice>}
      {upload.done && <Notice tone="success" className="mb-1">{upload.done}</Notice>}
      <PortalLoader loading={loading} error={error} reload={reload}>
        <Panel>
          <div className="toolbar">
            <FilterTabs label="Document category" options={CATEGORIES} value={category} onChange={setCategory} />
            <SearchInput label="Search documents" value={query} onChange={setQuery} />
          </div>
          <div className="mt-1">
            <DataTable caption="Documents" columns={COLUMNS} rows={rows}
              empty={<EmptyState icon="folder" title={docs.length ? 'No matching documents' : 'No documents yet'} text={docs.length ? 'Try another category or search.' : 'Quotes, invoices, receipts and move paperwork will appear here.'} />} />
          </div>
          <div className="upload-row">
            <span className="icon-tile"><Icon name="upload" /></span>
            <div><strong>Upload a document</strong><small>PDF, image or Word file up to {MAX_MB} MB, such as building move-in rules or an inventory list.</small></div>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Choose file</Button>
          </div>
        </Panel>
      </PortalLoader>
    </>
  );
}
