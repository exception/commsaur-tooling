import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import CommsaurProvider from '../components/CommsaurProvider';
import ToolContainer from '../components/ToolContainer';

const Home: NextPage = () => {
    const { data: account } = useAccount();
    const [hasAccount, setHasAccount] = useState(false);
    useEffect(() => {
        setHasAccount(!!account);
    }, [account]);

    return (
        <>
            <Head>
                <title>Commsaur Tools</title>
            </Head>
            <div className="flex h-full justify-center items-center font-sf-rounded py-10 lg:py-40">
                {!hasAccount && (
                    <div className="w-[90%] md:w-[600px] max-h-auto shadow-2xl bg-gray-800 rounded-xl px-4 pt-4 pb-6 text-center relative">
                        <h1 className="font-bold text-3xl text-white">
                            Commsaur Tools
                        </h1>
                        <p className="text-gray-500 font-semibold text-sm">
                            Connect your wallet to access the Commsaur tools,
                            wrap your Commsaur into it&apos;s PFP version,
                            download high-res JPEGs, and more!
                        </p>

                        <ConnectButton.Custom>
                            {({
                                mounted,
                                account,
                                chain,
                                openConnectModal,
                                openChainModal,
                                openAccountModal,
                            }) => {
                                if (!mounted || !account || !chain) {
                                    return (
                                        <button
                                            onClick={openConnectModal}
                                            className={`rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-5 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                                        >
                                            <p className="font-bold text-md text-white">
                                                Connect your wallet
                                            </p>
                                        </button>
                                    );
                                }

                                if (chain.unsupported) {
                                    return (
                                        <button
                                            onClick={openChainModal}
                                            className={`rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-5 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                                        >
                                            <p className="font-bold text-md text-white">
                                                Switch to correct chain
                                            </p>
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        onClick={openAccountModal}
                                        className={`rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-5 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                                    >
                                        <p className="font-sm-rounded font-bold text-md text-white">
                                            Manage my Wallet
                                        </p>
                                    </button>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                )}
                {hasAccount && (
                    <CommsaurProvider>
                        <ToolContainer />
                    </CommsaurProvider>
                )}
            </div>
        </>
    );
};

export default Home;
