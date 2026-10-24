<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Новые инсталляции — создаём таблицу.
 * Если таблица уже есть (переезд с Node-сервера) — ничего не трогаем.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('applications')) {
            return;
        }

        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('loan_type');
            $table->decimal('amount', 14, 2);
            $table->integer('term_months');
            $table->decimal('monthly_income', 14, 2);
            $table->string('full_name');
            $table->decimal('monthly_payment', 14, 2);
            $table->decimal('total_repaid', 14, 2);
            $table->decimal('total_interest', 14, 2);
            $table->string('status')->default('new');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
