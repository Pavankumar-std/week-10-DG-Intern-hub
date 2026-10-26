import Sidebar from './Sidebar';

// Sidebar on the left + page content on the right
export default function DashboardLayout({ title, items, active, onSelect, children }) {
  return (
    <div className="dash-layout">
      <Sidebar title={title} items={items} active={active} onSelect={onSelect} />
      <section className="dash-content">{children}</section>
    </div>
  );
}
