interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  gradient?: boolean;
}

const SectionHeading = ({ title, subtitle, gradient = true }: SectionHeadingProps) => (
  <div className="text-center mb-12">
    <h2 className={`font-display text-3xl md:text-4xl font-bold mb-4 ${gradient ? "gradient-text" : ""}`}>
      {title}
    </h2>
    {subtitle && (
      <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
    )}
  </div>
);

export default SectionHeading;
