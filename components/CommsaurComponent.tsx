/* eslint-disable @next/next/no-img-element */
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { commsaurAddress, pfpAddress } from '../abis/commsaur';
import useCommsaurData from '../hooks/useCommsaurData';
import { Commsaur, getDinoImage } from './CommsaurProvider';
import DownloadIcon from './icons/DownloadIcon';
import UnwrapButton from './UnwrapButton';
import WrapButton from './WrapButton';

type Props = {
    dino: Commsaur;
};

function CommsaurComponent({ dino }: Props) {
    const rarity = useCommsaurData(dino);
    const [showWarning, setShowWarning] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setShowWarning(false);
        setError('');
        setAcknowledged(false);
    }, [dino]);

    const download = useCallback(() => {
        window.open(
            dino.wrapped
                ? `https://d124myd65w4vuo.cloudfront.net/pfps/${dino.id}.png`
                : `https://d124myd65w4vuo.cloudfront.net/fullRes/${dino.id}.png`,
            '_blank',
        );
    }, [dino]);

    return (
        <>
            <div className="flex flex-row items-center justify-between">
                <p className="text-3xl font-bold pb-3 flex flex-row items-center">
                    {dino.wrapped && 'Wrapped '}Commsaur #{dino.id}
                </p>
                <DownloadIcon onClick={download} />
            </div>
            <div className="flex w-full flex-col lg:flex-row lg:space-x-3 justify-between">
                <div className="flex flex-col max-w-full lg:max-w-[45%]">
                    <img
                        className="object-cover rounded-lg self-center"
                        src={getDinoImage(dino)}
                        alt={`Commsaur #${dino.id}`}
                    />
                    {error && (
                        <p className="text-red-300 text-lg text-center font-semibold pt-2">
                            {error}
                        </p>
                    )}
                    {!dino.wrapped && (
                        <WrapButton
                            acknowledged={acknowledged}
                            dino={dino}
                            setShowWarning={setShowWarning}
                            setError={setError}
                        />
                    )}
                    {dino.wrapped && (
                        <UnwrapButton setError={setError} dino={dino} />
                    )}
                    <div className="flex flex-row justify-between space-x-2">
                        <Link
                            href={`https://looksrare.org/collections/${
                                dino.wrapped ? pfpAddress : commsaurAddress
                            }/${dino.id}`}
                        >
                            <a
                                target="_blank"
                                className={`text-center w-full rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 mt-2 px-4 py-2 hover:scale-[.98] transition-all ease-in-out`}
                            >
                                <p className="font-bold text-md text-white">
                                    View on LooksRare
                                </p>
                            </a>
                        </Link>
                        <Link
                            href={`https://opensea.io/assets/${
                                dino.wrapped ? pfpAddress : commsaurAddress
                            }/${dino.id}`}
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
                        This Commsaur is ranked #{rarity.rank} with a rarity
                        score of {rarity.rarity_score}. Data provided by
                        RaritySniper.
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
                            <p className="text-slate-600 text-sm font-semibold">
                                Wrapping/unwrapping Commsaurs cost gas every
                                time you wish to do this, however, approving
                                Contracts is a one-time transaction (once for
                                wrapping, and another for unwrapping).
                            </p>

                            <button
                                onClick={() => {
                                    setShowWarning(false);
                                    setAcknowledged(true);
                                }}
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
