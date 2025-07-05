import type { Taxon } from '~/types/Taxon';

export function getChildren(taxons: Taxon[], parentCode: string): Taxon[] {
    return taxons.filter(t => t.parent?.endsWith(`/${parentCode}`));
}
