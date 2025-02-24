
interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  className?: string;
}

const formatNumber = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function CurrencyDisplay({ amount, currency, className = '' }: CurrencyDisplayProps) {
  return (
    <span className={className}>
      {currency} {formatNumber(amount)}
    </span>
  );
} 