import { Client, TablesDB, Messaging } from 'node-appwrite';
import { getCurrentISTDateComponents } from './DateComponents.js';
import { getFestivalsForDate } from './Calendar.js';
import { selectSignificantFestivals } from './FestivalSignificance.js';
import { sendFestivalNotification } from './TopicNotifier.js';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const tablesDB = new TablesDB(client);
  const messaging = new Messaging(client);

  try {
    const dateComponents = getCurrentISTDateComponents();
    log(`Current IST date components: ${JSON.stringify(dateComponents)}`);

    const festivals = await getFestivalsForDate(tablesDB, dateComponents);
    log(`Festivals for today: ${JSON.stringify(festivals)}`);

    const curatedFestivals = await selectSignificantFestivals(festivals);
    log(`Curated festivals for today: ${JSON.stringify(curatedFestivals)}`);

    const notification = await sendFestivalNotification(
      messaging,
      null,
      curatedFestivals,
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
