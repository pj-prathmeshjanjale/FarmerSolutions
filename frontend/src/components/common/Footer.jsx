export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-slate-500">
        © {new Date().getFullYear()} Farmer One-Stop Solution
      </div>
    </footer>
  );
}
