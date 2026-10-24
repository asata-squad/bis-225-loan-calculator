interface SubmitButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function SubmitButton({ disabled, onClick }: SubmitButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-14 w-full rounded-xl bg-yellow-400 px-6 text-lg font-bold text-black shadow-sm transition-colors hover:bg-yellow-300 active:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
    >
      Оставить заявку
    </button>
  );
}
