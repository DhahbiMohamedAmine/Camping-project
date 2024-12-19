const express = require("express");
const router = express.Router();
const stripe = require("stripe")("sk_test_51PG3uWClavGSdaZ6PGMVLxRE3Qs6JeZwOPJHNuGCc4hJdlkDhEiidWhYgevJBklDInVbJhAvW9S1L8zYMFnSPmya00AYam2yby"); // Replace with your actual secret key

router.post("/create-checkout-session", async (req :any, res : any) => {
  const { tripId, userId, price } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Trip to " + tripId,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3001/success?tripId=${tripId}&userId=${userId}`,
      cancel_url: "http://localhost:3001/cancel",
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to create a checkout session");
  }
});

export default router;

