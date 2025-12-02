
export type Comparable = {
    id: string;
    imageUrl: string;
    title: string;
    marketplace: 'eBay' | 'Mercari' | 'Poshmark' | 'Local Sale';
    condition: 'New' | 'Like new' | 'Good' | 'Fair' | 'For parts';
    price: number;
    type: 'Sold' | 'Listed';
    date: string;
};

export const MOCK_COMPARABLES: Comparable[] = [
    {
        id: 'comp1',
        imageUrl: 'https://picsum.photos/seed/comp1/48/48',
        title: 'iPhone 13 Pro Max 256GB - Graphite (Unlocked)',
        marketplace: 'eBay',
        condition: 'Good',
        price: 475.00,
        type: 'Sold',
        date: '2024-05-15'
    },
    {
        id: 'comp2',
        imageUrl: 'https://picsum.photos/seed/comp2/48/48',
        title: 'Apple iPhone 13 Pro Max 256GB Sierra Blue A2484',
        marketplace: 'Mercari',
        condition: 'Good',
        price: 450.00,
        type: 'Sold',
        date: '2024-05-12'
    },
    {
        id: 'comp3',
        imageUrl: 'https://picsum.photos/seed/comp3/48/48',
        title: 'iPhone 13 Pro Max - Good Condition',
        marketplace: 'Poshmark',
        condition: 'Good',
        price: 490.00,
        type: 'Listed',
        date: '2024-05-20'
    },
    {
        id: 'comp4',
        imageUrl: 'https://picsum.photos/seed/comp4/48/48',
        title: 'iPhone 13 Pro Max 256GB',
        marketplace: 'Local Sale',
        condition: 'Fair',
        price: 420.00,
        type: 'Sold',
        date: '2024-05-18'
    },
    {
        id: 'comp5',
        imageUrl: 'https://picsum.photos/seed/comp5/48/48',
        title: 'Mint iPhone 13 Pro Max',
        marketplace: 'eBay',
        condition: 'Like new',
        price: 520.00,
        type: 'Sold',
        date: '2024-05-19'
    },
    {
        id: 'comp6',
        imageUrl: 'https://picsum.photos/seed/comp6/48/48',
        title: 'iPhone 13 Pro Max (For parts)',
        marketplace: 'eBay',
        condition: 'For parts',
        price: 150.00,
        type: 'Sold',
        date: '2024-05-10'
    },
    {
        id: 'comp7',
        imageUrl: 'https://picsum.photos/seed/comp7/48/48',
        title: 'iPhone 13 Pro Max - Unlocked - 256GB - Excellent',
        marketplace: 'Mercari',
        condition: 'Like new',
        price: 535.00,
        type: 'Listed',
        date: '2024-05-22'
    },
     {
        id: 'comp8',
        imageUrl: 'https://picsum.photos/seed/comp8/48/48',
        title: 'Vintage wooden rocking chair - Restored',
        marketplace: 'Local Sale',
        condition: 'Good',
        price: 120.00,
        type: 'Sold',
        date: '2024-05-11'
    },
    {
        id: 'comp9',
        imageUrl: 'https://picsum.photos/seed/comp9/48/48',
        title: 'Antique Oak Rocker',
        marketplace: 'eBay',
        condition: 'Fair',
        price: 85.00,
        type: 'Sold',
        date: '2024-04-28'
    },
    {
        id: 'comp10',
        imageUrl: 'https://picsum.photos/seed/comp10/48/48',
        title: 'Mid-Century Modern Rocking Chair',
        marketplace: 'Poshmark',
        condition: 'Good',
        price: 150.00,
        type: 'Listed',
        date: '2024-05-19'
    }
];
