import { useEffect, useState } from 'react';
import OwnerLayout from '../components/OwnerLayout.jsx';
import { getEquipment, createEquipment, updateEquipment, patchEquipmentStatus, deleteEquipment, manageEquipment } from '../services/equipmentService';

const LIMIT = 10;

function fmtD(v) { if (!v) return '—'; const d = new Date(v); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
function gm(e) { return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong'; }

const STATUS_META = { true: 'ft-pill-active', false: 'ft-pill-inactive' };
function ActivePill({ active }) {
  return <span className={'ft-pill ' + (active !== false ? 'ft-pill-active' : 'ft-pill-inactive')}>{active !== false ? 'ACTIVE' : 'INACTIVE'}</span>;
}

function SC({ l, v }) {
  return <div className='ft-stat-card'><div className='ft-stat-value'>{v}</div><div className='ft-stat-label'>{l}</div></div>;
}

function ConfirmDialog({ title, message, label, warn, onCancel, onConfirm, busy }) {
  return (
    <div className='ft-modal-overlay' role='alertdialog' aria-modal='true'>
      <div className='ft-modal ft-modal-sm'>
        <div className='ft-modal-header'>
          <h3>{title}</h3>
          <button type='button' className='ft-icon-btn' onClick={onCancel}>✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>{message}</p>
        <div className='ft-modal-actions'>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={onCancel} disabled={busy}>CANCEL</button>
          <button type='button' className={'ft-btn ' + (warn ? 'ft-btn-danger' : 'ft-btn-primary')} onClick={onConfirm} disabled={busy}>
            {busy ? 'PROCESSING…' : label}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({ category }) {
  const colors = { CARDIO: 'ft-pill-active', STRENGTH: 'ft-pill-active', FLEXIBILITY: 'ft-pill-pending', FUNCTIONAL: 'ft-pill-inactive', ACCESSORIES: 'ft-pill-active' };
  return <span className={'ft-pill ' + (colors[category] || 'ft-pill-inactive')}>{category || '—'}</span>;
}

function TypePill({ type }) {
  return <span className='ft-pill' style={{ borderColor: 'var(--text-faint)', color: 'var(--text-muted)' }}>{type || '—'}</span>;
}

function ConditionPill({ condition }) {
  const colors = { EXCELLENT: 'ft-pill-active', GOOD: 'ft-pill-active', FAIR: 'ft-pill-pending', POOR: 'ft-pill-inactive' };
  return <span className={'ft-pill ' + (colors[condition] || 'ft-pill-inactive')}>{condition || '—'}</span>;
}

export default function OwnerEquipment() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryF, setCategoryF] = useState('');
  const [conditionF, setConditionF] = useState('');
  const [typeF, setTypeF] = useState('');

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [lE, setLE] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [detail, setDetail] = useState(null);
  const [dLoading, setDLoading] = useState(false);

  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const params = {
    page, limit: LIMIT,
    search: search || undefined,
    category: categoryF || undefined,
    condition: conditionF || undefined,
    type: typeF || undefined,
  };

  const loadList = async () => {
    setLoading(true); setLE('');
    try {
      const b = await manageEquipment(params);
      setItems(b?.data || []);
      setMeta(b?.meta || { page, pages: 0, total: 0 });
    } catch (e) { setLE(gm(e)); }
    finally { setLoading(false); }
  };

  const loadDetail = async () => {
    setDLoading(true); setLE('');
    try {
      const b = await getEquipment(id);
      setDetail(b?.data || null);
      if (!b?.data) setLE('Not found');
    } catch (e) { setLE(gm(e)); }
    finally { setDLoading(false); }
  };

  useEffect(() => {
    if (id) { loadDetail(); }
    else { loadList(); }
  }, [id]);

  const refresh = () => { setPage(1); loadList(); };
  const closeM = () => setModal(null);
  const closeC = () => setConfirm(null);

  const openCreate = () => setModal({ mode: 'create', initial: null });
  const openEdit = (item) => setModal({ mode: 'edit', initial: item });

  const doCreate = async (f) => {
    setBusy(true);
    try {
      await createEquipment({
        name: f.name.trim(),
        category: f.category,
        type: f.type,
        brand: f.brand || undefined,
        model: f.model || undefined,
        serialNumber: f.serial || undefined,
        quantity: Number(f.quantity) || 0,
        unitPrice: f.price ? Number(f.price) : undefined,
        purchaseDate: f.purchaseDate || undefined,
        condition: f.condition,
        location: f.location || undefined,
        notes: f.notes || undefined,
        isActive: f.active,
      });
      setNotice('Equipment created.');
      refresh();
      closeM();
    } catch (e) { setNotice(gm(e)); }
    finally { setBusy(false); }
  };

  const doUpdate = async (f) => {
    if (!id) return;
    setBusy(true);
    try {
      await updateEquipment(id, {
        name: f.name.trim(),
        category: f.category,
        type: f.type,
        brand: f.brand || undefined,
        model: f.model || undefined,
        serialNumber: f.serial || undefined,
        quantity: Number(f.quantity) || 0,
        unitPrice: f.price ? Number(f.price) : undefined,
        purchaseDate: f.purchaseDate || undefined,
        condition: f.condition,
        location: f.location || undefined,
        notes: f.notes || undefined,
        isActive: f.active,
      });
      setNotice('Equipment updated.');
      setDetail(d => ({ ...d, name: f.name.trim(), category: f.category, type: f.type, brand: f.brand, model: f.model, serialNumber: f.serial, quantity: Number(f.quantity) || 0, unitPrice: f.price ? Number(f.price) : undefined, purchaseDate: f.purchaseDate, condition: f.condition, location: f.location, notes: f.notes, isActive: f.active }));
      refresh();
      closeM();
    } catch (e) { setNotice(gm(e)); }
    finally { setBusy(false); }
  };

  const doStatus = async (item, newActive) => {
    setBusy(true);
    try {
      await patchEquipmentStatus(item._id, newActive);
      setNotice('Status ' + (newActive ? 'activated' : 'deactivated') + '.');
      setDetail(d => d && d._id === item._id ? { ...d, isActive: newActive } : d);
      refresh();
    } catch (e) { setNotice(gm(e)); }
    finally { setBusy(false); }
  };

  const doDelete = async (item) => {
    setBusy(true);
    try {
      await deleteEquipment(item._id);
      setNotice('Equipment deleted.');
      setDetail(null);
      refresh();
    } catch (e) { setNotice(gm(e)); }
    finally { setBusy(false); }
  };

  /* ── Form state ─────────────────────────────────────────────────── */

  const [form, setForm] = useState({
    name: '', category: 'STRENGTH', type: 'MACHINE',
    brand: '', model: '', serial: '', quantity: 1, price: '',
    purchaseDate: '', condition: 'GOOD', location: '', notes: '',
    active: true,
  });

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setB = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.checked }));

  /* ── Detail view ────────────────────────────────────────────────── */

  if (id) {
    return (
      <OwnerLayout title='EQUIPMENT DETAIL' subtitle={detail ? 'Viewing equipment' : ''}>
        <div className='ft-detail-actions'>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={() => refresh()}>← BACK TO EQUIPMENT</button>
          {detail && (
            <>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => openEdit(detail)}>EDIT</button>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => doStatus(detail, !detail.isActive)} disabled={busy}>
                {detail.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
              </button>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setConfirm({ kind: 'delete', item: detail })} disabled={busy}>DELETE</button>
            </>
          )}
        </div>

        {notice && <div className='ft-banner ft-banner-ok'>{notice}</div>}

        {dLoading ? (
          <div className='ft-members-skeleton'>{Array.from({ length: 6 }).map((_, i) => <div key={i} className='ft-skeleton-row' />)}</div>
        ) : lE && !detail ? (
          <div className='ft-empty'>
            <div className='ft-kicker'>UNABLE TO LOAD EQUIPMENT</div>
            <p>{lE}</p>
            <button type='button' className='ft-btn ft-btn-ghost' onClick={loadDetail}>RETRY</button>
          </div>
        ) : detail ? (
          <div className='ft-detail-grid'>
            <section className='ft-detail-card ft-detail-wide'>
              <div className='ft-kicker'>EQUIPMENT</div>
              <dl className='ft-detail-list'>
                <div>
                  <dt>STATUS</dt>
                  <dd>
                    <ActivePill active={detail.isActive} />
                    <button type='button' className='ft-btn ft-btn-ghost' style={{ marginLeft: 12, padding: '8px 16px', fontSize: '11px' }}
                      onClick={() => doStatus(detail, !detail.isActive)} disabled={busy}>
                      {detail.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>
                  </dd>
                </div>
                <div><dt>NAME</dt><dd style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase', fontSize: '18px' }}>{detail.name}</dd></div>
                <div><dt>CATEGORY</dt><dd><CategoryPill category={detail.category} /></dd></div>
                <div><dt>TYPE</dt><dd><TypePill type={detail.type} /></dd></div>
                <div><dt>CONDITION</dt><dd><ConditionPill condition={detail.condition} /></dd></div>
                <div><dt>QUANTITY</dt><dd className='ft-mono'>{detail.quantity != null ? detail.quantity : '—'}</dd></div>
                <div><dt>UNIT PRICE</dt><dd className='ft-mono'>₹{detail.unitPrice != null ? Number(detail.unitPrice).toFixed(2) : '—'}</dd></div>
              </dl>
            </section>

            <section className='ft-detail-card'>
              <div className='ft-kicker'>IDENTITY</div>
              <dl className='ft-detail-list'>
                <div><dt>BRAND</dt><dd className='ft-mono'>{detail.brand || '—'}</dd></div>
                <div><dt>MODEL</dt><dd className='ft-mono'>{detail.model || '—'}</dd></div>
                <div><dt>SERIAL NUMBER</dt><dd className='ft-mono'>{detail.serialNumber || '—'}</dd></div>
                <div><dt>PURCHASE DATE</dt><dd className='ft-mono'>{fmtD(detail.purchaseDate)}</dd></div>
                <div><dt>LOCATION</dt><dd className='ft-mono'>{detail.location || '—'}</dd></div>
              </dl>
            </section>

            {detail.notes && (
              <section className='ft-detail-card'>
                <div className='ft-kicker'>NOTES</div>
                <p className='ft-mono' style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{detail.notes}</p>
              </section>
            )}

            <section className='ft-detail-card'>
              <div className='ft-kicker'>META</div>
              <dl className='ft-detail-list'>
                <div><dt>CREATED</dt><dd className='ft-mono'>{fmtD(detail.createdAt)}</dd></div>
                <div><dt>UPDATED</dt><dd className='ft-mono'>{fmtD(detail.updatedAt)}</dd></div>
                <div><dt>ID</dt><dd className='ft-mono ft-id' style={{ wordBreak: 'break-all' }}>{detail._id}</dd></div>
              </dl>
            </section>
          </div>
        ) : null}

        {modal && (
          <div className='ft-modal-overlay' onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) closeM(); }}>
            <div className='ft-modal' role='dialog' aria-modal='true'>
              <div className='ft-modal-header'>
                <h3>{modal.mode === 'create' ? 'NEW EQUIPMENT' : 'EDIT EQUIPMENT'}</h3>
                <button type='button' className='ft-icon-btn' onClick={closeM} disabled={busy}>✕</button>
              </div>
              {modal.mode === 'edit' && modal.initial && (
                <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '13px' }}>
                  Editing {modal.initial.name}
                </p>
              )}
              <form onSubmit={e => { e.preventDefault(); modal.mode === 'create' ? doCreate(form) : doUpdate(form); }}>
                <div className='ft-field'><span>Name *</span><input type='text' value={form.name} onChange={setF('name')} placeholder='Treadmill' required /></div>

                <div className='ft-field'><span>Category</span><select value={form.category} onChange={setF('category')}>
                  <option value='CARDIO'>CARDIO</option>
                  <option value='STRENGTH'>STRENGTH</option>
                  <option value='FLEXIBILITY'>FLEXIBILITY</option>
                  <option value='FUNCTIONAL'>FUNCTIONAL</option>
                  <option value='ACCESSORIES'>ACCESSORIES</option>
                </select></div>

                <div className='ft-field'><span>Type</span><select value={form.type} onChange={setF('type')}>
                  <option value='MACHINE'>MACHINE</option>
                  <option value='FREE_WEIGHT'>FREE_WEIGHT</option>
                  <option value='MAT'>MAT</option>
                  <option value='ACCESSORY'>ACCESSORY</option>
                  <option value='RACK'>RACK</option>
                  <option value='BENCH'>BENCH</option>
                </select></div>

                <div className='ft-field'><span>Brand</span><input type='text' value={form.brand} onChange={setF('brand')} placeholder='Life Fitness' /></div>

                <div className='ft-field'><span>Model</span><input type='text' value={form.model} onChange={setF('model')} placeholder='T9 Ti' /></div>

                <div className='ft-field'><span>Serial Number</span><input type='text' value={form.serial} onChange={setF('serial')} placeholder='LF-12345' /></div>

                <div className='ft-field'><span>Quantity</span><input type='number' min='0' value={form.quantity} onChange={setF('quantity')} /></div>

                <div className='ft-field'><span>Unit Price (₹)</span><input type='number' min='0' step='0.01' value={form.price} onChange={setF('price')} placeholder='0.00' /></div>

                <div className='ft-field'><span>Purchase Date</span><input type='date' value={form.purchaseDate} onChange={setF('purchaseDate')} /></div>

                <div className='ft-field'><span>Condition</span><select value={form.condition} onChange={setF('condition')}>
                  <option value='EXCELLENT'>EXCELLENT</option>
                  <option value='GOOD'>GOOD</option>
                  <option value='FAIR'>FAIR</option>
                  <option value='POOR'>POOR</option>
                </select></div>

                <div className='ft-field'><span>Location</span><input type='text' value={form.location} onChange={setF('location')} placeholder='Floor 1, Zone A' /></div>

                <div className='ft-field'><span>Notes</span><textarea rows={3} value={form.notes} onChange={setF('notes')} placeholder='Optional notes…' /></div>

                <div className='ft-field ft-check'>
                  <label>
                    <input type='checkbox' checked={form.active} onChange={setB('active')} />
                    <span>Active</span>
                  </label>
                </div>

                <div className='ft-modal-actions'>
                  <button type='button' className='ft-btn ft-btn-ghost' onClick={closeM} disabled={busy}>CANCEL</button>
                  <button type='submit' className='ft-btn' disabled={busy} style={{ background: 'var(--lime)', color: '#0c0f05', borderColor: 'var(--lime)' }}>
                    {busy ? 'SAVING…' : modal.mode === 'create' ? 'CREATE EQUIPMENT' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirm && (
          <ConfirmDialog
            title='DELETE EQUIPMENT'
            message={`Delete ${confirm.item.name}? It will be soft-deleted.`}
            label='DELETE'
            warn={true}
            onCancel={closeC}
            onConfirm={() => doDelete(confirm.item)}
            busy={busy}
          />
        )}
      </OwnerLayout>
    );
  }

  /* ── List view ─────────────────────────────────────────────────── */

  return (
    <OwnerLayout title='EQUIPMENT MANAGEMENT' subtitle='Manage gym equipment inventory'>
      {notice && <div className='ft-banner ft-banner-ok'>{notice}</div>}

      {loading ? (
        <div className='ft-members-skeleton'>{Array.from({ length: 8 }).map((_, i) => <div key={i} className='ft-skeleton-row' />)}</div>
      ) : lE ? (
        <div className='ft-empty'>
          <div className='ft-kicker'>UNABLE TO LOAD EQUIPMENT</div>
          <p>{lE}</p>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={loadList}>RETRY</button>
        </div>
      ) : items.length === 0 ? (
        <div className='ft-empty'>
          <div className='ft-kicker'>NO EQUIPMENT FOUND</div>
          <p>No equipment records match the current filters.</p>
          <button type='button' className='ft-btn ft-btn-ghost' onClick={refresh}>CLEAR FILTERS</button>
        </div>
      ) : (
        <>
          <div className='ft-payments-metrics'>
            <SC l='TOTAL ITEMS' v={meta.total} />
            <SC l='ACTIVE' v={items.filter(i => i.isActive !== false).length} />
            <SC l='INACTIVE' v={items.filter(i => i.isActive === false).length} />
            <SC l='TOTAL QTY' v={items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)} />
          </div>

          <div className='ft-members-toolbar'>
            <div className='ft-search'>
              <input type='text' placeholder='Search name, brand, serial…' value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <button type='button' className='ft-btn ft-btn-ghost ft-search-btn' onClick={() => { setSearch(''); setPage(1); }}>CLEAR</button>
            </div>
            <div className='ft-members-filters'>
              <select value={categoryF} onChange={e => { setCategoryF(e.target.value); setPage(1); }}>
                <option value=''>ALL CATEGORIES</option>
                <option value='CARDIO'>CARDIO</option>
                <option value='STRENGTH'>STRENGTH</option>
                <option value='FLEXIBILITY'>FLEXIBILITY</option>
                <option value='FUNCTIONAL'>FUNCTIONAL</option>
                <option value='ACCESSORIES'>ACCESSORIES</option>
              </select>
              <select value={conditionF} onChange={e => { setConditionF(e.target.value); setPage(1); }}>
                <option value=''>ALL CONDITIONS</option>
                <option value='EXCELLENT'>EXCELLENT</option>
                <option value='GOOD'>GOOD</option>
                <option value='FAIR'>FAIR</option>
                <option value='POOR'>POOR</option>
              </select>
              <select value={typeF} onChange={e => { setTypeF(e.target.value); setPage(1); }}>
                <option value=''>ALL TYPES</option>
                <option value='MACHINE'>MACHINE</option>
                <option value='FREE_WEIGHT'>FREE_WEIGHT</option>
                <option value='MAT'>MAT</option>
                <option value='ACCESSORY'>ACCESSORY</option>
                <option value='RACK'>RACK</option>
                <option value='BENCH'>BENCH</option>
              </select>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => { setCategoryF(''); setConditionF(''); setTypeF(''); setSearch(''); setPage(1); }}>CLEAR FILTERS</button>
            </div>
            <button type='button' className='ft-btn ft-btn-primary' onClick={openCreate}>+ ADD EQUIPMENT</button>
          </div>

          <div className='ft-members-table-wrap'>
            <table className='ft-members-table'>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>TYPE</th>
                  <th>BRAND</th>
                  <th>QTY</th>
                  <th>CONDITION</th>
                  <th>STATUS</th>
                  <th>LOCATION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ color: 'var(--white)', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>{item.name}</div>
                      {item.model && <div className='ft-mono' style={{ color: 'var(--text-faint)', fontSize: '11px' }}>{item.model}</div>}
                    </td>
                    <td><CategoryPill category={item.category} /></td>
                    <td><TypePill type={item.type} /></td>
                    <td className='ft-mono' style={{ color: 'var(--text-faint)' }}>{item.brand || '—'}</td>
                    <td className='ft-mono'>{item.quantity != null ? item.quantity : '—'}</td>
                    <td><ConditionPill condition={item.condition} /></td>
                    <td>
                      <ActivePill active={item.isActive} />
                      <button type='button' className='ft-link' style={{ marginLeft: 8 }} onClick={() => doStatus(item, !item.isActive)} disabled={busy}>
                        {item.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                    </td>
                    <td className='ft-mono' style={{ color: 'var(--text-faint)' }}>{item.location || '—'}</td>
                    <td>
                      <div className='ft-row-actions'>
                        <button type='button' className='ft-link' onClick={() => openEdit(item)}>VIEW</button>
                        <button type='button' className='ft-link' onClick={() => openEdit(item)}>EDIT</button>
                        <button type='button' className='ft-link ft-link-danger' onClick={() => setConfirm({ kind: 'delete', item })}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='ft-pagination'>
            <span className='ft-pagination-info'>PAGE {meta.page} OF {meta.pages || 0} · TOTAL {meta.total}</span>
            <div className='ft-pagination-btns'>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>PREVIOUS</button>
              <button type='button' className='ft-btn ft-btn-ghost' onClick={() => setPage(p => p + 1)} disabled={page >= meta.pages}>NEXT</button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <div className='ft-modal-overlay' onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) closeM(); }}>
          <div className='ft-modal' role='dialog' aria-modal='true'>
            <div className='ft-modal-header'>
              <h3>{modal.mode === 'create' ? 'NEW EQUIPMENT' : 'EDIT EQUIPMENT'}</h3>
              <button type='button' className='ft-icon-btn' onClick={closeM} disabled={busy}>✕</button>
            </div>
            {modal.mode === 'edit' && modal.initial && (
              <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '13px' }}>
                Editing {modal.initial.name}
              </p>
            )}
            <form onSubmit={e => { e.preventDefault(); modal.mode === 'create' ? doCreate(form) : doUpdate(form); }}>
              <div className='ft-field'><span>Name *</span><input type='text' value={form.name} onChange={setF('name')} placeholder='Treadmill' required /></div>
              <div className='ft-field'><span>Category</span><select value={form.categoryLocked} onChange={setF('category')}>
                <option value='CARDIO'>CARDIO</option>
                <option value='STRENGTH'>STRENGTH</option>
                <option value='FLEXIBILITY'>FLEXIBILITY</option>
                <option value='FUNCTIONAL'>FUNCTIONAL</option>
                <option value='ACCESSORIES'>ACCESSORIES</option>
              </select></div>
              <div className='ft-field'><span>Type</span><select value={form.type} onChange={setF('type')}>
                <option value='MACHINE'>MACHINE</option>
                <option value='FREE_WEIGHT'>FREE_WEIGHT</option>
                <option value='MAT'>MAT</option>
                <option value='ACCESSORY'>ACCESSORY</option>
                <option value='RACK'>RACK</option>
                <option value='BENCH'>BENCH</option>
              </select></div>
              <div className='ft-field'><span>Brand</span><input type='text' value={form.brand} onChange={setF('brand')} placeholder='Life Fitness' /></div>
              <div className='ft-field'><span>Model</span><input type='text' value={form.model} onChange={setF('model')} placeholder='T9 Ti' /></div>
              <div className='ft-field'><span>Serial Number</span><input type='text' value={form.serial} onChange={setF('serial')} placeholder='LF-12345' /></div>
              <div className='ft-field'><span>Quantity</span><input type='number' min='0' value={form.quantity} onChange={setF('quantity')} /></div>
              <div className='ft-field'><span>Unit Price (₹)</span><input type='number' min='0' step='0.01' value={form.price} onChange={setF('price')} placeholder='0.00' /></div>
              <div className='ft-field'><span>Purchase Date</span><input type='date' value={form.purchaseDate} onChange={setF('purchaseDate')} /></div>
              <div className='ft-field'><span>Condition</span><select value={form.condition} onChange={setF('condition')}>
                <option value='EXCELLENT'>EXCELLENT</option>
                <option value='GOOD'>GOOD</option>
                <option value='FAIR'>FAIR</option>
                <option value='POOR'>POOR</option>
              </select></div>
              <div className='ft-field'><span>Location</span><input type='text' value={form.location} onChange={setF('location')} placeholder='Floor 1, Zone A' /></div>
              <div className='ft-field'><span>Notes</span><textarea rows={3} value={form.notes} onChange={setF('notes')} placeholder='Optional notes…' /></div>
              <div className='ft-field ft-check'>
                <label>
                  <input type='checkbox' checked={form.active} onChange={setB('active')} />
                  <span>Active</span>
                </label>
              </div>
              <div className='ft-modal-actions'>
                <button type='button' className='ft-btn ft-btn-ghost' onClick={closeM} disabled={busy}>CANCEL</button>
                <button type='submit' className='ft-btn' disabled={busy} style={{ background: 'var(--lime)', color: '#0c0f05', borderColor: 'var(--lime)' }}>
                  {busy ? 'SAVING…' : modal.mode === 'create' ? 'CREATE EQUIPMENT' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title='DELETE EQUIPMENT'
          message={`Delete ${confirm.item.name}? It will be soft-deleted.`}
          label='DELETE'
          warn={true}
          onCancel={closeC}
          onConfirm={() => doDelete(confirm.item)}
          busy={busy}
        />
      )}
    </OwnerLayout>
  );
}
