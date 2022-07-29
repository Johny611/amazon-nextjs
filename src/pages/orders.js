import { getSession, useSession } from "next-auth/react";
import Header from "../components/Header.js";
import db from "../../firebase.js";
import moment from "moment";
import Order from "../components/Order.js";
import Stripe from "stripe";
import { collection, getDocs, orderBy } from "firebase/firestore";

const Orders = ({ orders }) => {
  const { session } = useSession();

  return (
    <div>
      <Header />
      <main className="max-x-screen-lg mx-auto p-10">
        <h1 className="text-3xl border-b mb-2 pb-1 border-yellow-400">
          Your orders
        </h1>

        {session ? (
          <h2>{orders.length} Orders</h2>
        ) : (
          <h2>Please sign in to see your orders</h2>
        )}

        <div className="mt-5 space-y-4">
          {orders?.map(
            ({ id, amount, amountShipping, items, timestamp, images }) => (
              <Order
                key={id}
                id={id}
                amount={amount}
                amountShipping={amountShipping}
                items={items}
                timestamp={timestamp}
                images={images}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;

export async function getServerSideProps(context) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  // get the users logged in credentials
  const session = await getSession(context);

  if (!session) {
    return {
      props: {},
    };
  }

  // firebase db
  // const stripeOrders = db
  //   .collection("users")
  //   .doc(session.user.email)
  //   .collection("orders")
  //   .orderBy("timestamp", "desc")
  //   .get();

  const stripeOrders = collection(
    db,
    "users",
    session.user.email,
    "orders",
    orderBy("timestamp", "desc")
  );
  const querySnapshot = await getDocs(stripeOrders);

  // stripe orders
  const orders = await Promise.all(
    querySnapshot.docs.map(async (order) => ({
      id: order.id,
      amount: order.data().amount,
      amountShipping: order.data().amount_shipping,
      images: order.data().images,
      timestamp: moment(order.data().timestamp.toDate()).unix(),
      items: (
        await stripe.checkout.sessions.listLineItems(order.id, {
          limit: 100,
        })
      ).data,
    }))
  );

  return {
    props: {
      orders,
    },
  };
}
