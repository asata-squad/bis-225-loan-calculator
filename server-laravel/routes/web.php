<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware('admin-auth')->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
    Route::post('/admin/{application}/status', [AdminController::class, 'updateStatus']);
});

Route::get('/', fn () => 'API работ')->name('home');
