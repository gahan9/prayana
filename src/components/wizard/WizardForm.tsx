"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type {
  WizardInput,
  InterestCategory,
  TransportMode,
  ItineraryItem,
  BudgetBreakdown,
} from "@/types";

const INTEREST_OPTIONS: { value: InterestCategory; label: string }[] = [
  { value: "food", label: "Food & Restaurants" },
  { value: "culture", label: "Culture & Heritage" },
  { value: "thrill", label: "Adventure & Thrill" },
  { value: "shopping", label: "Shopping" },
  { value: "souvenirs", label: "Souvenirs" },
  { value: "memory", label: "Memory Spots" },
  { value: "nature", label: "Nature" },
  { value: "nightlife", label: "Nightlife" },
];

const TRANSPORT_OPTIONS: { value: TransportMode; label: string }[] = [
  { value: "flight", label: "Flight" },
  { value: "train", label: "Train" },
  { value: "bus", label: "Bus" },
  { value: "car", label: "Car" },
  { value: "walk", label: "Walking" },
];

interface WizardFormProps {
  onSubmit: (input: WizardInput) => void;
  loading?: boolean;
  result?: {
    itinerary: Partial<ItineraryItem>[];
    budget: BudgetBreakdown;
  } | null;
}

export function WizardForm({ onSubmit, loading, result }: WizardFormProps) {
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [flexibility, setFlexibility] = useState<"strict" | "moderate" | "flexible">("moderate");
  const [travelers, setTravelers] = useState("2");
  const [interests, setInterests] = useState<InterestCategory[]>(["food", "culture"]);
  const [transport, setTransport] = useState<TransportMode[]>(["car"]);

  function toggleInterest(cat: InterestCategory) {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function toggleTransport(mode: TransportMode) {
    setTransport((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: WizardInput = {
      destinations: [destination],
      dateRange: { start: startDate, end: endDate },
      budget: { amount: Number(budgetAmount) || 15000, currency, flexibility },
      travelers: Number(travelers) || 2,
      interests,
      transportPreference: transport,
    };
    onSubmit(input);
  }

  const steps = [
    // Step 0: Destination & dates
    <div key="step0" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Where & When</h3>
      <Input
        label="Destination"
        placeholder="e.g., Jaipur, Rajasthan"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setStep(1)} disabled={!destination || !startDate || !endDate}>
          Next
        </Button>
      </div>
    </div>,

    // Step 1: Budget & travelers
    <div key="step1" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Budget & Group</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Budget"
          type="number"
          placeholder="15000"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Budget Flexibility</label>
        <div className="flex gap-2">
          {(["strict", "moderate", "flexible"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFlexibility(f)}
              aria-pressed={flexibility === f}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                flexibility === f
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Number of Travelers"
        type="number"
        min="1"
        max="20"
        value={travelers}
        onChange={(e) => setTravelers(e.target.value)}
      />
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
        <Button onClick={() => setStep(2)}>Next</Button>
      </div>
    </div>,

    // Step 2: Interests & transport
    <div key="step2" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Interests & Transport</h3>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">What interests you?</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleInterest(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                interests.includes(opt.value)
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Preferred transport</p>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleTransport(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                transport.includes(opt.value)
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Itinerary"}
        </Button>
      </div>
    </div>,
  ];

  if (result) {
    const grouped = new Map<number, Partial<ItineraryItem>[]>();
    for (const item of result.itinerary) {
      const day = item.day ?? 1;
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day)!.push(item);
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Itinerary</h3>
          <Button variant="ghost" onClick={() => setStep(0)}>
            Modify
          </Button>
        </div>
        {Array.from(grouped.entries())
          .sort(([a], [b]) => a - b)
          .map(([day, items]) => (
            <div key={day}>
              <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wide mb-3">
                Day {day}
              </h4>
              <div className="space-y-3">
                {items
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.locationName}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className="inline-block rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-xs font-medium">
                            {item.category}
                          </span>
                          {item.cost != null && (
                            <p className="text-xs text-gray-500 mt-1">
                              {result.budget.currency} {item.cost}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <h4 className="text-sm font-bold text-brand-700 mb-2">Budget Summary</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {Object.entries(result.budget.categories).map(([cat, val]) => (
              <div key={cat}>
                <p className="text-gray-500 capitalize">{cat}</p>
                <p className="font-medium">
                  {result.budget.currency} {val.planned}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm font-semibold text-brand-700 mt-3">
            Total: {result.budget.currency} {result.budget.totalBudget}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={2} aria-valuenow={step}>
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-brand-600" : "bg-gray-200"
              }`}
              aria-current={s === step ? "step" : undefined}
            />
          ))}
        </div>
      </div>
      {steps[step]}
    </form>
  );
}
