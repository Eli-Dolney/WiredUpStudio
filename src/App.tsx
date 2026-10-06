import { useState } from "react";
import BootScreen from "./components/BootScreen";
import Channel from "./components/Channel";
import CircuitField from "./components/CircuitField";
import Connect from "./components/Connect";
import Footer from "./components/Footer";
import Games from "./components/Games";
import Hero from "./components/Hero";
import Lab from "./components/Lab";
import Models from "./components/Models";
import Nav from "./components/Nav";
import Ticker from "./components/Ticker";
import Ventures from "./components/Ventures";

export default function App() {
  const interiorPage = window.location.pathname.replace(/\/$/, "") !== "";
  const [booting, setBooting] = useState(() => {
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    return !interiorPage && params.get("boot") !== "0";
  });

  const modelsPage = window.location.pathname.replace(/\/$/, "") === "/3d-models";
  return (
    <>
      {booting && <BootScreen onDone={() => setBooting(false)} />}
      <div
        className={`${interiorPage ? "site-interior" : "site-home"} relative min-h-dvh bg-void transition-opacity duration-700 ${
          booting ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={booting}
      >
        {!interiorPage && <>
        <CircuitField />
        <div className="noise" />
        <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(900px_500px_at_80%_-10%,rgba(210,255,31,0.08),transparent_55%),radial-gradient(700px_420px_at_0%_80%,rgba(155,224,0,0.05),transparent_50%)]" />
        </>}
        <Nav />
        <main>
          {modelsPage ? <Models /> : <>
          <Hero />
          <Ticker />
          <Ventures />
          <Channel />
          <Games />
          <Lab />
          <Connect />
          </>}
        </main>
        <Footer />
      </div>
    </>
  );
}
