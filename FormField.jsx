// Label + input + validation message, used in every form.
// Shows  ✗ error message  OR  ✓ Looks good  once the field is valid.
export default function FormField({ label, error, isValid, children, hint }) {
  return (
    <div className={`field ${error ? 'has-error' : isValid ? 'is-valid' : ''}`}>
      <label>{label}</label>
      {children}
      {error ? <small className="msg-error">✗ {error.message}</small>
        : isValid ? <small className="msg-ok">✓ Looks good</small>
        : hint ? <small className="muted">{hint}</small> : null}
    </div>
  );
}
