import StakingInterface from "./components/StakingInterface";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { STAKING_POOL_ADDRESS } from "./constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navbar / Header */}
      <div className="relative z-10 w-full backdrop-blur-xl bg-gray-900/50 border-b border-gray-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">💎</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                DeFi Staking Protocol
              </h1>
              <p className="text-xs text-gray-500">Powered by Sepolia Testnet</p>
            </div>
          </div>
          <ConnectButton showBalance={true} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center w-full p-4 md:p-8 pt-12">
        <div className="text-center mb-12 max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Stake & Earn Rewards
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Deposit your tokens into our secure smart contract and earn passive rewards in real-time. 
            Track your earnings, manage your stakes, and maximize your yields with our intuitive dashboard.
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
              <span className="text-green-400">●</span>
              <span className="text-sm text-gray-300">Live Rewards</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
              <span className="text-blue-400">🔒</span>
              <span className="text-sm text-gray-300">Secure & Audited</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
              <span className="text-purple-400">⚡</span>
              <span className="text-sm text-gray-300">Instant Claim</span>
            </div>
          </div>
        </div>

        {/* Your Staking Component */}
        <StakingInterface />
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 mt-20 text-center border-t border-gray-800/50 backdrop-blur-xl bg-gray-900/30">
        <p className="text-gray-500 text-sm mb-2">
          Built with <span className="text-red-400">♥</span> using Next.js + RainbowKit + Wagmi + Viem
        </p>
        <p className="text-gray-600 text-xs">
          Smart Contract: {STAKING_POOL_ADDRESS.slice(0, 6)}...{STAKING_POOL_ADDRESS.slice(-4)}
        </p>
      </footer>
    </main>
  );
}