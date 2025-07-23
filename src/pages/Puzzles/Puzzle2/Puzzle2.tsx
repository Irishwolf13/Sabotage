import React, { useState, useEffect } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import '../Puzzles.css';

interface Card {
  id: number;
  number: number;
  revealed: boolean;
  matched: boolean;
}

interface ContainerProps {
  solvePuzzle: (pass:boolean) => void;
}

const Puzzle2: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const numberOfPairs = 6;

  // Reset the game state
  useIonViewWillEnter(() => { resetGameState(); });
    
  const resetGameState = (pairs: number = numberOfPairs) => {
    const newCards: Card[] = [];
    const numbers = [...Array(pairs).keys()].flatMap((n) => [n + 1, n + 1]); // Create pairs
    const shuffledNumbers = numbers.sort(() => Math.random() - 0.5); // Shuffle numbers

    shuffledNumbers.forEach((number, index) => {
      newCards.push({ id: index, number, revealed: false, matched: false });
    });

    setCards(newCards);
  };

  const handleCardClick = (cardId: number) => {
    if (isBusy) return; // Prevent interaction while processing
  
    const newCards = [...cards];
    const clickedCard = newCards[cardId];
  
    if (clickedCard.revealed || clickedCard.matched) return;
  
    clickedCard.revealed = true;
    setCards(newCards);
  
    if (selectedCardId === null) {
      setSelectedCardId(cardId);
    } else {
      const previousCard = newCards[selectedCardId];
      setIsBusy(true); // Lock interaction
  
      if (previousCard.number === clickedCard.number) {
        previousCard.matched = true;
        clickedCard.matched = true;
        setTimeout(() => {
          setSelectedCardId(null);
          setIsBusy(false); // Unlock after match check
          setCards([...newCards]);
  
          if (newCards.every((card) => card.matched)) {
            solvePuzzle(true);
          }
        }, 300);
      } else {
        setTimeout(() => {
          previousCard.revealed = false;
          clickedCard.revealed = false;
          setSelectedCardId(null);
          setIsBusy(false); // Unlock after hiding cards
          setCards([...newCards]);
        }, 700);
      }
    }
  };

  return (
    <div className='puzzle2Main'>
      <div className="card-grid">
        {cards.map((card) => (
          <div
          key={card.id}
          onClick={() => handleCardClick(card.id)}
          className={`card ${card.revealed ? 'revealed' : ''} ${
            card.matched ? 'matched' : ''
          } ${
            card.id === selectedCardId || card.revealed && !card.matched ? 'selected' : ''
          }`}
          >
            {card.revealed && card.number}
          </div>
        ))}
      </div>
        <div className='hintText'>
          <span>Touch cards to reveal number</span>
          <br></br>
          <span>Match all numbers to complete the puzzle</span>
        </div>
    </div>
  );
};

export default Puzzle2;
