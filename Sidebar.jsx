// Dashboard sidebar. `items` = [{ key, label, icon }]
// On phones it becomes a scrollable bar at the top.
export default function Sidebar({ title, items, active, onSelect }) {
  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <button className={active === item.key ? 'active' : ''} onClick={() => onSelect(item.key)}>
              <span>{item.icon}</span> {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
