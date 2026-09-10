interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  gradient?: boolean;
}

const SectionHeading = ({ title, subtitle, gradient = true }: SectionHeadingProps) => (
  <div className="text-center mb-12">
    <h2 className={`typo-section-title font-display mb-4 ${gradient ? "gradient-text" : ""}`}>
      {title}
    </h2>
    {subtitle && (
      <p className="typo-lead mx-auto max-w-2xl text-muted-foreground">{subtitle}</p>
    )}
  </div>
);

export default SectionHeading;
