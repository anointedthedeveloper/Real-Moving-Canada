import { useMemo, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Notice from '../../components/common/Notice.jsx';
import SearchInput from '../../components/dashboard/SearchInput.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { fetchConversations, sendMessage } from '../../services/portalService.js';
import { fmtDate } from '../../utils/format.js';
import { COMPANY } from '../../constants/company.js';

export default function MessagesPage() {
  useDocumentTitle('Messages');
  const { data, loading, error, reload } = useAsync(fetchConversations);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');
  const [send, setSend] = useState({ busy: false, error: '' });

  const conversations = data?.items || [];
  const visible = useMemo(() => conversations.filter((c) => `${c.subject} ${c.preview}`.toLowerCase().includes(query.toLowerCase())), [conversations, query]);
  const active = conversations.find((c) => c.id === activeId) || visible[0];

  const onSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    setSend({ busy: true, error: '' });
    try {
      await sendMessage(active.id, draft.trim());
      setDraft('');
      setSend({ busy: false, error: '' });
      reload();
    } catch (err) {
      setSend({ busy: false, error: err.message });
    }
  };

  return (
    <PortalLoader loading={loading} error={error} reload={reload}>
      <div className="messages">
        <section className="inbox" aria-label="Inbox">
          <header className="inbox-head">
            <h2>Inbox</h2>
            <Button size="sm" icon="plus" to="/contact">New</Button>
          </header>
          <SearchInput label="Search messages" value={query} onChange={setQuery} />
          {visible.length ? (
            <ul className="inbox-list">
              {visible.map((c) => (
                <li key={c.id}>
                  <button type="button" className={`inbox-item${active?.id === c.id ? ' is-active' : ''}`} onClick={() => setActiveId(c.id)} aria-pressed={active?.id === c.id}>
                    <span className="inbox-avatar"><Icon name="message" /></span>
                    <span className="inbox-body"><strong>{c.subject}</strong><small>{c.reference}</small><span>{c.preview}</span></span>
                    <span className="inbox-meta"><small>{fmtDate(c.updatedAt, { year: undefined })}</small>{c.unread && <span className="unread-dot" aria-label="Unread" />}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="message" title="No messages yet" text="Updates about your quotes, bookings and moves will appear here." dashed={false} />
          )}
        </section>

        <section className="thread" aria-label="Conversation">
          {active ? (
            <>
              <header className="thread-head">
                <div><h2>{active.subject}</h2><small>{active.reference}</small></div>
                <Button to="/dashboard/moves" variant="outline" size="sm">View move</Button>
              </header>
              <ol className="thread-messages">
                {(active.messages || []).map((m) => (
                  <li key={m.id} className={`bubble ${m.from === 'customer' ? 'is-mine' : ''}`}>
                    {m.from !== 'customer' && <strong>{COMPANY.name}</strong>}
                    <p>{m.body}</p>
                    <small>{fmtDate(m.sentAt, { hour: 'numeric', minute: '2-digit' })}</small>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="thread-empty">
              <EmptyState
                icon="message" title="No conversation selected" dashed={false}
                text={`Messages with our team will show here. Until then, reach us at ${COMPANY.phone} or ${COMPANY.email}.`}
                action={<Button to="/contact" variant="outline">Contact us</Button>}
              />
            </div>
          )}
          {send.error && <Notice tone="error" className="thread-error">{send.error}</Notice>}
          <form className="composer" onSubmit={onSend}>
            <label htmlFor="composer-input" className="sr-only">Write a message</label>
            <input id="composer-input" className="input" placeholder={active ? 'Write a message…' : 'Select a conversation to reply'} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={!active} maxLength={4000} />
            <Button type="submit" icon="send" loading={send.busy} disabled={!active || !draft.trim()}>Send</Button>
          </form>
        </section>
      </div>
    </PortalLoader>
  );
}
