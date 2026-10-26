import useApp from '../hooks/useApp';

const ICONS = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };

// Shows pop-up messages in the bottom-right corner
export default function ToastContainer() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{ICONS[t.type]} {t.message}</span>
          <button onClick={() => removeToast(t.id)} aria-label="Close message">×</button>
        </div>
      ))}
    </div>
  );
}
