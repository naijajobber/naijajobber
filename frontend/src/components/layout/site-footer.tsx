import Link from "next/link";
import Image from "next/image";

const links = {
  Product: ["Remote Jobs", "AI Matching", "Resume Builder", "Employer Tools"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Cookies"],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="" width={32} height={32} className="rounded-md" />
            <span className="font-[family-name:var(--font-display)] text-lg font-bold">
              NaijaJobber
            </span>
          </div>
          <p className="max-w-xs text-sm text-muted">
            Legitimate remote work for African talent. Verified employers worldwide.
          </p>
        </div>
        {Object.entries(links).map(([title, items]) => (
          <div key={title}>
            <h3 className="mb-3 text-sm font-semibold">{title}</h3>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} NaijaJobber. All rights reserved.
      </div>
    </footer>
  );
}
