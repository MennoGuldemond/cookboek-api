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


CREATE OR REPLACE VIEW UserInfo AS
SELECT
  u.id AS id,
  u.email AS email,
  u.name AS name,
  u.photoUrl AS photoUrl,
  u.provider AS provider,
  u.createdAt AS createdAt,
  u.role AS role,
  COUNT(DISTINCT r.id) AS numberOfRecipes,
  COUNT(DISTINCT l.id) AS numberOfLikesGiven,
  (
    SELECT COUNT(*)
    FROM Likes l2
    JOIN Recipe r2 ON l2.recipeId = r2.id
    WHERE r2.authorId = u.id
  ) AS numberOfLikesReceived
FROM User u
LEFT JOIN Recipe r ON r.authorId = u.id
LEFT JOIN Likes l ON l.userId = u.id
GROUP BY u.id, u.email, u.name, u.photoUrl, u.provider, u.createdAt, u.role;