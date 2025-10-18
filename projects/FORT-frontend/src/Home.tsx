// src/components/Home.tsx
import { useWallet } from "@txnlab/use-wallet-react";
import React, { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import Transact from "./components/Transact";
import AppCalls from "./components/AppCalls";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false);
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false);
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false);
  const { activeAddress } = useWallet();

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal);
  };

  const toggleDemoModal = () => {
    setOpenDemoModal(!openDemoModal);
  };

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <h1 className="text-6xl md:text-7xl font-extrabold leading-tight text-white max-w-4xl">
        Give away your data on{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">your own terms</span>
      </h1>
      <p className="mt-6 text-2xl md:text-3xl text-gray-300 font-light">
        with <span className="font-semibold text-white">FORT.ai</span>
      </p>
    </div>
  );
};

export default Home;
