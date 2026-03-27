const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Process payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('package');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Amount in cents (for Stripe)
    const amount = booking.totalPrice * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id
      }
    });

    // Create a pending payment record
    await Payment.create({
      booking: booking._id,
      user: req.user.id,
      amount: booking.totalPrice,
      currency: 'USD',
      status: 'Pending',
      stripePaymentIntentId: paymentIntent.id
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment & update booking
// @route   POST /api/payments/webhook
// @access  Public (Stripe Webhook)
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Requires raw body (express.raw) for webhook verification
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Find payment record
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
    
    if (payment) {
      payment.status = 'Succeeded';
      await payment.save();

      // Update booking
      await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'Completed' });
    }
  }

  res.status(200).json({ received: true });
};

module.exports = {
  createPaymentIntent,
  stripeWebhook
};
