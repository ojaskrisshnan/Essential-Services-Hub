import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

export const createPayment = async (req, res) => {
  const { bookingId, amount, method } = req.body;

  try {
    const booking = await Booking.findById(bookingId).populate('serviceId customerId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Generate random transaction ID
    const transactionId = 'TXN' + Math.floor(10000000 + Math.random() * 90000000);

    const payment = await Payment.create({
      bookingId,
      amount,
      method,
      status: 'Success',
      transactionId
    });

    // Update booking status
    booking.paymentStatus = 'Paid';
    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId._id,
      message: `Payment of ₹${amount} successful for "${booking.serviceId.serviceName}" (Txn ID: ${transactionId}).`
    });

    // Notify provider
    await Notification.create({
      userId: booking.providerId,
      message: `Payment received of ₹${amount} for booking "${booking.serviceId.serviceName}" from ${booking.customerId.name}.`
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Server error. Payment failed.', error: error.message });
  }
};

export const getInvoice = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId)
      .populate('customerId', 'name email phone address')
      .populate('providerId', 'name email phone')
      .populate('serviceId', 'serviceName category price duration');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const payment = await Payment.findOne({ bookingId });

    res.json({
      booking,
      payment: payment || { method: booking.paymentMethod, status: booking.paymentStatus, transactionId: 'N/A' }
    });
  } catch (error) {
    console.error('Fetch invoice error:', error);
    res.status(500).json({ message: 'Server error. Failed to retrieve invoice details.', error: error.message });
  }
};
