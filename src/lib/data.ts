import { PlaceHolderImages } from './placeholder-images';

export type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: (typeof PlaceHolderImages)[0];
};

export const dummyMarketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Vintage Leather Armchair',
    description: 'A beautifully worn, comfortable brown leather armchair. Perfect for a reading nook or adding a classic touch to your living room. Minor scuffs consistent with age, adding to its character.',
    price: 150,
    image: PlaceHolderImages.find(img => img.id === 'chair')!,
  },
  {
    id: '2',
    title: 'Classic Desk Lamp',
    description: 'A vintage-style desk lamp with an iconic green glass shade and brass-finished base. Provides excellent focused light for working or reading. In great working condition.',
    price: 45,
    image: PlaceHolderImages.find(img => img.id === 'lamp')!,
  },
  {
    id: '3',
    title: 'Red Road Bicycle',
    description: 'A classic 10-speed road bicycle in a striking red color. Great for commuting or weekend rides. Recently tuned up and ready to ride. Some minor paint chips.',
    price: 220,
    image: PlaceHolderImages.find(img => img.id === 'bicycle')!,
  },
  {
    id: '4',
    title: 'Collection of Hardcover Classics',
    description: 'A stack of 8 vintage hardcover books, featuring literary classics. Great for decoration or for the avid reader. Titles include Moby Dick, Pride and Prejudice, and more.',
    price: 30,
    image: PlaceHolderImages.find(img => img.id === 'books')!,
  },
    {
    id: '5',
    title: 'Retro 35mm Film Camera',
    description: 'A stylish and functional 35mm film camera from the 80s. Comes with a standard 50mm lens. A great way to get into analog photography. Untested, sold as-is.',
    price: 75,
    image: PlaceHolderImages.find(img => img.id === 'camera')!,
  },
  {
    id: '6',
    title: 'Acoustic Guitar',
    description: 'A full-sized acoustic guitar with a warm, rich tone. Ideal for beginners or as a travel guitar. Includes a soft case. A few minor scratches on the back.',
    price: 90,
    image: PlaceHolderImages.find(img => img.id === 'guitar')!,
  }
];
