"use client";

import type { BudgetBreakdown, BudgetCategory } from "@/types";

interface BudgetCardProps {
  budget: BudgetBreakdown;
}

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  accommodation: "bg-blue-400",
  food: "bg-orange-400",
  transport: "bg-green-400",
  activities: "bg-purple-400",
  shopping: "bg-pink-400",
  contingency: "bg-gray-400",
};

export function BudgetCard({ budget }: BudgetCardProps) {
  const totalPlanned = Object.values(budget.categories).reduce(
    (sum, c) => sum + c.planned,
    0,
  );
  const totalActual = Object.values(budget.categories).reduce(
    (sum, c) => sum + c.actual,
    0,
  );
  const remaining = budget.totalBudget - totalActual;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Budget</h3>
        <span className="text-sm text-gray-500">
          {budget.currency} {budget.dailyAverage.toLocaleString()}/day
        </span>
      </div>

      <div className="flex gap-0.5 h-3 rounded-full overflow-hidden mb-4">
        {(Object.entries(budget.categories) as [BudgetCategory, { planned: number }][]).map(
          ([cat, val]) => {
            const pct = totalPlanned > 0 ? (val.planned / totalPlanned) * 100 : 0;
            return (
              <div
                key={cat}
                className={`${CATEGORY_COLORS[cat]} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${cat}: ${budget.currency} ${val.planned.toLocaleString()}`}
              />
            );
          },
        )}
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-3 text-sm">
        {(Object.entries(budget.categories) as [BudgetCategory, { planned: number; actual: number }][]).map(
          ([cat, val]) => (
            <div key={cat} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat]}`} />
              <div>
                <p className="text-gray-500 capitalize text-xs">{cat}</p>
                <p className="font-medium text-gray-800">
                  {budget.currency} {val.planned.toLocaleString()}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
        <div>
          <p className="text-gray-500">Total Budget</p>
          <p className="font-bold text-gray-900">
            {budget.currency} {budget.totalBudget.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Spent</p>
          <p className="font-bold text-gray-900">
            {budget.currency} {totalActual.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Remaining</p>
          <p className={`font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
            {budget.currency} {remaining.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
