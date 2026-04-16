const facts = [
  "Did you know sharks existed before trees? Sharks have been around for over 400 million years, while trees appeared around 350 million years ago.",
  "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still perfectly edible.",
  "Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body.",
  "Bananas are technically berries, but strawberries are not. In botanical terms, a berry comes from a single flower with one ovary.",
  "A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
  "The human nose can detect over one trillion different scents. That makes it far more sensitive than our eyes or ears.",
  "There are more stars in the universe than grains of sand on Earth. Scientists estimate around 200 sextillion stars exist out there.",
  "Cows have best friends and get stressed when separated. Studies show they produce less milk when kept apart from their companions.",
  "Lightning strikes the Earth about 100 times every second. That adds up to roughly 8 million strikes per day worldwide.",
  "The Eiffel Tower can grow up to 6 inches taller in summer. Heat causes the iron to expand, making the structure slightly taller.",
];

export function generateScript() {
  const index = Math.floor(Math.random() * facts.length);
  return facts[index];
}
