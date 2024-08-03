import {NextUIProvider} from "@nextui-org/system";
import {Button} from "@nextui-org/button";

function App() {
  // 2. Wrap NextUIProvider at the root of your app
  return (
        <Button className="dark">Click me</Button>
  );
}

export default App
