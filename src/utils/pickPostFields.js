const pickPostFields = (body) => {
  const payload = {};

  if (body.title !== undefined) payload.title = body.title;
  if (body.content !== undefined) payload.content = body.content;
  if (body.tags !== undefined) {
    payload.tags = Array.isArray(body.tags)
      ? body.tags
      : String(body.tags)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
  }

  return payload;
};

module.exports = pickPostFields;
