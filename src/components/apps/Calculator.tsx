import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const result = calculate(previousValue, parseFloat(display), operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  return (
    <div className="h-full w-full bg-background p-6 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="text-right text-4xl font-mono text-foreground break-all">
            {display}
          </div>
          {operation && previousValue !== null && (
            <div className="text-right text-sm text-muted-foreground mt-1">
              {previousValue} {operation}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-2">
          <Button 
            variant="secondary" 
            className="col-span-4 h-12 text-lg"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {buttons.map((row, i) => (
            row.map((btn) => (
              <Button
                key={btn}
                variant={['÷', '×', '-', '+', '='].includes(btn) ? 'default' : 'outline'}
                className="h-16 text-xl font-semibold"
                onClick={() => {
                  if (btn === '=') handleEquals();
                  else if (btn === '.') handleDecimal();
                  else if (['÷', '×', '-', '+'].includes(btn)) handleOperation(btn);
                  else handleNumber(btn);
                }}
              >
                {btn}
              </Button>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
