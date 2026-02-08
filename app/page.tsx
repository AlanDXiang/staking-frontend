import StakingInterface from "./components/StakingInterface";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center">
      {/* Navbar / Header */}
      <div className="w-full flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Alan's Staking Pool
        </h1>
        <ConnectButton showBalance={false} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full p-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold mb-4">Stake & Earn Rewards</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Deposit your tokens to earn yield in real-time.
            Powered by Sepolia Testnet.
          </p>
        </div>

        {/* Your Staking Component */}
        <StakingInterface />
      </div>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-600 text-sm border-t border-gray-900">
        Built with Next.js + RainbowKit + Wagmi
      </footer>
    </main>
  );
}