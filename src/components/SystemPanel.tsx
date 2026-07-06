import React from 'react';

interface SystemPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  children?: React.ReactNode;
}

export const SystemPanel: React.FC<SystemPanelProps> = ({
  glow = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-panel border border-accent/25 rounded-lg transition-all duration-300 ${
        glow ? 'system-panel-glow' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default SystemPanel;
