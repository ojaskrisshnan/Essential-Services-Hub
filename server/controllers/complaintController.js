import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import Booking from '../models/Booking.js';

export const createComplaint = async (req, res) => {
  const { bookingId, reason, description } = req.body;

  try {
    const booking = await Booking.findById(bookingId).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const complaint = await Complaint.create({
      bookingId,
      customerId: req.user._id,
      reason,
      description,
      status: 'Pending'
    });

    // Notify provider that a complaint has been raised
    await Notification.create({
      userId: booking.providerId,
      message: `A customer has raised a complaint for booking "${booking.serviceId.serviceName}" due to "${reason}".`
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Complaint submit error:', error);
    res.status(500).json({ message: 'Server error. Failed to file complaint.', error: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }
    // Admin sees all complaints

    const complaints = await Complaint.find(query)
      .populate('customerId', 'name email phone')
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', select: 'serviceName category price' },
          { path: 'providerId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({ message: 'Server error. Failed to retrieve complaints.', error: error.message });
  }
};

export const resolveComplaint = async (req, res) => {
  const { status } = req.body; // 'Resolved' or 'Pending'

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = status || 'Resolved';
    const updated = await complaint.save();

    // Notify customer
    await Notification.create({
      userId: complaint.customerId,
      message: `Your complaint regarding booking ID ${complaint.bookingId} has been marked as "${complaint.status}".`
    });

    res.json(updated);
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({ message: 'Server error. Failed to update complaint status.', error: error.message });
  }
};
