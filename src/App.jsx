import Landing from './components/Landing.jsx';
import Widget from './components/Widget.jsx';

export default function App() {
  return (
    <>
      <Landing />
      <Widget autoOpen autoOpenDelay={1600} />
    </>
  );
}
