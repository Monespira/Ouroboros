import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--accent)]">Erro 404</p>
        <h1 className="mt-2 text-3xl font-black">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted">O endereço informado não existe no Ouroboros.</p>
        <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-bold text-white">Voltar ao início</Link>
      </div>
    </main>
  );
}
