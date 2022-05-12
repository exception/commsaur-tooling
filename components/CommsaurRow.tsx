import Image from 'next/image';
import React from 'react';
import useCommsaurData from '../hooks/useCommsaurData';
import { Commsaur, getDinoImage } from './CommsaurProvider';

type Props = {
    dino: Commsaur;
    choose: (dino: number) => void;
    selected: boolean;
};

function CommsaurRow({ dino, choose, selected }: Props) {
    const rarity = useCommsaurData(dino);

    return (
        <div
            onClick={() => choose(dino.id)}
            className={`flex flex-row space-x-2 px-2 py-2 mb-1 items-center cursor-pointer hover:scale-[.98] transition-all duration-100 ease-in-out ${
                selected && 'bg-slate-900/60'
            } rounded-xl`}
        >
            <Image
                src={getDinoImage(dino)}
                height={40}
                width={40}
                alt={`Commsaur #${dino.id}`}
                className="rounded-lg"
            />
            <div className="flex flex-col space-y-[-5px]">
                <p className="font-bold text-lg text-slate-400">
                    {`Commsaur #${dino.id}`}
                </p>
                <p className="font-semibold text-sm text-slate-600">
                    Rank #{rarity.rank} {dino.wrapped && ' (wrapped)'}
                </p>
            </div>
        </div>
    );
}

export default CommsaurRow;
