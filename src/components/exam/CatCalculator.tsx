import React, { useState } from 'react';
import { X, Delete, Minimize2 } from 'lucide-react';

interface CatCalculatorProps {
  onClose: () => void;
}

export const CatCalculator: React.FC<CatCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState<string>('0');
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operator === '+') newValue = currentValue + inputValue;
      else if (operator === '-') newValue = currentValue - inputValue;
      else if (operator === '*') newValue = currentValue * inputValue;
      else if (operator === '/') newValue = inputValue !== 0 ? currentValue / inputValue : 0;

      setPrevValue(newValue);
      setDisplay(String(Math.round(newValue * 100000000) / 100000000));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator === '=' ? null : nextOperator);
  };

  const calculateSpecial = (type: 'sqrt' | 'reciprocal' | 'negate' | 'percent') => {
    const val = parseFloat(display);
    if (type === 'sqrt') {
      if (val >= 0) setDisplay(String(Math.sqrt(val)));
      else setDisplay('Error');
    } else if (type === 'reciprocal') {
      if (val !== 0) setDisplay(String(1 / val));
      else setDisplay('Error');
    } else if (type === 'negate') {
      setDisplay(String(-val));
    } else if (type === 'percent') {
      setDisplay(String(val / 100));
    }
    setWaitingForOperand(true);
  };

  // Memory functions
  const handleMemory = (action: 'MC' | 'MR' | 'MS' | 'M+' | 'M-') => {
    const val = parseFloat(display);
    if (action === 'MC') {
      setMemory(0);
      setHasMemory(false);
    } else if (action === 'MR') {
      setDisplay(String(memory));
      setWaitingForOperand(true);
    } else if (action === 'MS') {
      setMemory(val);
      setHasMemory(true);
      setWaitingForOperand(true);
    } else if (action === 'M+') {
      setMemory(memory + val);
      setHasMemory(true);
      setWaitingForOperand(true);
    } else if (action === 'M-') {
      setMemory(memory - val);
      setHasMemory(true);
      setWaitingForOperand(true);
    }
  };

  return (
    <div
      id="cat-calculator-modal"
      className="fixed bottom-6 right-6 z-50 w-72 bg-white border border-slate-300 shadow-xl rounded-xl overflow-hidden font-mono select-none transition-all"
    >
      {/* Header */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          CAT Scientific Calculator
        </div>
        <div className="flex items-center gap-1">
          {hasMemory && (
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.5 text-[10px] rounded font-bold">
              M
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Close Calculator"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen */}
      <div className="p-3 bg-slate-900 text-white">
        <div className="text-right text-[10px] text-slate-400 h-4 truncate">
          {prevValue !== null ? `${prevValue} ${operator || ''}` : ''}
        </div>
        <div className="text-right text-2xl font-bold text-white tracking-wider overflow-x-auto py-1 whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Keys Grid */}
      <div className="p-2 bg-slate-50 grid grid-cols-5 gap-1 text-xs">
        {/* Row 1: Memory */}
        <button
          onClick={() => handleMemory('MC')}
          className="bg-white hover:bg-slate-100 text-amber-700 border border-slate-200 p-1.5 rounded font-semibold text-center cursor-pointer shadow-2xs"
        >
          MC
        </button>
        <button
          onClick={() => handleMemory('MR')}
          className="bg-white hover:bg-slate-100 text-amber-700 border border-slate-200 p-1.5 rounded font-semibold text-center cursor-pointer shadow-2xs"
        >
          MR
        </button>
        <button
          onClick={() => handleMemory('MS')}
          className="bg-white hover:bg-slate-100 text-amber-700 border border-slate-200 p-1.5 rounded font-semibold text-center cursor-pointer shadow-2xs"
        >
          MS
        </button>
        <button
          onClick={() => handleMemory('M+')}
          className="bg-white hover:bg-slate-100 text-amber-700 border border-slate-200 p-1.5 rounded font-semibold text-center cursor-pointer shadow-2xs"
        >
          M+
        </button>
        <button
          onClick={() => handleMemory('M-')}
          className="bg-white hover:bg-slate-100 text-amber-700 border border-slate-200 p-1.5 rounded font-semibold text-center cursor-pointer shadow-2xs"
        >
          M-
        </button>

        {/* Row 2: Ops */}
        <button
          onClick={backspace}
          className="bg-white hover:bg-slate-100 text-rose-600 border border-slate-200 p-1.5 rounded flex items-center justify-center cursor-pointer shadow-2xs"
          title="Backspace"
        >
          <Delete className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={clearAll}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-1.5 rounded font-bold cursor-pointer shadow-2xs"
        >
          C
        </button>
        <button
          onClick={() => calculateSpecial('negate')}
          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 p-1.5 rounded cursor-pointer shadow-2xs"
        >
          ±
        </button>
        <button
          onClick={() => calculateSpecial('sqrt')}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-1.5 rounded cursor-pointer shadow-2xs"
        >
          √
        </button>
        <button
          onClick={() => performOperation('/')}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-1.5 rounded font-bold cursor-pointer shadow-2xs"
        >
          ÷
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputDigit('7')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          7
        </button>
        <button
          onClick={() => inputDigit('8')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          8
        </button>
        <button
          onClick={() => inputDigit('9')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          9
        </button>
        <button
          onClick={() => calculateSpecial('percent')}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-1.5 rounded cursor-pointer shadow-2xs"
        >
          %
        </button>
        <button
          onClick={() => performOperation('*')}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-1.5 rounded font-bold cursor-pointer shadow-2xs"
        >
          ×
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputDigit('4')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          4
        </button>
        <button
          onClick={() => inputDigit('5')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          5
        </button>
        <button
          onClick={() => inputDigit('6')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          6
        </button>
        <button
          onClick={() => calculateSpecial('reciprocal')}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-1.5 rounded text-[10px] cursor-pointer shadow-2xs"
        >
          1/x
        </button>
        <button
          onClick={() => performOperation('-')}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-1.5 rounded font-bold cursor-pointer shadow-2xs"
        >
          −
        </button>

        {/* Row 5 */}
        <button
          onClick={() => inputDigit('1')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          1
        </button>
        <button
          onClick={() => inputDigit('2')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          2
        </button>
        <button
          onClick={() => inputDigit('3')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          3
        </button>
        <button
          onClick={() => performOperation('+')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded font-bold row-span-2 col-span-2 flex items-center justify-center text-base cursor-pointer shadow-xs"
        >
          +
        </button>

        {/* Row 6 */}
        <button
          onClick={() => inputDigit('0')}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold col-span-2 cursor-pointer shadow-2xs"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 p-2 rounded font-bold cursor-pointer shadow-2xs"
        >
          .
        </button>
        <button
          onClick={() => performOperation('=')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded font-bold col-span-2 flex items-center justify-center shadow-xs cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
};
