import { Client, Databases, Messaging } from 'node-appwrite';
import { getCurrentISTDateComponents } from './DateComponents.js';
import { getFestivalsForDate } from './Calendar.js';
import { sendFestivalNotification } from './TopicNotifier.js';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const databases = new Databases(client);
  const messaging = new Messaging(client);

  try {
    const dateComponents = getCurrentISTDateComponents();
    log(`Current IST date components: ${JSON.stringify(dateComponents)}`);

    const festivals = await getFestivalsForDate(databases, dateComponents);
    log(`Festivals for today: ${JSON.stringify(festivals)}`);

    const notification = await sendFestivalNotification(
      messaging,
      null,
      festivals,
      dateComponents
    );

    if (!notification) {
      log('No festivals today, no notification sent.');
      return res.json({ title: null, body: null });
    }

    log(`Push notification sent: ${JSON.stringify(notification.message)}`);

    return res.json({
      title: notification.template.title,
      body: notification.template.body,
    });
  } catch (err) {
    error(`Failed to send festival notification: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};
