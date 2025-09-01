import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { useLocation } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { CustomLoader } from "./components/CustomLoader";
import './styles/custom_loader.css';
import PlanModal from "./components/PlanModal";


function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
}


function App() {
   const { progress } = useProgress();
   const [authLoading, setAuthLoading] = useState(true);
   const [showNoPlanModal, setShowNoPlanModal] = useState(false);

   const isNoPlan = (plan) => !plan || String(plan).trim() === "";

  //  useEffect(() => {
  //   // const location = useLocation();

  // // // This gets the query string part after '?'
  // //   const queryParams = new URLSearchParams(location.search);

  // const queryString = window.location.search; // e.g., "?name=John&id=123"

  // // Use URLSearchParams to parse
  // const queryParams = new URLSearchParams(queryString);
  //   const isAuthenticated = queryParams.get("isAuthenticated") === "true";
  //   const isAuthenticated2 = localStorage.getItem("isAuthenticated") === "true";
  //   if(isAuthenticated && !isAuthenticated2){
  //     localStorage.setItem("isAuthenticated", "true");
  //     console.log('hello');
      
  //   } else if(!isAuthenticated && !isAuthenticated2){
  //     window.location.href = "https://www.englovoice.com/login";
  //   console.log('hello 2');
    
  //   }
  // //   console.log('hello 3');
    
  // }, []);

  useEffect(() => {
    (async () => {
      try {

        const cached = localStorage.getItem("initialData");
        if (cached) {
          const parsed = JSON.parse(cached);
          setInitialData(parsed);
          setShowNoPlanModal(isNoPlan(parsed?.plan));
        }
         const resp = await fetch("https://www.englovoice.com/initial_data", {
          credentials: "include",
        });

        if (!resp.ok) {
          window.location.href =
            "https://www.englovoice.com/login?next=" +
            encodeURIComponent(window.location.href);
          return;
        }

       
        const data = await resp.json();

        // Save to localStorage for future reloads
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("initialData", JSON.stringify(data));
        localStorage.setItem("userId", data.userId ?? "");
        localStorage.setItem("email", data.email ?? "");
        localStorage.setItem("plan", data.plan ?? "");
        localStorage.setItem("username", data.username ?? "");
        localStorage.setItem("quota", JSON.stringify(data.quota ?? {}));

        setInitialData(data);
        setShowNoPlanModal(isNoPlan(data?.plan));
      } catch (err) {
        console.error("Initial data load failed:", err);
        window.location.href =
          "https://www.englovoice.com/login?next=" +
          encodeURIComponent(window.location.href);
      } finally {
        setAuthLoading(false);
      }
    })();
    setTimeout(() => {
      setAuthLoading(false)
      
    }, 1000);

  }, []);

   const showLoader = authLoading || progress < 100;

  return (
    <>
        {showLoader && (
        <CustomLoader
          bg="#0d1120"       // ← set to your avatar background color
          accent="#7a3bff"   // ← brand accent color
          progress={Math.max(0, progress)} 
          note={authLoading ? "Verifying session…" : "Loading assets…"}
        />
      )}
      <Leva hidden />
       {/* <PlanModal
        open={showNoPlanModal}
        onClose={() => setShowNoPlanModal(false)}
      /> */}
      <UI />
      {/* <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas> */}
      <Scene />
    </>
  );
}

export default App;
