const categories = {
  science: [
    "space mysteries",
    "black hole facts",
    "quantum physics facts",
    "future technology facts",
    "time travel theories"
  ],

  anime: [
    "naruto facts",
    "one piece mysteries",
    "anime power systems",
    "dark anime theories",
    "attack on titan secrets"
  ],

  marine: [
    "deep ocean mysteries",
    "dangerous sea creatures",
    "shark facts",
    "underwater discoveries",
    "creatures living in darkness"
  ],

  biology: [
    "human brain facts",
    "genetics facts",
    "evolution mysteries",
    "deadly bacteria facts",
    "weird animal biology"
  ],

  psychology: [
    "dark psychology facts",
    "human behavior facts",
    "mind tricks",
    "psychological illusions",
    "body language secrets"
  ]
};

export function getRandomTopic() {
  const categoryNames = Object.keys(categories);

  const randomCategory =
    categoryNames[Math.floor(Math.random() * categoryNames.length)];

  const topicList = categories[randomCategory];

  const topic =
    topicList[Math.floor(Math.random() * topicList.length)];

  return {
    category: randomCategory,
    topic
  };
}

export default categories;