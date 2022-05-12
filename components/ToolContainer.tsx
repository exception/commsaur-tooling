import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import CommsaurComponent from './CommsaurComponent';
import { Commsaur, useCommsaurContext } from './CommsaurProvider';
import CommsaurRow from './CommsaurRow';

function ToolContainer() {
    const { data: account } = useAccount();
    const { originalSize: commsaurAmount, herd, reset } = useCommsaurContext();

    useEffect(() => {
        if (!account && herd.length > 0) {
            reset();
        }
    }, [account, herd, reset]);
    const [commsaur, setCommsaur] = useState<Commsaur | null>(null);

    return (
        <div className="flex flex-col lg:block w-[90%] lg:w-[85%] xl:w-[75%] text-white">
            <div className="w-full max-h-[450px] overflow-auto lg:w-[25%] mb-5 lg:mb-0 bg-gray-800 rounded-xl p-4 lg:float-left">
                <p className="font-bold text-2xl">
                    Your Commsaurs{' '}
                    <span className="text-gray-500">({commsaurAmount})</span>
                </p>
                {herd.length != commsaurAmount && (
                    <p className="text-gray-500 font-semibold text-sm pt-2">
                        Herding {herd.length}/{commsaurAmount}...
                    </p>
                )}
                <div className="pt-2">
                    {herd.map((dino) => (
                        <CommsaurRow
                            key={`saur-${dino.id}`}
                            dino={dino}
                            choose={setCommsaur}
                            selected={commsaur?.id == dino.id}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full lg:w-[75%] lg:float-right">
                {!commsaur && (
                    <div className="bg-gray-800 rounded-xl p-4 items-center justify-center text-center lg:ml-5">
                        <p className="text-gray-500 text-3xl font-bold">
                            Select one of your Commsaurs to access it&apos;s
                            tools!
                        </p>
                    </div>
                )}
                {commsaur && (
                    <div className="bg-gray-800 rounded-xl p-4 lg:ml-5 h-auto">
                        <CommsaurComponent dino={commsaur} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ToolContainer;
