<?php

namespace App\Services;

/**
 * Конфигурация продуктов и аннуитетная формула.
 * Копия логики фронтенда (src/shared/config/loanProducts.ts, credit.ts) —
 * клиентам не доверяем, считаем независимо.
 */
class LoanCalculator
{
    public const PRODUCTS = [
        'mortgage' => ['title' => 'Ипотека', 'annualRate' => 0.18, 'minAmount' => 300000, 'maxAmount' => 30000000, 'minTermMonths' => 12, 'maxTermMonths' => 360],
        'auto' => ['title' => 'Автокредит', 'annualRate' => 0.235, 'minAmount' => 100000, 'maxAmount' => 5000000, 'minTermMonths' => 12, 'maxTermMonths' => 84],
        'consumer' => ['title' => 'Потребительский', 'annualRate' => 0.222, 'minAmount' => 50000, 'maxAmount' => 5000000, 'minTermMonths' => 6, 'maxTermMonths' => 84],
        'payday' => ['title' => 'Деньги до зарплаты', 'annualRate' => 0.5, 'minAmount' => 5000, 'maxAmount' => 100000, 'minTermMonths' => 1, 'maxTermMonths' => 12],
    ];

    /** Аннуитетный платёж: P = S*i*(1+i)^n / ((1+i)^n - 1) */
    public static function calculate(string $loanType, float|int $amount, int $termMonths): array
    {
        $product = self::PRODUCTS[$loanType];
        $i = $product['annualRate'] / 12;
        $factor = pow(1 + $i, $termMonths);
        $monthlyPayment = round(($amount * $i * $factor) / ($factor - 1), 2);
        $totalRepaid = round($monthlyPayment * $termMonths, 2);

        return [
            'monthlyPayment' => $monthlyPayment,
            'totalRepaid' => $totalRepaid,
            'totalInterest' => round($totalRepaid - $amount, 2),
        ];
    }
}
