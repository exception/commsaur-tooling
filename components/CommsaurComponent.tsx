/* eslint-disable @next/next/no-img-element */
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import React, { Fragment, useCallback, useState } from 'react';
import {
    useAccount,
    useContractRead,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import useCommsaurData from '../hooks/useCommsaurData';
import { Commsaur } from './CommsaurProvider';
import abi from '../abis/commsaur_abi.json';
import pfpAbi from '../abis/commsaur_pfp_abi.json';
import LoadingSpinner from './LoadingSpinner';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { commsaurAddress, pfpAddress } from '../abis/commsaur';

type Props = {
    dino: Commsaur;
};

function CommsaurComponent({ dino }: Props) {
    const rarity = useCommsaurData(dino);
    const [showWarning, setShowWarning] = useState(false);
    const [wrapping, setWrapping] = useState(false);
    const { data: account } = useAccount();
    const [isApproved, setIsApproved] = useState(false);
    const addRecent = useAddRecentTransaction();
    const [transactionHash, setTransactionHash] = useState<string>();
    const [error, setError] = useState('');

    const { isLoading: useTransactionSending, isSuccess: wasWrapped } =
        useWaitForTransaction({
            hash: transactionHash,
            enabled: !!transactionHash,
        });

    const { isLoading: isApprovedLoading } = useContractRead(
        {
            addressOrName: commsaurAddress,
            contractInterface: abi,
        },
        'isApprovedForAll',
        {
            args: [account?.address, commsaurAddress],
            enabled: wrapping,
            onSuccess(data) {
                if (typeof data === 'boolean') {
                    setIsApproved(data);
                }
            },
            onError(error) {
                setError(error.message);
            },
        },
    );

    const { isLoading: approveLoading, write } = useContractWrite(
        {
            addressOrName: commsaurAddress,
            contractInterface: abi,
        },
        'setApprovalForAll',
        {
            args: [commsaurAddress, true],
            onSuccess() {
                setIsApproved(true);
            },
            onError(error) {
                setError(error.message);
            },
        },
    );

    const {
        data: wrapData,
        error: wrapError,
        isLoading: wrapLoading,
        write: wrapDinoCall,
    } = useContractWrite(
        {
            addressOrName: commsaurAddress,
            contractInterface: pfpAbi,
        },
        'safeTransferFrom(address,address,uint256)',
        {
            args: [account?.address, pfpAddress, dino.id],
            onSuccess(tx) {
                console.log('added', tx);
                addRecent({
                    hash: tx.hash,
                    description: `Wrap Commsaur ${dino.id}`,
                });

                setTransactionHash(tx.hash);
                setWrapping(false);
            },
            onError(error) {
                setError(error.message);
            },
        },
    );

    const wrapDino = useCallback(() => {
        setShowWarning(false);
        setWrapping(true);
    }, []);

    const doClick = useCallback(() => {
        if (!wrapping) {
            setShowWarning(true);
            return;
        }

        if (!isApproved && !isApprovedLoading) {
            write();
        } else if (isApproved && !wrapLoading) {
            wrapDinoCall();
        }
    }, [
        isApproved,
        isApprovedLoading,
        wrapping,
        write,
        wrapLoading,
        wrapDinoCall,
    ]);

    return (
        <>
            <p className="text-3xl font-bold pb-3">Commsaur #{dino.id}</p>
            <div className="flex w-full flex-col lg:flex-row lg:space-x-3 justify-between">
                <div className="flex flex-col max-w-full lg:max-w-[45%]">
                    <img
                        className="object-cover rounded-lg self-center"
                        loading="lazy"
                        src={dino.url}
                        alt={`Commsaur #${dino.id}`}
                    />
                    {error && (
                        <p className="text-red-300 text-lg text-center font-semibold">
                            {error}
                        </p>
                    )}
                    <button
                        disabled={
                            wrapping && (isApprovedLoading || approveLoading)
                        }
                        onClick={doClick}
                        className={`text-center items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                    >
                        {wasWrapped && (
                            <p className="font-bold text-md text-white">
                                Dino Wrapped!
                            </p>
                        )}
                        {!wrapping && !wasWrapped && (
                            <p className="font-bold text-md text-white">
                                Wrap into PFP
                            </p>
                        )}
                        {wrapping &&
                            (isApprovedLoading ||
                                approveLoading ||
                                useTransactionSending) && (
                                <p>
                                    <LoadingSpinner />
                                </p>
                            )}
                        {wrapping &&
                            !isApprovedLoading &&
                            !isApproved &&
                            !approveLoading && (
                                <p className="font-bold text-md text-white">
                                    Approve Contract
                                </p>
                            )}
                        {wrapping && isApproved && !approveLoading && (
                            <p className="font-bold text-md text-white">
                                Wrap now!
                            </p>
                        )}
                    </button>
                    <div className="flex flex-row justify-between space-x-2">
                        <Link
                            href={`https://looksrare.org/collections/0xBAcB34Bcf94442dbA033e9cf7216888B8170F0cE/${dino.id}`}
                        >
                            <a
                                target="_blank"
                                className={`text-center w-full rounded-xl bg-gradient-to-r from-emerald-700 to-green-400 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                            >
                                <p className="font-bold text-md text-white">
                                    View on LooksRare
                                </p>
                            </a>
                        </Link>
                        <Link
                            href={`https://opensea.io/assets/0xbacb34bcf94442dba033e9cf7216888b8170f0ce/${dino.id}`}
                        >
                            <a
                                target="_blank"
                                className={`text-center w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                            >
                                <p className="font-bold text-md text-white">
                                    View on OpenSea
                                </p>
                            </a>
                        </Link>
                    </div>
                </div>
                <div className="pt-2 lg:pt-0">
                    {rarity.traits.map((trait) => {
                        if (trait.trait_value === 'None') return;
                        return (
                            <div
                                key={`saur-data-${trait.trait_type}`}
                                className="pb-2"
                            >
                                <p className="font-sf-rounded font-semibold text-slate-400 text-base">
                                    {trait.trait_type} / {trait.trait_value}
                                    <span className="text-slate-600">
                                        {' '}
                                        ({trait.percent}%)
                                    </span>
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full hover:bg-blue-400"
                                        style={{ width: `${trait.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                    <p className="font-semibold text-slate-600 text-sm">
                        This Commsaur is ranked #{rarity.rank} with a Rarity
                        score of {rarity.rarity_score}. All of this data was
                        provided by RaritySniper.
                    </p>
                </div>
            </div>
            <Transition.Root show={showWarning} as={Fragment}>
                <Dialog
                    onClose={setShowWarning}
                    className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[35vh]"
                >
                    <Transition.Child
                        enter="duration-300 ease-out"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="duration-200 ease-in"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-slate-700/80"></Dialog.Overlay>
                    </Transition.Child>
                    <Transition.Child
                        enter="duration-300 ease-out"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="duration-200 ease-in"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="mx-auto max-w-xl h-auto p-4 bg-slate-800 rounded-lg text-center">
                            <p className="text-red-300 font-bold text-xl">
                                Warning
                            </p>
                            <p className="text-slate-600 text-sm font-semibold">
                                Wrapping your Commsaur NFT transfers the ERC721
                                token to our wrapping contract, which removes it
                                from circulation from any marketplaces. Selling
                                your wrapped NFT means that you no longer have
                                access to the unwrapped version, and the new
                                owner can unwrap it to access the original
                                version.
                            </p>

                            <button
                                onClick={wrapDino}
                                className={`rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                            >
                                <p className="font-bold text-sm text-white">
                                    I acknowledge, and want to wrap!
                                </p>
                            </button>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition.Root>
        </>
    );
}

export default CommsaurComponent;
