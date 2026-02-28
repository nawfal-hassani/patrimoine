import { NextResponse } from "next/server";

interface SimulationParams {
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  durationYears: number;
}

interface YearlyDataPoint {
  year: number;
  pessimistic: number;
  average: number;
  optimistic: number;
  contributions: number;
}

interface MilestoneData {
  years: number;
  pessimistic: number;
  average: number;
  optimistic: number;
  totalContributions: number;
  pessimisticInterest: number;
  averageInterest: number;
  optimisticInterest: number;
}

function calculateCompoundInterest(
  pv: number,
  pmt: number,
  annualRate: number,
  years: number
): number {
  // FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
  // Using monthly compounding
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return pv + pmt * months;
  }

  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const futureValuePV = pv * compoundFactor;
  const futureValuePMT = pmt * ((compoundFactor - 1) / monthlyRate);

  return futureValuePV + futureValuePMT;
}

function generateProjection(params: SimulationParams) {
  const { initialAmount, monthlyContribution, annualRate, durationYears } = params;

  const pessimisticRate = Math.max(0, annualRate - 3);
  const optimisticRate = annualRate + 3;

  const yearlyData: YearlyDataPoint[] = [];

  // Generate data for each year
  for (let year = 0; year <= durationYears; year++) {
    const contributions = initialAmount + monthlyContribution * 12 * year;

    yearlyData.push({
      year,
      pessimistic: Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, pessimisticRate, year)
      ),
      average: Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, annualRate, year)
      ),
      optimistic: Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, optimisticRate, year)
      ),
      contributions,
    });
  }

  // Milestones at 5, 10, 20, 30 years
  const milestones: MilestoneData[] = [5, 10, 20, 30]
    .filter((y) => y <= durationYears)
    .map((years) => {
      const totalContributions = initialAmount + monthlyContribution * 12 * years;
      const pessimistic = Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, pessimisticRate, years)
      );
      const average = Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, annualRate, years)
      );
      const optimistic = Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, optimisticRate, years)
      );

      return {
        years,
        pessimistic,
        average,
        optimistic,
        totalContributions: Math.round(totalContributions),
        pessimisticInterest: pessimistic - totalContributions,
        averageInterest: average - totalContributions,
        optimisticInterest: optimistic - totalContributions,
      };
    });

  // Final values
  const totalContributions = initialAmount + monthlyContribution * 12 * durationYears;
  const finalPessimistic = Math.round(
    calculateCompoundInterest(initialAmount, monthlyContribution, pessimisticRate, durationYears)
  );
  const finalAverage = Math.round(
    calculateCompoundInterest(initialAmount, monthlyContribution, annualRate, durationYears)
  );
  const finalOptimistic = Math.round(
    calculateCompoundInterest(initialAmount, monthlyContribution, optimisticRate, durationYears)
  );

  return {
    yearlyData,
    milestones,
    summary: {
      totalContributions: Math.round(totalContributions),
      pessimistic: {
        finalValue: finalPessimistic,
        interestEarned: finalPessimistic - totalContributions,
        interestRatio:
          totalContributions > 0
            ? Math.round(((finalPessimistic - totalContributions) / totalContributions) * 10000) / 100
            : 0,
        rate: pessimisticRate,
      },
      average: {
        finalValue: finalAverage,
        interestEarned: finalAverage - totalContributions,
        interestRatio:
          totalContributions > 0
            ? Math.round(((finalAverage - totalContributions) / totalContributions) * 10000) / 100
            : 0,
        rate: annualRate,
      },
      optimistic: {
        finalValue: finalOptimistic,
        interestEarned: finalOptimistic - totalContributions,
        interestRatio:
          totalContributions > 0
            ? Math.round(((finalOptimistic - totalContributions) / totalContributions) * 10000) / 100
            : 0,
        rate: optimisticRate,
      },
    },
    params: {
      initialAmount,
      monthlyContribution,
      annualRate,
      durationYears,
      pessimisticRate,
      optimisticRate,
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { initialAmount, monthlyContribution, annualRate, durationYears } = body;

    // Validate inputs
    if (
      typeof initialAmount !== "number" ||
      typeof monthlyContribution !== "number" ||
      typeof annualRate !== "number" ||
      typeof durationYears !== "number"
    ) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (initialAmount < 0 || monthlyContribution < 0 || annualRate < 0 || durationYears < 1) {
      return NextResponse.json({ error: "Parameters must be positive" }, { status: 400 });
    }

    if (durationYears > 50) {
      return NextResponse.json({ error: "Duration cannot exceed 50 years" }, { status: 400 });
    }

    const projection = generateProjection({
      initialAmount,
      monthlyContribution,
      annualRate,
      durationYears,
    });

    return NextResponse.json(projection);
  } catch (error) {
    console.error("Error calculating simulation:", error);
    return NextResponse.json({ error: "Failed to calculate simulation" }, { status: 500 });
  }
}
