<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Заявки — админка</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 24px; color: #1e293b; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
  th { background: #f8fafc; }
  .num { text-align: right; white-space: nowrap; }
  .filters { margin-bottom: 12px; }
  form { display: inline-flex; gap: 4px; }
  select, button { font: inherit; }
</style>
</head>
<body>
<h1>Заявки на кредиты ({{ $applications->count() }})</h1>
<p class="filters">
    <a href="/admin"@if($status === null) style="font-weight:bold"@endif>Все</a>
    @foreach ($statuses as $s)
        · <a href="/admin?status={{ $s }}"@if($status === $s) style="font-weight:bold"@endif>{{ $statusLabels[$s] }}</a>
    @endforeach
</p>
<table>
  <thead><tr>
    <th>Создана</th><th>Продукт</th><th>ФИО</th><th>Сумма</th>
    <th>Срок, мес</th><th>Платёж</th><th>Доход</th><th>Статус</th>
  </tr></thead>
  <tbody>
    @forelse ($applications as $app)
      <tr>
        <td>{{ $app->created_at->format('d.m.Y H:i') }}</td>
        <td>{{ $productTitles[$app->loan_type] ?? $app->loan_type }}</td>
        <td>{{ $app->full_name }}</td>
        <td class="num">{{ number_format($app->amount, 0, ',', ' ') }} ₽</td>
        <td class="num">{{ $app->term_months }}</td>
        <td class="num">{{ number_format($app->monthly_payment, 0, ',', ' ') }} ₽</td>
        <td class="num">{{ number_format($app->monthly_income, 0, ',', ' ') }} ₽</td>
        <td>
          <form method="post" action="/admin/{{ $app->id }}/status">
            @csrf
            <select name="status">
              @foreach ($statuses as $s)
                <option value="{{ $s }}" @if($app->status === $s) selected @endif>{{ $statusLabels[$s] }}</option>
              @endforeach
            </select>
            <button type="submit">OK</button>
          </form>
        </td>
      </tr>
    @empty
      <tr><td colspan="8">Заявок пока нет</td></tr>
    @endforelse
  </tbody>
</table>
</body>
</html>
