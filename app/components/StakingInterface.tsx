'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { STAKING_POOL_ADDRESS, STAKING_TOKEN_ADDRESS, STAKING_POOL_ABI, ERC20_ABI } from '../constants';

export default function StakingInterface() {
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState('');
    const [isStaking, setIsStaking] = useState(true); // Toggle between Stake/Withdraw

    // --- READ DATA ---
    // 1. Get Staked Balance
    const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // 2. Get Earned Rewards
    const { data: earnedRewards, refetch: refetchEarned } = useReadContract({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'earned',
        args: address ? [address] : undefined,
    });

    // 3. Get User's Token Balance (for input validation)
    const { data: tokenBalance } = useReadContract({
        address: STAKING_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // 4. Check Allowance (Crucial for Staking!)
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: STAKING_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, STAKING_POOL_ADDRESS] : undefined,
    });

    // --- WRITE FUNCTIONS ---
    const { writeContract, data: hash, isPending } = useWriteContract();

    // Wait for tx to finish so we can refresh data
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            refetchStaked();
            refetchEarned();
            refetchAllowance();
            setAmount('');
        }
    }, [isConfirmed]);

    // --- HANDLERS ---

    const handleApprove = () => {
        writeContract({
            address: STAKING_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [STAKING_POOL_ADDRESS, parseEther(amount)],
        });
    };

    const handleStake = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'stake',
            args: [parseEther(amount)],
        });
    };

    const handleWithdraw = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'withdraw',
            args: [parseEther(amount)],
        });
    };

    const handleClaim = () => {
        writeContract({
            address: STAKING_POOL_ADDRESS,
            abi: STAKING_POOL_ABI,
            functionName: 'getReward',
        });
    };

    if (!isConnected) return <div className="text-center p-10 text-gray-500">Please connect your wallet</div>;

    const needsApproval = isStaking && allowance !== undefined && amount && allowance < parseEther(amount);

    return (
        <div className="max-w-md mx-auto bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden border border-gray-800 mt-10">

            {/* Header Stats */}
            <div className="p-6 bg-gray-800 border-b border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Your Position</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-3 rounded-lg">
                        <p className="text-xs text-gray-400">Staked</p>
                        <p className="text-lg font-mono">{stakedBalance ? formatEther(stakedBalance as bigint) : '0'} STK</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-gray-400">Rewards</p>
                        <p className="text-lg font-mono text-green-400">{earnedRewards ? formatEther(earnedRewards as bigint) : '0'} RWD</p>
                    </div>
                </div>
                <button
                    onClick={handleClaim}
                    disabled={!earnedRewards || earnedRewards === 0n || isPending}
                    className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-sm font-bold rounded transition"
                >
                    {isPending ? 'Processing...' : 'Claim Rewards'}
                </button>
            </div>

            {/* Action Tabs */}
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setIsStaking(true)}
                    className={`flex-1 py-3 text-sm font-medium ${isStaking ? 'text-white border-b-2 border-purple-500 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Stake
                </button>
                <button
                    onClick={() => setIsStaking(false)}
                    className={`flex-1 py-3 text-sm font-medium ${!isStaking ? 'text-white border-b-2 border-purple-500 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Withdraw
                </button>
            </div>

            {/* Input Area */}
            <div className="p-6">
                <div className="flex justify-between mb-2">
                    <label className="text-xs text-gray-400">Amount</label>
                    <span className="text-xs text-gray-500">
                        Wallet Balance: {tokenBalance ? formatEther(tokenBalance as bigint) : '0'}
                    </span>
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-white mb-4 focus:outline-none focus:border-purple-500"
                    placeholder="0.0"
                />

                {isStaking ? (
                    needsApproval ? (
                        <button
                            onClick={handleApprove}
                            disabled={isPending}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-bold transition"
                        >
                            {isPending ? 'Approving...' : 'Approve Tokens'}
                        </button>
                    ) : (
                        <button
                            onClick={handleStake}
                            disabled={isPending || !amount}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded font-bold transition"
                        >
                            {isPending ? 'Staking...' : 'Stake'}
                        </button>
                    )
                ) : (
                    <button
                        onClick={handleWithdraw}
                        disabled={isPending || !amount}
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded font-bold transition"
                    >
                        {isPending ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                )}

                {isConfirming && <p className="text-center text-xs text-yellow-500 mt-2 animate-pulse">Confirming transaction...</p>}
            </div>
        </div>
    );
}