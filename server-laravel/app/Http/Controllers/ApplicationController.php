<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Services\LoanCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    /**
     * Контракт фронтенда: 201 → запись; 400 → { error, issues: [{path, message}] }.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->rules());

        $validator->after(function ($validator) use ($request, &$data) {
            $loanType = $request->input('loanType');
            $product = LoanCalculator::PRODUCTS[$loanType] ?? null;
            if ($product === null) {
                return; // уже поймано правилом in:
            }
            $amount = $request->input('amount');
            if (is_int($amount) && ($amount < $product['minAmount'] || $amount > $product['maxAmount'])) {
                $validator->errors()->add('amount', "Сумма для «{$product['title']}»: от {$product['minAmount']} до {$product['maxAmount']} ₽");
            }
            $term = $request->input('termMonths');
            if (is_int($term) && ($term < $product['minTermMonths'] || $term > $product['maxTermMonths'])) {
                $validator->errors()->add('termMonths', "Срок для «{$product['title']}»: от {$product['minTermMonths']} до {$product['maxTermMonths']} мес");
            }
            $data = null;
        });

        if ($validator->fails()) {
            $issues = collect($validator->errors()->keys())
                ->flatMap(fn (string $field) => collect($validator->errors()->get($field))
                    ->map(fn (string $message) => ['path' => $field, 'message' => $message]))
                ->values()
                ->all();

            return response()->json(['error' => 'validation_error', 'issues' => $issues], 400);
        }

        $data = $validator->validated();

        $calc = LoanCalculator::calculate(
            $data['loanType'],
            $data['amount'],
            $data['termMonths'],
        );

        $application = Application::create([
            'loan_type' => $data['loanType'],
            'amount' => $data['amount'],
            'term_months' => $data['termMonths'],
            'monthly_income' => $data['monthlyIncome'],
            'full_name' => trim($data['fullName']),
            'monthly_payment' => $calc['monthlyPayment'],
            'total_repaid' => $calc['totalRepaid'],
            'total_interest' => $calc['totalInterest'],
        ]);

        return response()->json($application, 201);
    }

    private function rules(): array
    {
        return [
            'loanType' => 'required|in:mortgage,auto,consumer,payday',
            'amount' => 'required|integer|between:0,100000000000',
            'termMonths' => 'required|integer|min:1',
            'fullName' => ['required', 'string', 'min:2', 'max:120', 'regex:/^[А-Яа-яЁёA-Za-z\s\'\-]+$/u'],
            'monthlyIncome' => 'required|numeric|min:0.01',
            'hasCitizenship' => 'required|accepted',
            'consentGiven' => 'required|accepted',
        ];
    }
}
