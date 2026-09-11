const FESTIVAL_TOPIC_ID = process.env.APPWRITE_FESTIVAL_TOPIC_ID;

function buildFestivalMessageId({ day, month, year }) {
  const pad = (value) => String(value).padStart(2, '0');

  return `${pad(day)}-${pad(month)}-${year}-festival`;
}

export function createPushNotificationText(userId, festivals) {
  if (!festivals || festivals.length === 0) {
    return null;
  }

  const topFestivals = festivals.slice(0, 3);

  const template = {
    title: festivals.length === 1 ? festivals[0] : "Today's Festivals",
    body:
      topFestivals.length === 1
        ? `Today is ${topFestivals[0]}!`
        : `Today's festivals: ${topFestivals.join(', ')}`,
  };

  return { userId, template };
}

export async function sendFestivalNotification(
  messaging,
  userId,
  festivals,
  dateComponents
) {
  const notification = createPushNotificationText(userId, festivals);

  if (!notification) {
    return null;
  }

  const { title, body } = notification.template;
  const messageId = buildFestivalMessageId(dateComponents);

  const message = await messaging.createPush(messageId, title, body, [
    FESTIVAL_TOPIC_ID,
  ]);

  return { template: notification.template, message };
}
