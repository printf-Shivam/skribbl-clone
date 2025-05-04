const words = [
  'apple', 'banana', 'car', 'dog', 'elephant', 'flower', 'guitar', 'house',
  'island', 'jacket', 'kite', 'lemon', 'mountain', 'notebook', 'ocean',
  'pizza', 'queen', 'robot', 'sunshine', 'telephone', 'umbrella', 'volcano',
  'waterfall', 'xylophone', 'yacht', 'zebra', 'airplane', 'butterfly',
  'castle', 'dinosaur', 'eagle', 'football', 'giraffe', 'hamburger',
  'igloo', 'jungle', 'kangaroo', 'lighthouse', 'moonlight', 'newspaper',
  'octopus', 'penguin', 'rainbow', 'snowman', 'tiger', 'unicorn',
  'violin', 'window', 'xmas', 'yogurt', 'zombie', 'beach', 'candle',
  'dolphin', 'elephant', 'fireworks', 'glasses', 'helicopter', 'icecream',
  'jelly', 'keyboard', 'ladder', 'mushroom', 'needle', 'orange', 'pencil',
  'queen', 'rabbit', 'sandwich', 'train', 'umbrella', 'vase', 'watch',
  'xray', 'yellow', 'zipper', 'arm', 'book', 'cat', 'door', 'ear',
  'face', 'garden', 'hat', 'ice', 'juice', 'king', 'lion', 'mirror',
  'nose', 'owl', 'pillow', 'quilt', 'river', 'sun', 'tree', 'uncle',
  'van', 'wheel', 'fox', 'yarn', 'zoo'
];

export function getRandomWord() {
  return words[Math.floor(Math.random()*words.length)];
}
