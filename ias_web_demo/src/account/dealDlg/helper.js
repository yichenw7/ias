export function calculRepoBondsAmount(bonds) {
    if (!bonds) return;
    let repoAmount = 0, faceAmount = 0;

    bonds.forEach(bond => {
        repoAmount += bond.use_volume * bond.price;
        faceAmount += bond.use_volume * 100;
    });

    return {
        repoAmount,
        faceAmount
    }
}


export function hasPledgeBond(pledges, bklm) {
    return pledges.some(p => p.bond_key_listed_market === bklm);
}
