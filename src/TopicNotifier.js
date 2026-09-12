import { ID } from 'node-appwrite';

const FESTIVAL_TOPIC_ID = process.env.FESTIVALS_TOPIC_ID;

function buildFestivalMessageId() {
  return ID.unique();
}

// Deterministic ID, kept for reference:
// function buildFestivalMessageId({ day, month, year }) {
//   const pad = (value) => String(value).padStart(2, '0');
//
//   return `${pad(day)}-${pad(month)}-${year}-festival`;
// }

function joinWithAnd(items) {
  if (items.length <= 1) {
    return items[0] ?? '';
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function buildTitle({ significantFestivals, vrat, specialObservance }) {
  if (significantFestivals.length > 0) {
    return `🪔 ${joinWithAnd(significantFestivals)}`;
  }

  if (vrat) {
    return `🙏 ${vrat}`;
  }

  if (specialObservance) {
    return `✨ ${specialObservance}`;
  }

  return null;
}

function buildBody({ significantFestivals, vrat, specialObservance }) {
  const extras = [vrat, specialObservance].filter(Boolean);

  if (significantFestivals.length > 0) {
    const festivalText =
      significantFestivals.length === 1
        ? `Today is ${significantFestivals[0]}`
        : `Today's festivals are ${joinWithAnd(significantFestivals)}`;

    return extras.length > 0
      ? `${festivalText}. Also observed: ${joinWithAnd(extras)}.`
      : `${festivalText}. Wishing you a joyous day! 🎉`;
  }

  if (extras.length > 0) {
    return `Today is ${joinWithAnd(extras)}. 🙏`;
  }

  return null;
}

export function createPushNotificationText(userId, curatedFestivals) {
  const {
    significantFestivals = [],
    vrat = null,
    specialObservance = null,
  } = curatedFestivals ?? {};

  const title = buildTitle({ significantFestivals, vrat, specialObservance });
  const body = buildBody({ significantFestivals, vrat, specialObservance });

  if (!title || !body) {
    return null;
  }

  return { userId, template: { title, body } };
}

export async function sendFestivalNotification(
  messaging,
  userId,
  curatedFestivals,
  dateComponents
) {
  const notification = createPushNotificationText(userId, curatedFestivals);

  if (!notification) {
    return null;
  }

  const { title, body } = notification.template;
  const messageId = buildFestivalMessageId();

  const message = await messaging.createPush(messageId, title, body, [
    FESTIVAL_TOPIC_ID,
  ]);

  return { template: notification.template, message };
}
