import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Service from '../models/Service.js';

export const createBooking = async (req, res) => {
  const { providerId, serviceId, bookingDate, slot, paymentMethod, address } = req.body;

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Determine target address
    let bookingAddress = address;
    if (!bookingAddress) {
      const customer = await User.findById(req.user._id);
      bookingAddress = customer.address;
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId,
      serviceId,
      bookingDate,
      slot,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid', // UPI/Card mock payment immediately changes to Paid
      address: bookingAddress
    });

    // Create notification for Provider
    await Notification.create({
      userId: providerId,
      message: `New booking request for "${service.serviceName}" on ${new Date(bookingDate).toLocaleDateString()} (${slot}) from ${req.user.name}.`
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error. Failed to create booking.', error: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'provider') {
      query.providerId = req.user._id;
    }
    // If admin, returns all bookings

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone address')
      .populate('providerId', 'name email phone')
      .populate('serviceId', 'serviceName category price duration')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ message: 'Server error. Failed to fetch bookings.', error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;

  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId')
      .populate('serviceId');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Access control: only the provider of the booking or the admin can update status
    if (
      booking.providerId.toString() !== req.user._id.toString() &&
      booking.customerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized status update.' });
    }

    // Save old status to compare
    const oldStatus = booking.status;

    if (status) {
      // Validate customer is only allowed to cancel, not set other states
      if (req.user.role === 'customer' && status !== 'Cancelled') {
        return res.status(403).json({ message: 'Customers are only allowed to cancel bookings.' });
      }
      booking.status = status;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    const updated = await booking.save();

    // Trigger customer notification if status changed by provider or admin
    if (status && oldStatus !== status && req.user._id.toString() !== booking.customerId._id.toString()) {
      await Notification.create({
        userId: booking.customerId._id,
        message: `Your booking for "${booking.serviceId.serviceName}" has been updated to "${status}".`
      });
    }

    // Trigger provider notification if cancelled by customer
    if (status === 'Cancelled' && req.user.role === 'customer') {
      await Notification.create({
        userId: booking.providerId,
        message: `Booking for "${booking.serviceId.serviceName}" was cancelled by customer ${req.user.name}.`
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error. Failed to update booking.', error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (req.user.role !== 'admin' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized deletion.' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error. Failed to delete booking.', error: error.message });
  }
};
