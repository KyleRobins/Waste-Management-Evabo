import { Link } from "react-router-dom";
import { usePathname } from "@/hooks/use-pathname";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col space-y-1">
      {/* ... existing navigation items ... */}

      {/* Add this new item, likely after the Payments item */}
      <Link
        href="/invoices"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          pathname === "/invoices" ? "text-primary" : "text-muted-foreground"
        )}
      >
        <FileText className="h-4 w-4" />
        Invoices
      </Link>

      {/* ... rest of navigation items ... */}
    </div>
  );
}
