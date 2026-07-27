import { getRandomTopic } from "../../data/categories.js";

export function getTopic(req, res) {
  const { category, topic } = getRandomTopic();

  res.json({
    success: true,
    category,
    topic,
  });
}