const Payment = require('../models/Payment');
const PaymentSetting = require('../models/PaymentSetting');
const Booking = require('../models/Booking');
const {
  getRazorpayConfig,
  razorpayApiRequest,
  createRazorpayOrder,
  refundRazorpayPayment,
  verifyPaymentSignature,
  verifyWebhookSignature
} = require('../utils/razorpay');

/**
 * Mask secret string for secure UI display
 */
const maskSecret = (secret) => {
  if (!secret) return '';
  if (secret.length <= 4) return '••••••••';
  return '••••••••' + secret.slice(-4);
};

// @desc    Get payment settings (Admin)
// @route   GET /api/payments/settings
// @access  Private (Admin)
const getSettings = async (req, res, next) => {
  try {
    let setting = await PaymentSetting.findOne({ gateway: 'razorpay' });

    if (!setting) {
      setting = await PaymentSetting.create({
        gateway: 'razorpay',
        environment: 'test',
        status: true,
        currency: 'INR',
        apiKey: process.env.RAZORPAY_KEY_ID || '',
        apiSecret: process.env.RAZORPAY_KEY_SECRET || '',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
        methods: { card: true, upi: true, upiQr: true, netbanking: true }
      });
    }

    const settingObj = setting.toObject();
    settingObj.apiSecretMasked = maskSecret(settingObj.apiSecret);
    settingObj.webhookSecretMasked = maskSecret(settingObj.webhookSecret);

    res.status(200).json({
      success: true,
      data: settingObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment settings (Admin)
// @route   PUT /api/payments/settings
// @access  Private (Admin)
const updateSettings = async (req, res, next) => {
  try {
    const {
      environment,
      status,
      currency,
      apiKey,
      apiSecret,
      webhookSecret,
      methods
    } = req.body;

    let setting = await PaymentSetting.findOne({ gateway: 'razorpay' });

    if (!setting) {
      setting = new PaymentSetting({ gateway: 'razorpay' });
    }

    if (environment !== undefined) setting.environment = environment;
    if (status !== undefined) setting.status = status;
    if (currency !== undefined) setting.currency = currency;
    if (apiKey !== undefined) setting.apiKey = apiKey.trim();

    // Preserve secret if masked string is passed
    if (apiSecret && !apiSecret.includes('••••')) {
      setting.apiSecret = apiSecret.trim();
    }
    if (webhookSecret && !webhookSecret.includes('••••')) {
      setting.webhookSecret = webhookSecret.trim();
    }

    if (methods) {
      setting.methods = {
        card: methods.card !== undefined ? methods.card : setting.methods.card,
        upi: methods.upi !== undefined ? methods.upi : setting.methods.upi,
        upiQr: methods.upiQr !== undefined ? methods.upiQr : setting.methods.upiQr,
        netbanking: methods.netbanking !== undefined ? methods.netbanking : setting.methods.netbanking
      };
    }

    setting.updatedBy = req.user._id;
    await setting.save();

    const settingObj = setting.toObject();
    settingObj.apiSecretMasked = maskSecret(settingObj.apiSecret);
    settingObj.webhookSecretMasked = maskSecret(settingObj.webhookSecret);

    res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully',
      data: settingObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test Razorpay credentials connection
// @route   POST /api/payments/test-connection
// @access  Private (Admin)
const testConnection = async (req, res, next) => {
  try {
    const config = await getRazorpayConfig();
    const apiKey = req.body.apiKey ? req.body.apiKey.trim() : config.apiKey;
    let apiSecret = req.body.apiSecret ? req.body.apiSecret.trim() : config.apiSecret;

    if (apiSecret && apiSecret.includes('••••')) {
      apiSecret = config.apiSecret;
    }

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both API Key and API Secret to test connection.'
      });
    }

    // Call Razorpay orders list API with limit 1 to test auth
    const response = await razorpayApiRequest({
      method: 'GET',
      endpoint: '/orders?count=1',
      apiKey,
      apiSecret
    });

    res.status(200).json({
      success: true,
      message: 'Razorpay API Connection Successful! Credentials are valid.',
      data: response
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `Connection Failed: ${error.message}`
    });
  }
};

// @desc    Get public payment settings for customer checkout
// @route   GET /api/payments/public-settings
// @access  Public
const getPublicSettings = async (req, res, next) => {
  try {
    const config = await getRazorpayConfig();
    res.status(200).json({
      success: true,
      data: {
        apiKey: config.apiKey,
        currency: config.currency,
        status: config.status,
        environment: config.environment,
        methods: config.methods
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order for a Booking
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod = 'card' } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId).populate('package');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Calculate final amount directly from database (Never trust frontend amount!)
    const amount = booking.totalPrice;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid booking total amount' });
    }

    const config = await getRazorpayConfig();
    if (!config.status) {
      return res.status(400).json({ success: false, message: 'Online payments are currently disabled by Admin.' });
    }

    if (!config.apiKey || !config.apiSecret) {
      return res.status(500).json({ success: false, message: 'Razorpay credentials not configured properly.' });
    }

    // Create Razorpay Order
    const receipt = `bk_${booking._id.toString().slice(-8)}_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: config.currency,
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        packageTitle: booking.package?.title || 'Travel Booking'
      },
      apiKey: config.apiKey,
      apiSecret: config.apiSecret
    });

    // Create Payment record with CREATED status
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      orderId: razorpayOrder.id,
      amount,
      currency: config.currency,
      gateway: 'razorpay',
      paymentMethod,
      status: 'CREATED',
      logs: [{
        event: 'ORDER_CREATED',
        status: 'CREATED',
        message: `Razorpay Order ${razorpayOrder.id} generated for ₹${amount}`
      }]
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        apiKey: config.apiKey,
        paymentId: payment._id,
        bookingId: booking._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment response parameters'
      });
    }

    const config = await getRazorpayConfig();

    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      apiSecret: config.apiSecret
    });

    let payment = await Payment.findOne({ orderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment transaction record not found' });
    }

    if (!isValid) {
      payment.status = 'FAILED';
      payment.logs.push({
        event: 'VERIFICATION_FAILED',
        status: 'FAILED',
        message: 'Razorpay HMAC signature verification failed'
      });
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed. Invalid transaction signature.'
      });
    }

    // Success Verification
    payment.status = 'CAPTURED';
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    if (paymentMethod) payment.paymentMethod = paymentMethod;

    payment.logs.push({
      event: 'PAYMENT_CAPTURED',
      status: 'CAPTURED',
      message: `Payment verified successfully. Payment ID: ${razorpay_payment_id}`
    });
    await payment.save();

    // Update Booking status to Paid / Completed / Confirmed
    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: 'Completed',
      status: 'Confirmed'
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and booking confirmed!',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Listener
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const config = await getRazorpayConfig();

    if (config.webhookSecret) {
      const isValid = verifyWebhookSignature({
        body: req.body,
        signature,
        webhookSecret: config.webhookSecret
      });

      if (!isValid) {
        console.error('Razorpay Webhook Signature Mismatch');
        return res.status(400).json({ success: false, message: 'Invalid Webhook Signature' });
      }
    }

    const payload = req.body;
    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity) {
      return res.status(200).json({ received: true });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    let payment = await Payment.findOne({ $or: [{ orderId }, { paymentId }] });

    if (payment) {
      // Idempotent event processing
      if (event === 'payment.captured' || event === 'payment.authorized') {
        if (payment.status !== 'CAPTURED') {
          payment.status = 'CAPTURED';
          payment.paymentId = paymentId;
          payment.logs.push({
            event,
            status: 'CAPTURED',
            message: `Webhook confirmed payment ${paymentId}`
          });
          await payment.save();

          await Booking.findByIdAndUpdate(payment.booking, {
            paymentStatus: 'Completed',
            status: 'Confirmed'
          });
        }
      } else if (event === 'payment.failed') {
        if (payment.status !== 'CAPTURED') {
          payment.status = 'FAILED';
          payment.logs.push({
            event,
            status: 'FAILED',
            message: `Webhook reported payment failure: ${paymentEntity.error_description || ''}`
          });
          await payment.save();
        }
      } else if (event === 'refund.processed' || event === 'refund.created') {
        const refundEntity = payload?.payload?.refund?.entity;
        const refundAmt = refundEntity?.amount ? refundEntity.amount / 100 : payment.amount;

        payment.refundAmount = (payment.refundAmount || 0) + refundAmt;
        if (payment.refundAmount >= payment.amount) {
          payment.status = 'REFUNDED';
        } else {
          payment.status = 'PARTIALLY_REFUNDED';
        }

        payment.logs.push({
          event,
          status: payment.status,
          message: `Webhook processed refund ₹${refundAmt}`
        });
        await payment.save();
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payment transactions (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getPayments = async (req, res, next) => {
  try {
    const {
      search = '',
      status = 'all',
      paymentMethod = 'all',
      gateway = 'all',
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }
    if (gateway && gateway !== 'all') {
      query.gateway = gateway;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate('booking')
      .sort({ createdAt: -1 });

    // Client-side / In-memory search matching ID, Order ID, Payment ID, Customer name
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter(p => 
        (p.orderId && p.orderId.toLowerCase().includes(q)) ||
        (p.paymentId && p.paymentId.toLowerCase().includes(q)) ||
        (p._id.toString().toLowerCase().includes(q)) ||
        (p.user?.name && p.user.name.toLowerCase().includes(q)) ||
        (p.user?.email && p.user.email.toLowerCase().includes(q)) ||
        (p.booking?._id && p.booking._id.toString().toLowerCase().includes(q))
      );
    }

    const total = payments.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginatedPayments = payments.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      data: paginatedPayments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment transaction details
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment transaction for a booking
// @route   GET /api/payments/booking/:bookingId
// @access  Private
const getPaymentByBookingId = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('user', 'name email phone')
      .populate('booking');

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process Full or Partial Refund (Admin)
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
const processRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment transaction not found' });
    }

    if (payment.status !== 'CAPTURED' && payment.status !== 'PARTIALLY_REFUNDED' && payment.status !== 'Succeeded') {
      return res.status(400).json({
        success: false,
        message: `Cannot refund transaction with status '${payment.status}'. Only CAPTURED payments can be refunded.`
      });
    }

    if (!payment.paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay Payment ID. Cannot initiate online refund without valid gateway payment reference.'
      });
    }

    const requestedAmount = amount ? parseFloat(amount) : payment.amount;
    const currentRefunded = payment.refundAmount || 0;
    const availableToRefund = payment.amount - currentRefunded;

    if (requestedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Refund amount must be greater than zero.' });
    }

    if (requestedAmount > availableToRefund) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (₹${requestedAmount}) exceeds remaining refundable balance (₹${availableToRefund}).`
      });
    }

    const config = await getRazorpayConfig();

    // Call Razorpay Refund API
    const razorpayRefund = await refundRazorpayPayment({
      paymentId: payment.paymentId,
      amount: requestedAmount,
      notes: { reason: reason || 'Admin requested refund' },
      apiKey: config.apiKey,
      apiSecret: config.apiSecret
    });

    const newRefundedTotal = currentRefunded + requestedAmount;
    payment.refundAmount = newRefundedTotal;

    if (newRefundedTotal >= payment.amount) {
      payment.status = 'REFUNDED';
    } else {
      payment.status = 'PARTIALLY_REFUNDED';
    }

    payment.refunds.push({
      refundId: razorpayRefund.id || `ref_${Date.now()}`,
      amount: requestedAmount,
      status: razorpayRefund.status || 'processed',
      reason: reason || 'Admin requested refund'
    });

    payment.logs.push({
      event: 'REFUND_PROCESSED',
      status: payment.status,
      message: `Processed ${payment.status} of ₹${requestedAmount}. Refund ID: ${razorpayRefund.id || 'N/A'}`
    });

    await payment.save();

    // Update Booking status if fully refunded
    if (payment.status === 'REFUNDED') {
      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: 'Refunded',
        status: 'Cancelled'
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${payment.status === 'REFUNDED' ? 'Full' : 'Partial'} Refund of ₹${requestedAmount}!`,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Backward compatibility aliases
const createPaymentIntent = createOrder;
const stripeWebhook = handleWebhook;

module.exports = {
  getSettings,
  updateSettings,
  testConnection,
  getPublicSettings,
  createOrder,
  verifyPayment,
  handleWebhook,
  getPayments,
  getPaymentById,
  getPaymentByBookingId,
  processRefund,
  createPaymentIntent,
  stripeWebhook
};
