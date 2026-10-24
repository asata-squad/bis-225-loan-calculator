<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminAuth
{
    /**
     * Basic-аутентификация для /admin (timing-safe сравнение).
     */
    public function handle(Request $request, Closure $next)
    {
        $expected = 'Basic ' . base64_encode(
            (config('admin.user') ?: env('ADMIN_USER', 'admin')) . ':' .
            (config('admin.password') ?: env('ADMIN_PASSWORD', 'admin'))
        );

        $header = (string) $request->header('Authorization', '');

        if (!hash_equals($expected, $header)) {
            return response('Требуется авторизация', 401)
                ->header('WWW-Authenticate', 'Basic realm="admin"');
        }

        return $next($request);
    }
}
