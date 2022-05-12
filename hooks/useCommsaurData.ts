import { Commsaur } from "../components/CommsaurProvider";
const rarities: RarityData[] = require('../rarity.json');

interface RarityData {
    id: number;
    rank: number;
    rarity_score: number;
    traits: Trait[];
}

type Trait = {
    trait_type: string;
    trait_value: string;
    percent: number;
    count: number;
}

function useCommsaurData(dino: Commsaur): RarityData {
    const rarity = rarities.filter(saur => saur.id == dino.id)[0];
    return rarity;
}

export default useCommsaurData;