<?php

use App\Http\Controllers\ApplicationController;
use Illuminate\Support\Facades\Route;

// Контракт фронтенда (без /api префикса — vite proxy режет /api):
Route::post('/applications', [ApplicationController::class, 'store']);
Route::get('/health', fn () => response()->json(['ok' => true]));
