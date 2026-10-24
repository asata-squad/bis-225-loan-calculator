import { LoanCalculator } from "@/widgets/loan-calculator/ui/LoanCalculator";

export function CalculatorPage() {
  return (
    <div className="min-h-screen">
      {/* Шапка в стиле Т-Банка */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-base font-black text-black">
            Ф
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            фин<span className="text-brand">.кредит</span>
          </span>
          <span className="ml-auto text-sm font-medium text-slate-600">
            Кредитный калькулятор
          </span>
        </div>
      </header>

      {/* Hero-зона со светлой фиолетовой подложкой */}
      <section className="bg-brand-tint px-4 pb-16 pt-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-900">
            Рассчитайте кредит
          </h1>
          <p className="text-lg text-slate-600">
            Выберите параметры — платёж посчитается автоматически
          </p>
        </div>
      </section>

      {/* Калькулятор «выезжает» из hero */}
      <main className="mx-auto -mt-10 max-w-5xl px-4 pb-10">
        <LoanCalculator />
        <p className="mt-8 text-center text-xs text-slate-500">
          Расчёт является предварительным и не является кредитным предложением.
        </p>
      </main>
    </div>
  );
}
