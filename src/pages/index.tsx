import { Keypair } from "@solana/web3.js";
import { SendTransactionRequest } from "components/SendTransactionRequest";
import { TransactionRequestQR } from "components/TransactionRequestQR";
import useTransactionListener from "hooks/useTransactionListener";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import type { NextPage } from "next";
import { useMemo } from "react";

const Home: NextPage = () => {
  const reference = useMemo(() => Keypair.generate().publicKey, []);
  useTransactionListener(reference);

  return (
    <Router>
      <div className="hero rounded-2xl bg-base-content">
        <div className="hero-content text-center">
          <div className="max-w-lg flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-primary">Transaction</h1>

            {/* Define your routes */}
            <Routes>
              <Route path="/send">
                {/* Component for sending transaction request */}
                <SendTransactionRequest reference={reference} />
              </Route>
              <Route path="/qr">
                {/* Component for QR code */}
                <TransactionRequestQR reference={reference} />
              </Route>
              <Route path="/">
                {/* Default component, e.g., Home page */}
                {/* Button to send a transaction request */}
                <SendTransactionRequest reference={reference} />
                {/* QR code for a transaction request */}
                <TransactionRequestQR reference={reference} />
              </Route>
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default Home;
