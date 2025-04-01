interface CalculationParams {
  customerType: string;
  quantity: number;
  serviceType: string;
  additionalServices: string[];
}

const BASE_RATES = {
  apartment: 2.5, // per kg
  corporate_office: 3.0,
  estate: 2.8,
};

const SERVICE_MULTIPLIERS = {
  standard: 1,
  premium: 1.25,
};

export function calculateInvoiceAmount({
  customerType,
  quantity,
  serviceType,
  additionalServices,
}: CalculationParams): number {
  // Base calculation
  const baseRate = BASE_RATES[customerType as keyof typeof BASE_RATES] || 2.5;
  const serviceMultiplier =
    SERVICE_MULTIPLIERS[serviceType as keyof typeof SERVICE_MULTIPLIERS] || 1;

  let amount = quantity * baseRate * serviceMultiplier;

  // Add costs for additional services
  additionalServices.forEach((service) => {
    switch (service) {
      case "sorting":
        amount += quantity * 0.5;
        break;
      case "special_handling":
        amount += quantity * 0.75;
        break;
      case "urgent":
        amount *= 1.3; // 30% premium
        break;
    }
  });

  // Round to 2 decimal places
  return Math.round(amount * 100) / 100;
}
