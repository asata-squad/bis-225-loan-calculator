<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Services\LoanCalculator;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private const STATUSES = ['new', 'in_review', 'approved', 'rejected'];

    private const STATUS_LABELS = [
        'new' => 'Новая',
        'in_review' => 'На рассмотрении',
        'approved' => 'Одобрена',
        'rejected' => 'Отклонена',
    ];

    /** Список заявок с фильтром по статусу. */
    public function index(Request $request)
    {
        $status = in_array($request->query('status'), self::STATUSES, true)
            ? $request->query('status')
            : null;

        $applications = Application::query()
            ->when($status !== null, fn ($q) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->get();

        return view('admin.applications', [
            'applications' => $applications,
            'status' => $status,
            'statuses' => self::STATUSES,
            'statusLabels' => self::STATUS_LABELS,
            'productTitles' => array_map(fn ($p) => $p['title'], LoanCalculator::PRODUCTS),
        ]);
    }

    /** Смена статуса заявки (простая форма без js). */
    public function updateStatus(Request $request, Application $application)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,in_review,approved,rejected',
        ]);

        $application->update(['status' => $validated['status']]);

        return redirect('/admin');
    }
}
