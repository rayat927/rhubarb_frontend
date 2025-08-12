import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function App() {

   useEffect(() => {
    // const location = useLocation();

  // // This gets the query string part after '?'
  //   const queryParams = new URLSearchParams(location.search);

  const queryString = window.location.search; // e.g., "?name=John&id=123"

  // Use URLSearchParams to parse
  const queryParams = new URLSearchParams(queryString);
    const isAuthenticated = queryParams.get("isAuthenticated") === "true";
    const isAuthenticated2 = localStorage.getItem("isAuthenticated") === "true";
    if(isAuthenticated && !isAuthenticated2){
      localStorage.setItem("isAuthenticated", "true");
      console.log('hello');
      
    } else if(!isAuthenticated && !isAuthenticated2){
      window.location.href = "https://www.englovoice.com/login";
    console.log('hello 2');
    
    }
  //   console.log('hello 3');
    
  }, []);
  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas>
    </>
  );
}

export default App;
