import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalBookings = await Booking.countDocuments();

    // Calculate revenue (sum of amounts of successful payments)
    const bookings = await Booking.find({ paymentStatus: 'Paid' }).populate('serviceId');
    const revenue = bookings.reduce((sum, booking) => sum + (booking.serviceId?.price || 0), 0);

    // Group bookings by category for chart visualization
    const categoryStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$service.category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Group bookings by month (for earnings chart)
    const monthlyStats = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$service.price' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: {
        totalUsers,
        totalCustomers,
        totalProviders,
        totalBookings,
        revenue
      },
      categoryStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Server error. Failed to load analytics.', error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Server error. Failed to retrieve users.', error: error.message });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block administrator accounts.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ 
      message: `User ${user.name} has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`, 
      user 
    });
  } catch (error) {
    console.error('Toggle block error:', error);
    res.status(500).json({ message: 'Server error. Operation failed.', error: error.message });
  }
};

export const toggleProviderApproval = async (req, res) => {
  const { approved } = req.body;

  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found.' });
    }

    provider.approved = approved !== undefined ? approved : !provider.approved;
    await provider.save();

    // Send notification to Provider
    await Notification.create({
      userId: provider.userId,
      message: `Your business profile "${provider.businessName}" status has been updated to: ${provider.approved ? 'Approved' : 'Suspended/Blocked'}.`
    });

    res.json({
      message: `Provider status updated successfully. Current status: ${provider.approved ? 'Approved' : 'Unapproved'}.`,
      provider
    });
  } catch (error) {
    console.error('Toggle approval error:', error);
    res.status(500).json({ message: 'Server error. Operation failed.', error: error.message });
  }
};
