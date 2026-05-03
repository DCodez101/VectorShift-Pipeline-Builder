// draggableNode.js
// draggableNode.js
export const DraggableNode = ({ type, label, color = '#6366f1', icon }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={type}
      onDragStart={(e) => onDragStart(e, type)}
      draggable
      title={label}
      style={{
        cursor: 'grab',
        height: '30px',
        padding: '0 11px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: '8px',
        background: `${color}14`,
        border: `1px solid ${color}35`,
        color: color,
        fontSize: '11px',
        fontWeight: '600',
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.2px',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}28`;
        e.currentTarget.style.borderColor = `${color}65`;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = `0 4px 14px ${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${color}14`;
        e.currentTarget.style.borderColor = `${color}35`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {icon && <span style={{ fontSize: '11px', opacity: 0.75 }}>{icon}</span>}
      {label}
    </div>
  );
};