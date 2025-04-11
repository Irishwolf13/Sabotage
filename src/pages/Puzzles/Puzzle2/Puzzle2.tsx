import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonButtons } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import { isRoomSabotaged, setPlayerGhostTrue } from '../../../firebase/controller';
import FoundBodyModal from '../../../components/Modals/FoundBodyModal';
import './Puzzle2.css';

interface Card {
  id: number;
  number: number;
  revealed: boolean;
  matched: boolean;
}

const Puzzle2: React.FC<{ numberOfPairs?: number }> = ({ numberOfPairs = 6 }) => {
  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const game = useSelector((state: RootState) => state.games[0]);
  const history = useHistory();
  const { user } = useAuth();
  const [isBusy, setIsBusy] = useState(false);

  const [myTitle, setMyTitle] = useState('');
  const [myBody, setMyBody] = useState('');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = (pairs: number = numberOfPairs) => {
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

  const solvePuzzle = async (pass: boolean) => {
    try {
      const roomIsSabotaged = await isRoomSabotaged(game.id, game.currentRoom);
  
      if (roomIsSabotaged && user && user.email) {
        await setPlayerGhostTrue(game.id, user.email);
        history.push(`/game/${game.id}/deadPlayer`);
      } else {
        if (pass) {
          setMyTitle('Congratulations!');
          setMyBody(`You have passed this simple Task, don't you feel proud...`);
        } else {
          setMyTitle('Better luck next time!');
          setMyBody(`With time and effort, you'll finish this simple task.`);
        }
        setShowModal(true);
        initializeGame(); // Reset game after solving
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
    }
  };

  const toMainPage = () => {
    history.push(`/game/${game.id}/player/mainPage`);
    setShowModal(false);
  };

  useEffect(() => {
    if (game.foundDead && user?.email) {
      const player = game.players.find((p) => p.email === user.email);
      if (player && !player.ghost) {
        setShowModal(false);
      }
    }
  }, [game, user]);

  const cancleTry = () => {
    solvePuzzle(false); // Reset game for cancel
  };

  useEffect(() => {
    if (game.foundDead) {
      if (user && user.email) {
        const player = game.players.find(p => p.email === user.email);
        if (player && !player.ghost) {
          setShowModal(false);
        }
      }
    }
  }, [game]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Puzzle 2</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={cancleTry}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
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
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-content">
            <h2>{myTitle}</h2>
            <p>{myBody}</p>
            <IonButton onClick={() => toMainPage()}>Close</IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Puzzle2;
