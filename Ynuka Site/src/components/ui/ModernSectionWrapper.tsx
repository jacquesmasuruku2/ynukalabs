import React from "react";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "gray" | "light";
}

const ModernSectionWrapper: React.FC<SectionWrapperProps> = ({ 
  children, 
  className = "", 
  background = "white" 
}) => {
  const backgroundClasses = {
    white: "bg-background",
    gray: "bg-secondary",
    light: "bg-muted",
  };

  return (
    <section className={`${backgroundClasses[background]} transition-colors duration-300 ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        {children}
      </div>
    </section>
  );
};

export default ModernSectionWrapper;
