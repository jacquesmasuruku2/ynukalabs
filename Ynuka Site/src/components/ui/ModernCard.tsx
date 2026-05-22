import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = "", hover = true }) => {
  const baseClasses = "bg-card text-card-foreground rounded-xl border border-border shadow-sm transition-colors duration-300";
  const hoverClasses = hover ? "hover:shadow-md hover:-translate-y-1 transition-all duration-200" : "";
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return <div className={`p-6 pb-4 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return <div className={`p-6 pt-4 border-t border-border ${className}`}>{children}</div>;
};

export default Card;
