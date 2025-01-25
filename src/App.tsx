import React, { useState, useEffect } from 'react';
import { Calculator, Copy, Plus, Trash2, RefreshCw } from 'lucide-react';

interface Bet {
  odds: number;
  stake: number;
}

function App() {
  const [totalStake, setTotalStake] = useState<number>(100);
  const [bets, setBets] = useState<Bet[]>([
    { odds: 0, stake: 0 },
    { odds: 0, stake: 0 },
  ]);

  const calculateDutching = () => {
    const validBets = bets.filter(bet => bet.odds > 0);
    if (validBets.length === 0) return;

    let sumInverse = validBets.reduce((sum, bet) => sum + (1 / bet.odds), 0);
    
    const newBets = bets.map(bet => {
      if (bet.odds <= 0) return { ...bet, stake: 0 };
      
      const preciseStake = totalStake / (bet.odds * sumInverse);
      const roundedStake = Math.round(preciseStake * 100) / 100;
      
      return {
        ...bet,
        stake: roundedStake
      };
    });

    const totalCalculatedStake = newBets.reduce((sum, bet) => sum + bet.stake, 0);
    const difference = totalStake - totalCalculatedStake;
    
    if (difference !== 0) {
      const lastValidBetIndex = newBets.map(bet => bet.odds > 0).lastIndexOf(true);
      if (lastValidBetIndex >= 0) {
        newBets[lastValidBetIndex].stake = +(newBets[lastValidBetIndex].stake + difference).toFixed(2);
      }
    }

    setBets(newBets);
  };

  useEffect(() => {
    calculateDutching();
  }, [totalStake, bets.map(bet => bet.odds).join(',')]);

  const formatOddsInput = (input: string): string => {
    const numbers = input.replace(/[^\d]/g, '');
    
    if (numbers.length <= 2) return numbers;
    
    return numbers.slice(0, -2) + '.' + numbers.slice(-2);
  };

  const updateBet = (index: number, inputValue: string) => {
    const formattedValue = formatOddsInput(inputValue);
    const numericValue = parseFloat(formattedValue) || 0;
    
    const newBets = [...bets];
    newBets[index] = { ...newBets[index], odds: numericValue };
    setBets(newBets);
  };

  const addNewBet = () => {
    setBets([...bets, { odds: 0, stake: 0 }]);
  };

  const removeBet = (index: number) => {
    if (bets.length <= 2) return;
    const newBets = bets.filter((_, i) => i !== index);
    setBets(newBets);
  };

  const copyToClipboard = (value: number) => {
    navigator.clipboard.writeText(value.toFixed(2));
  };

  const resetCalculator = () => {
    setBets([
      { odds: 0, stake: 0 },
      { odds: 0, stake: 0 },
    ]);
    setTotalStake(0);
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTotalStake(0);
    } else {
      setTotalStake(Number(value));
    }
  };

  const returns = bets
    .filter(bet => bet.odds > 0 && bet.stake > 0)
    .map(bet => +(bet.odds * bet.stake).toFixed(2));
  
  const totalReturn = returns.length > 0 ? returns[0] : 0;
  const profit = +(totalReturn - totalStake).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-3 sm:p-6">
      <div className="max-w-xl mx-auto bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 text-gray-100 text-sm sm:text-base">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          <h1 className="text-xl sm:text-2xl font-bold">Calculadora de Dutching</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              Investimento (R$)
            </label>
            <input
              type="number"
              value={totalStake || ''}
              onChange={handleStakeChange}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-base sm:text-lg bg-black border border-gray-800 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium">Lucro:</span>
              <span className={`text-base sm:text-lg font-semibold ${profit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                R$ {profit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium">Retorno:</span>
              <span className="text-base sm:text-lg font-semibold text-blue-500">R$ {totalReturn.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-12 gap-1 sm:gap-2 mb-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black rounded-t-lg">
            <div className="col-span-1 text-xs sm:text-sm font-medium"></div>
            <div className="col-span-3 sm:col-span-2 text-xs sm:text-sm font-medium">Odds</div>
            <div className="col-span-4 text-xs sm:text-sm font-medium">Investimento</div>
            <div className="col-span-3 sm:col-span-4 text-xs sm:text-sm font-medium">Retorno</div>
            <div className="col-span-1"></div>
          </div>

          {bets.map((bet, index) => (
            <div key={index} className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 items-center border-b border-gray-800">
              <div className="col-span-1 text-xs sm:text-sm font-medium">{index + 1}º</div>
              <div className="col-span-3 sm:col-span-2">
                <input
                  type="text"
                  value={bet.odds || ''}
                  onChange={(e) => updateBet(index, e.target.value)}
                  className="w-full px-2 py-1 bg-black border border-gray-800 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 text-sm sm:text-base"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span>R$ {bet.stake.toFixed(2)}</span>
                <button
                  onClick={() => copyToClipboard(bet.stake)}
                  className="p-0.5 sm:p-1 text-gray-500 hover:text-blue-400 hover:bg-black rounded transition-colors"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="col-span-3 sm:col-span-4 text-xs sm:text-sm">
                R$ {(bet.odds * bet.stake).toFixed(2)}
              </div>
              <div className="col-span-1">
                {bets.length > 2 && (
                  <button
                    onClick={() => removeBet(index)}
                    className="p-0.5 sm:p-1 text-red-500 hover:text-red-400 hover:bg-black rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={addNewBet}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-400 border border-blue-500 rounded-md hover:bg-black transition-colors flex items-center gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            Adicionar Linha
          </button>
          <button
            onClick={resetCalculator}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-400 border border-red-500 rounded-md hover:bg-black transition-colors flex items-center gap-1 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;