import { StoreProvider } from '@/lib/store';
import "./globals.css";

export const metadata = {
  title: "HomeLedger - Quản lý chi tiêu gia đình",
  description: "Ứng dụng quản lý chi tiêu gia đình hiện đại, trực quan, hỗ trợ ngân sách và mục tiêu tiết kiệm realtime.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full">
      <body className="h-full">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

