import React, { useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import './Puzzle4.css';

interface ContainerProps {
  solvePuzzle: (pass:boolean) => void;
}

const Puzzle4: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const myImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4A.jpg?alt=media&token=bc44db77-6224-49af-a80a-c071c667dc84', originalIndex: 0 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4B.jpg?alt=media&token=20ec3592-dad0-44fb-9d35-46b66c185656', originalIndex: 1 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4C.jpg?alt=media&token=abb214fd-9f1e-4b1c-aaa6-ea2688396758', originalIndex: 2 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4D.jpg?alt=media&token=f0b568ef-3769-4405-895e-76aee07c003a', originalIndex: 3 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4E.jpg?alt=media&token=0889d4ce-0920-459e-bff8-95b7d5853aac', originalIndex: 4 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4F.jpg?alt=media&token=1df19405-f9ab-4090-9a97-166f9d20f324', originalIndex: 5 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4G.jpg?alt=media&token=565429f8-dfb2-4ddb-9ed2-a3a42950ef6d', originalIndex: 6 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4H.jpg?alt=media&token=1b59948b-b5f6-469f-b16a-d4b6e7a77705', originalIndex: 7 },
    { src: 'https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2Fpuzzle4Art%2Fpuzzle4I.jpg?alt=media&token=8b4ac538-21a3-4a07-8a3f-e8bbda290d4d', originalIndex: 8 },
  ];
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [droppedIndices, setDroppedIndices] = useState<boolean[]>(Array(6).fill(false));
  const [placedPieces, setPlacedPieces] = useState<number>(0)
  
  // Suffles the array of images
  const shuffleArray = (array: Array<{ src: string; originalIndex: number }>) => {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const [shuffledImages, setShuffledImages] = useState(shuffleArray(myImages));
  
  // Reset game state
  useIonViewWillEnter(() => { resetGameState(); });
  
  // Reset game state
  const resetGameState = () => {
    setPlacedPieces(0);
    setDroppedIndices(Array(6).fill(false)); // Reset all drop states
    setHighlightedIndex(null); // Clear any highlights
    setDraggedIndex(null); // Clear any dragged index
    setShuffledImages(shuffleArray(myImages)); // Shuffle the images array again
  };

  const handleDragStart = (
    event: React.DragEvent | React.TouchEvent,
    index: number
  ) => {
    const actualIndex = shuffledImages[index].originalIndex;

    if (event.type === 'dragstart') {
      const dragEvent = event as React.DragEvent;
      dragEvent.dataTransfer.setData('text/plain', String(actualIndex));
      setDraggedIndex(index);

      // Get the rendered image and clone it for drag image
      const target = dragEvent.currentTarget as HTMLElement;
      const imgElement = target.querySelector('img');

      if (imgElement) {
        const clone = imgElement.cloneNode(true) as HTMLImageElement;
        clone.style.width = getComputedStyle(imgElement).width;
        clone.style.height = getComputedStyle(imgElement).height;
        clone.style.position = 'absolute';
        clone.style.top = '-1000px'; // hide off-screen

        document.body.appendChild(clone); // must be in DOM to work

        const rect = imgElement.getBoundingClientRect();
        dragEvent.dataTransfer.setDragImage(clone, rect.width / 2, rect.height / 2);

        // Clean up after small delay
        setTimeout(() => {
          document.body.removeChild(clone);
        }, 0);
      }
    }
  };

  const handleDrop = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    const draggedItemIndex = parseInt(event.dataTransfer.getData('text/plain'));

    if (draggedItemIndex === index) {
      const updatedDroppedIndices = [...droppedIndices];
      updatedDroppedIndices[index] = true;
      setDroppedIndices(updatedDroppedIndices);
      adjustPlacedPieces()
    }

    setHighlightedIndex(null);
    setDraggedIndex(null);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && shuffledImages[draggedIndex].originalIndex === index) {
      setHighlightedIndex(index);
    }
  };

  const handleDragLeave = () => {
    setHighlightedIndex(null);
  };

  const adjustPlacedPieces = () => {
    if (placedPieces === 8) {
      solvePuzzle(true)
    } else {
      setPlacedPieces(placedPieces +1)
    }
  }

  const handleSolved = () => {
    solvePuzzle(false)
  }

  return (
    <div className='puzzle4Main'>
      <div className='dragDropContainer'>
        <div className='boxContainerTop'>
          {myImages.map((_, i) => (
            <div
              key={`dropBox-${i}`}
              className={`dropBox ${
                highlightedIndex === i
                  ? draggedIndex !== null && shuffledImages[draggedIndex].originalIndex === i
                    ? 'highlight'
                    : 'invalidHighlight'
                  : ''
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => handleDragEnter(i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
            >
              {droppedIndices[i] && (
                <img src={myImages[i].src} alt={`Dropped Item ${i + 1}`} draggable={false} />
              )}
            </div>
          ))}
        </div>
        <div className='boxContainerBottom'>
          {shuffledImages.map((img:any, i:any) => (
            <div
              key={`draggable-${i}`}
              className='draggableItem'
              draggable={!droppedIndices[img.originalIndex]}
              onDragStart={(e) => handleDragStart(e, i)}
              style={{ visibility: droppedIndices[img.originalIndex] ? 'hidden' : 'visible' }}
            >
              <img src={img.src} alt={`Draggable Item ${i + 1}`} draggable={false} />
            </div>
          ))}
        </div>
      </div>
      <h6>Drag and drop pieces</h6>
      <button onClick={handleSolved}>Solve</button>
    </div>
  );
};

export default Puzzle4;
