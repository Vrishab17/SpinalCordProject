import "../styles/globals.css";

export const metadata = {
  title: "Spinal Cord Assessment",
  description: "Spinal Cord Injury Assessment System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}