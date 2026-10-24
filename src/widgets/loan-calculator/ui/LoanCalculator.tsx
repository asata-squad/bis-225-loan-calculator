import { useMemo, useState } from "react";
import { LoanTypeChips } from "@/features/loan-type-select/ui/LoanTypeChips";
import { AmountSlider } from "@/features/loan-amount/ui/AmountSlider";
import { TermSlider } from "@/features/loan-term/ui/TermSlider";
import { SubmitButton } from "@/features/submit-application/ui/SubmitButton";
import { useLoanCalculatorPush } from "@/features/loan-application/model/useLoanCalculatorPush";
import { loanApplicationSchema, type LoanApplication } from "@/entities/applicant";
import { calculateLoan, isIncomeSufficient } from "@/entities/loan";
import { LOAN_PRODUCTS, type LoanTypeId } from "@/shared/config/loanProducts";
import { formatCurrency, formatNumber, parseFormattedNumber } from "@/shared/lib/format";

interface FormDraft {
  loanType: LoanTypeId;
  amount: number;
  termMonths: number;
  fullName: string;
  monthlyIncome: number;
  hasCitizenship: boolean;
  consentGiven: boolean;
}

const INITIAL_DRAFT: FormDraft = {
  loanType: "mortgage",
  amount: 5_000_000,
  termMonths: 120,
  fullName: "",
  monthlyIncome: 0,
  hasCitizenship: false,
  consentGiven: false,
};

