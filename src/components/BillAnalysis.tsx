import { forwardRef, useState } from 'react';
import type { BillAnalysisResponse } from '../services/api';
import CurrencyDisplay from './CurrencyDisplay';

interface BillAnalysisProps {
  analysis: BillAnalysisResponse;
  imagePreview: string | null;
  onReset: () => void;
  onSaveImage: () => void;
}

const BillAnalysis = forwardRef<HTMLDivElement, BillAnalysisProps>(
  ({ analysis, imagePreview, onReset, onSaveImage }, ref) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="btn-primary text-sm md:text-base"
          >
            Process Another Bill
          </button>
        </div>

        <div ref={ref} data-analysis="true" className="space-y-4">
          <div className="card bg-yellow-900/20 border border-yellow-600/30">
            <div className="flex items-start space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-base md:text-lg font-medium text-yellow-500">AI Analysis Disclaimer</h3>
                <p className="text-xs md:text-sm text-gray-300 mt-1">
                  AI can make mistakes in analysis. Please double-check the calculations with the original receipt to ensure accurate cost distribution.
                </p>
              </div>
            </div>
          </div>

          {imagePreview && (
            <div className="card">
              <h2 className="text-base md:text-lg font-semibold mb-4">Original Bill Image</h2>
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Original bill"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          <BillSummary analysis={analysis} />
          <PersonShares analysis={analysis} />
        </div>

        <div className="flex justify-center mt-8 pb-8">
          <button
            onClick={onSaveImage}
            className="btn btn-primary flex items-center space-x-2 text-sm md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Save Analysis as Image</span>
          </button>
        </div>
      </div>
    );
  }
);

BillAnalysis.displayName = 'BillAnalysis';

function BillSummary({ analysis }: { analysis: BillAnalysisResponse }) {
  return (
    <div className="card">
      <h2 className="text-base md:text-lg font-semibold mb-6">Bill Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Bill"
          amount={analysis.total_bill}
          currency={analysis.currency}
        />
        <SummaryCard
          title="Subtotal"
          amount={analysis.subtotal}
          currency={analysis.currency}
        />
        <SummaryCard
          title="VAT"
          amount={analysis.subtotal_vat}
          currency={analysis.currency}
        />
        <SummaryCard
          title="Other Charges"
          amount={analysis.subtotal_other}
          currency={analysis.currency}
        />
        <SummaryCard
          title="Discounts"
          amount={analysis.subtotal_discount}
          currency={analysis.currency}
        />
      </div>
    </div>
  );
}

function SummaryCard({ title, amount, currency }: { title: string; amount: number; currency: string }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3 md:p-4">
      <p className="text-xs md:text-sm text-gray-400 mb-1">{title}</p>
      <div className="space-y-1">
        <p className="text-xs md:text-sm text-gray-300">{currency || 'IDR'}</p>
        <CurrencyDisplay 
          amount={amount}
          currency=""
          className="text-lg md:text-2xl font-bold text-white"
        />
      </div>
    </div>
  );
}

function PersonShares({ analysis }: { analysis: BillAnalysisResponse }) {
  const [expandedPersons, setExpandedPersons] = useState<Set<string>>(new Set());
  const allPersons = Object.keys(analysis.split_details);
  const isAllExpanded = expandedPersons.size === allPersons.length;

  const toggleExpand = (person: string) => {
    setExpandedPersons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(person)) {
        newSet.delete(person);
      } else {
        newSet.add(person);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedPersons(new Set());
    } else {
      setExpandedPersons(new Set(allPersons));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={toggleAll}
          className="text-sm text-gray-400 hover:text-white flex items-center space-x-1"
        >
          <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
          <div className={`transition-transform duration-200 ${
            isAllExpanded ? 'rotate-180' : ''
          }`}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>

      {Object.entries(analysis.split_details).map(([person, details]) => (
        <div key={person} className="card">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpand(person)}
          >
            <div className="flex items-center space-x-2">
              <h3 className="text-base md:text-lg font-semibold">{person}'s Share</h3>
              <div className={`transition-transform duration-200 ${
                expandedPersons.has(person) ? 'rotate-180' : ''
              }`}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-gray-400">Total:</span>
              <CurrencyDisplay 
                amount={details.final_total}
                currency={analysis.currency}
                className="text-sm md:text-base font-bold text-primary-400"
              />
            </div>
          </div>

          {expandedPersons.has(person) && (
            <div className="mt-4 space-y-4">
              <div className="bg-gray-900 rounded-lg p-3 md:p-4">
                <div className="flex justify-between text-xs md:text-sm font-medium text-gray-400 mb-2">
                  <h4>Items</h4>
                  <h4>Price</h4>
                </div>
                <ul className="space-y-1 md:space-y-2">
                  {details.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-xs md:text-sm">
                      <span className="mr-4">{item.item}</span>
                      <CurrencyDisplay 
                        amount={item.price}
                        currency={analysis.currency}
                        className="text-xs md:text-sm"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <ShareDetail
                  title="Items Total"
                  amount={details.individual_total}
                  currency={analysis.currency}
                />
                <ShareDetail
                  title="VAT Share"
                  amount={details.vat_share}
                  currency={analysis.currency}
                />
                <ShareDetail
                  title="Other Share"
                  amount={details.other_share}
                  currency={analysis.currency}
                />
                <ShareDetail
                  title="Discount Share"
                  amount={details.discount_share}
                  currency={analysis.currency}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShareDetail({ 
  title, 
  amount, 
  currency, 
  isFinal 
}: { 
  title: string; 
  amount: number; 
  currency: string;
  isFinal?: boolean;
}) {
  return (
    <div>
      <p className="text-xs md:text-sm text-gray-400">{title}</p>
      <CurrencyDisplay 
        amount={amount}
        currency={currency}
        className={`text-xs md:text-sm ${isFinal ? 'font-bold text-primary-400' : 'font-semibold'}`}
      />
    </div>
  );
}

export default BillAnalysis; 