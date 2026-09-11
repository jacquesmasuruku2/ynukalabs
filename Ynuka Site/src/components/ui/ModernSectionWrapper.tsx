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
    white: "bg-white dark:bg-background",
    gray: "bg-white dark:bg-background",
    light: "bg-white dark:bg-background",
  };

  return (
    <section className={`${backgroundClasses[background]} transition-colors duration-300 ${className}`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
        {children}
      </div>
    </section>
  );
};

export default ModernSectionWrapper;
