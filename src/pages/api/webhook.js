import { buffer } from "micro";
import * as admin from "firebase-admin";
import serviceAccount from "../../../permissions.json";
import stripe from "stripe";

// Secure a connection to firebase from the backend

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

// Establish connection to stripe
const Stripe = stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

const fulfillOrder = async (session) => {
  // console.log("Fulfilling order", session);

  return app
    .firestore()
    .collection("users")
    .doc(session.metadata.email)
    .collection("orders")
    .doc(session.id)
    .set({
      amount: session.amount_total / 100,
      amount_shipping: session.total_details.amount_shipping / 100,
      images: JSON.parse(session.metadata.images),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log(`SUCCESS: Order ${session.id} has been added to DB`);
    });
};

export default async (req, res) => {
  if (req.method === "POST") {
    const requestBuffer = await buffer(req);
    const payload = requestBuffer.toString();
    const sig = req.headers["stripe-signature"];

    let event;

    // Verify that the event posted came from Stripe
    try {
      event = Stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (error) {
      console.log("ERROR", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // fulfill the order
      return fulfillOrder(session)
        .then(() => res.status(200))
        .catch((err) => res.status(400).send(`Webhook error: ${err.message}`));
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
