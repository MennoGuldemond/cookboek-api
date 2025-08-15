CREATE OR REPLACE VIEW RecipeInfo AS
SELECT
  r.id AS id,
  r.title AS title,
  COUNT(l.id) AS numberOfLikes,
  u.name AS authorName,
  r.authorId AS authorId,
  r.photoURL AS photoURL,
  r.createdAt AS createdAt
FROM Recipe r
LEFT JOIN Likes l ON l.recipeId = r.id
LEFT JOIN User u ON r.authorId = u.id
GROUP BY r.id, r.title, u.name, r.authorId, r.photoURL, r.createdAt;