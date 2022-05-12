import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';
import {
    apiProvider,
    configureChains,
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    RainbowKitProvider,
    wallet,
} from '@rainbow-me/rainbowkit';
import { chain, createClient, WagmiProvider } from 'wagmi';

const { chains, provider } = configureChains(
    [process.env.NODE_ENV === 'production' ? chain.mainnet : chain.hardhat],
    [
        apiProvider.alchemy('nzLJjKrtgPGbidugKn5S6G8o9RFnsxnv'),
        apiProvider.jsonRpc((chain) => ({
            rpcUrl: chain.rpcUrls.default,
        })),
    ],
);

const { wallets } = getDefaultWallets({
    appName: 'Commsaur',
    chains,
});

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: 'More',
        wallets: [wallet.ledger({ chains }), wallet.argent({ chains })],
    },
]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <WagmiProvider client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={darkTheme()}>
                <Component {...pageProps} />
            </RainbowKitProvider>
        </WagmiProvider>
    );
}

export default MyApp;
