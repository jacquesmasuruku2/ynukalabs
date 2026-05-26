import logo from "@/assets/logo.jpg";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Ynuka Labs"
      className={`${className} rounded-full object-cover`}
    />
  );
}
