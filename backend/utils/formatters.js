export function formatUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username ?? null,
    name: user.name ?? null,
    role: user.role,
    created_at: user.created_at?.toISOString?.() ?? user.created_at,
  };
}

export function formatTopic(topic) {
  return {
    id: topic._id.toString(),
    name: topic.name,
    description: topic.description,
    position: topic.position,
    active: topic.active,
    created_at: topic.created_at?.toISOString?.() ?? topic.created_at,
    updated_at: topic.updated_at?.toISOString?.() ?? topic.updated_at,
  };
}

export function formatQuestion(question, topic = null) {
  const formatted = {
    id: question._id.toString(),
    topic_id: question.topic_id?.toString?.() ?? question.topic_id,
    name: question.name,
    item_type: question.item_type,
    content: question.content,
    problem_url: question.problem_url,
    github_url: question.github_url,
    resource_url: question.resource_url,
    youtube_url: question.youtube_url,
    youtube_video_id: question.youtube_video_id,
    position: question.position,
    active: question.active,
    created_at: question.created_at?.toISOString?.() ?? question.created_at,
    updated_at: question.updated_at?.toISOString?.() ?? question.updated_at,
  };
  if (topic) {
    formatted.topics = formatTopic(topic);
  }
  return formatted;
}
