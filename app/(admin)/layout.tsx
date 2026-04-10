"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Pedras</h1>
          <p className="text-sm text-gray-400">Painel do Vendedor</p>
        </div>

        <nav className="p-6 space-y-4">
          <Link
            href="/admin/dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/pedras"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Pedras
          </Link>
          <Link
            href="/admin/links"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Links
          </Link>
          <Link
            href="/admin/orcamentos"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Orçamentos
          </Link>
          <Link
            href="/admin/configuracoes"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Configurações
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="border-t border-gray-700 pt-4 mb-4">
            <p className="text-sm text-gray-400 truncate">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
