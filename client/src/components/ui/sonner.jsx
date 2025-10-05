import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "#5d5d5fff",
          "--normal-border": "var(--border)",
        }
      }
      {...props} />
  );
}

export { Toaster }