export function LoanCalculator() {
  const [draft, setDraft] = useState<FormDraft>(INITIAL_DRAFT);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const product = LOAN_PRODUCTS[draft.loanType];

  const result = useMemo(
    () =>
      calculateLoan({
        loanType: draft.loanType,
        amount: clamp(draft.amount, product.minAmount, product.maxAmount),
        termMonths: clamp(draft.termMonths, product.minTermMonths, product.maxTermMonths),
        annualRate: product.annualRate,
      }),
    [draft.loanType, draft.amount, draft.termMonths, product],
  );

  const validation = loanApplicationSchema.safeParse(draft);
  const isValid = validation.success;

  const errors = useMemo(() => {
    const map: Partial<Record<keyof LoanApplication, string>> = {};
    if (validation.success) return map;
    for (const issue of validation.error.issues) {
      const key = issue.path[0] as keyof LoanApplication;
      if (!map[key]) map[key] = issue.message;
    }
    return map;
  }, [validation]);

  const showError = (field: keyof LoanApplication) =>
    touched[field] ? errors[field] : undefined;

  const incomeSufficient = isIncomeSufficient(draft.monthlyIncome, result.monthlyPayment);

  const setField = <K extends keyof FormDraft>(field: K, value: FormDraft[K]) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const { push, status: pushStatus, error: pushError, reset: resetPush } = useLoanCalculatorPush();

  const handleSubmit = () => {
    if (!isValid || pushStatus === "submitting") return;
    const app = validation.success ? validation.data : null;
    if (!app) return;
    void push(app);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form
        className="space-y-6 rounded-2xl bg-white p-6 shadow-xl shadow-purple-950/20 ring-1 ring-slate-200"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
            ФИО
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={draft.fullName}
            onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="Иванов Иван Иванович"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          {showError("fullName") && (
            <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
          )}
        </div>

        <AmountSlider
          value={draft.amount}
          min={product.minAmount}
          max={product.maxAmount}
          error={showError("amount")}
          onChange={(amount) => {
            setTouched((t) => ({ ...t, amount: true }));
            setField("amount", amount);
          }}
        />

        <TermSlider
          value={draft.termMonths}
          min={product.minTermMonths}
          max={product.maxTermMonths}
          error={showError("termMonths")}
          onChange={(termMonths) => {
            setTouched((t) => ({ ...t, termMonths: true }));
            setField("termMonths", termMonths);
          }}
        />

        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-700">Тип кредита</h2>
          <LoanTypeChips
            value={draft.loanType}
            onChange={(loanType) => {
              const p = LOAN_PRODUCTS[loanType];
              setDraft((prev) => ({
                ...prev,
                loanType,
                amount: clamp(prev.amount, p.minAmount, p.maxAmount),
                termMonths: clamp(prev.termMonths, p.minTermMonths, p.maxTermMonths),
              }));
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="income" className="mb-1 block text-sm font-medium text-slate-700">
              Ежемесячный доход, ₽
            </label>
            <input
              id="income"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={draft.monthlyIncome === 0 ? "" : formatNumber(draft.monthlyIncome)}
              onBlur={() => setTouched((t) => ({ ...t, monthlyIncome: true }))}
              onChange={(e) => {
                const parsed = parseFormattedNumber(e.target.value);
                setField("monthlyIncome", Number.isNaN(parsed) ? 0 : parsed);
              }}
              placeholder="100 000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right focus:border-brand focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            {showError("monthlyIncome") && (
              <p className="mt-1 text-xs text-red-600">{errors.monthlyIncome}</p>
            )}
            {touched.monthlyIncome && draft.monthlyIncome > 0 && !incomeSufficient && (
              <p className="mt-1 text-xs text-amber-600">
                Доход недостаточен: нужно не менее {formatCurrency(result.requiredIncome)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.hasCitizenship}
              onChange={(e) => setField("hasCitizenship", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-purple-800"
            />
            <span>
              Я являюсь гражданином РФ
              {showError("hasCitizenship") && (
                <span className="block text-xs text-red-600">{errors.hasCitizenship}</span>
              )}
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.consentGiven}
              onChange={(e) => setField("consentGiven", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-purple-800"
            />
            <span>
              Я даю согласие на обработку персональных данных в соответствии с{" "}
              <a
                href="/privacy-policy.pdf"
                className="text-purple-700 underline hover:text-purple-900"
                target="_blank"
                rel="noreferrer noopener"
              >
                политикой конфиденциальности
              </a>{" "}
              (152-ФЗ)
              {showError("consentGiven") && (
                <span className="block text-xs text-red-600">{errors.consentGiven}</span>
              )}
            </span>
          </label>
        </div>
      </form>

      <aside className="h-fit space-y-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-purple-200">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Расчёт по продукту «{product.title}»
        </h2>

        <div className="rounded-xl bg-brand-tint p-4">
          <p className="text-sm text-slate-600">Ежемесячный платёж</p>
          <p className="text-4xl font-extrabold tracking-tight text-slate-900" data-testid="monthly-payment">
            {formatCurrency(result.monthlyPayment)}
          </p>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Количество платежей</dt>
            <dd className="font-semibold text-slate-900">{formatNumber(result.paymentsCount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Ставка</dt>
            <dd className="font-semibold text-slate-900">
              {(product.annualRate * 100).toLocaleString("ru-RU")}%
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Требуемая зарплата</dt>
            <dd className="font-semibold text-slate-900" data-testid="required-income">
              от {formatCurrency(result.requiredIncome)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Общая сумма выплат</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(result.totalRepaid)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Переплата</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(result.totalInterest)}</dd>
          </div>
        </dl>

        <SubmitButton
          disabled={!isValid || pushStatus === "submitting"}
          onClick={handleSubmit}
        />
        {!isValid && (
          <p className="text-center text-xs text-slate-500">
            Заполните все поля и подтвердите согласия, чтобы отправить заявку
          </p>
        )}
        {pushStatus === "submitting" && (
          <p className="text-center text-xs text-slate-500" data-testid="push-status">
            Отправляем заявку…
          </p>
        )}
        {pushStatus === "success" && (
          <div className="rounded-lg bg-emerald-100 p-3 text-center text-sm text-emerald-800" data-testid="push-status">
            Заявка на «{product.title}» принята. Мы свяжемся с вами после рассмотрения.
          </div>
        )}
        {pushStatus === "error" && (
          <div className="rounded-lg bg-red-100 p-3 text-center text-sm text-red-800" data-testid="push-status">
            {pushError}
            <button type="button" onClick={resetPush} className="ml-2 underline">
              Повторить
            </button>
          </div>
        )}
      </aside>
    </section>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
