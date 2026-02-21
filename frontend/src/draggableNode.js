// draggableNode.js
export const DraggableNode = ({ type, label, color = '#1C2536', icon }) => {
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
        height: '36px',
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '8px',
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color: color,
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.3px',
        transition: 'all 0.18s ease',
        userSelect: 'none',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}30`;
        e.currentTarget.style.borderColor = `${color}80`;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = `0 4px 16px ${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${color}18`;
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
      }}
    >
      {icon && <span style={{ fontSize: '11px', opacity: 0.9 }}>{icon}</span>}
      {label}
    </div>
  );
};