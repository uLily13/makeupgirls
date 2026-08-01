export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — makeupgirls",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white text-foreground">{children}</div>;
}
