import React, { useState } from 'react';
import { supabase } from '../config/supabase';

export default function DeleteReasonModal({ item, itemType, tableName, onClose, onSuccess }) {
  const [deletedBy, setDeletedBy] = useState('');
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText !== 'HAPUS') {
      alert('Ketik kata HAPUS dengan huruf kapital untuk konfirmasi.');
      return;
    }

    setLoading(true);
    try {
      const { error: logError } = await supabase.from('deletion_logs').insert([
        {
          item_type: itemType,
          item_title: item.title,
          deleted_by: deletedBy,
          reason: reason,
        },
      ]);

      if (logError) throw logError;

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      alert(`${itemType} "${item.title}" telah dihapus permanen dan dilaporkan ke log Admin.`);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Gagal menghapus data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block modal-veil" style={{ zIndex: 1060 }} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-panel modal-panel-danger">
          <div className="modal-header px-4 py-4 align-items-start">
            <div>
              <span className="eyebrow mb-2">Konfirmasi</span>
              <h5 className="modal-title modal-title-serif">Permintaan Hapus Permanen</h5>
            </div>
            <button type="button" className="close-text ms-3" onClick={onClose}>
              Tutup
            </button>
          </div>

          <form onSubmit={handleDelete}>
            <div className="modal-body p-4">
              <p className="small text-muted mb-4">
                Anda akan menghapus <strong className="text-body">{itemType}: {item.title}</strong> secara permanen. Tindakan ini akan dicatat ke dalam Log Admin.
              </p>

              <div className="mb-3">
                <label className="form-label">Nama Anda / Peminta Hapus</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Budi Santoso (NIM 12345)"
                  required
                  value={deletedBy}
                  onChange={(e) => setDeletedBy(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Alasan Penghapusan</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Jelaskan alasan menghapus tugas/materi ini (misal: Salah unggah file revisi)..."
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-2">
                <label className="form-label" style={{ color: 'var(--ember-soft)' }}>
                  Ketik "HAPUS" untuk konfirmasi
                </label>
                <input
                  type="text"
                  className="form-control form-danger"
                  placeholder="HAPUS"
                  required
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer px-4 py-3">
              <button type="button" className="btn btn-mist" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-ember" disabled={loading}>
                {loading ? 'Menghapus...' : 'Hapus Permanen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
