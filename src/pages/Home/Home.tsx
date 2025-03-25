import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import Scanner from '../Scanner/Scanner';
import Splash from '../Splash/Splash';
import './Home.css';

const Home: React.FC = () => {

  const { name } = useParams<{ name: string; }>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {name === "Scan" && (<Scanner name={name} /> )}   
        {name === "Home" && (<div>Home</div> )}
        {name === "Splash" && (<Splash name={name} />)}
      </IonContent>
    </IonPage>
  );
};

export default Home;