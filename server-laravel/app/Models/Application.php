<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $table = 'applications';

    protected $fillable = [
        'loan_type',
        'amount',
        'term_months',
        'monthly_income',
        'full_name',
        'monthly_payment',
        'total_repaid',
        'total_interest',
        'status',
    ];

    protected $casts = [
        'amount' => 'float',
        'monthly_income' => 'float',
        'monthly_payment' => 'float',
        'total_repaid' => 'float',
        'total_interest' => 'float',
        'term_months' => 'integer',
        'created_at' => 'datetime',
    ];
}
