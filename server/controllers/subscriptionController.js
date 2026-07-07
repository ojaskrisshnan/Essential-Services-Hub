import Subscription from '../models/Subscription.js';
import Notification from '../models/Notification.js';
import Service from '../models/Service.js';

export const createSubscription = async (req, res) => {
  const { serviceId, providerId, frequency, startDate } = req.body;

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const subscription = await Subscription.create({
      customerId: req.user._id,
      serviceId,
      providerId,
      frequency,
      startDate: startDate || Date.now(),
      status: 'Active'
    });

    // Notify provider
    await Notification.create({
      userId: providerId,
      message: `New subscription (${frequency}) requested for "${service.serviceName}" by customer ${req.user.name}.`
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error. Failed to create subscription.', error: error.message });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'provider') {
      query.providerId = req.user._id;
    }

    const subscriptions = await Subscription.find(query)
      .populate('customerId', 'name email phone address')
      .populate('providerId', 'name email phone')
      .populate('serviceId', 'serviceName category price')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    res.status(500).json({ message: 'Server error. Failed to fetch subscriptions.', error: error.message });
  }
};

export const updateSubscription = async (req, res) => {
  const { status } = req.body;

  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('serviceId');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    // Access control
    if (
      subscription.customerId.toString() !== req.user._id.toString() &&
      subscription.providerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized subscription update.' });
    }

    subscription.status = status || subscription.status;
    const updated = await subscription.save();

    // Notify the other party
    const targetUser = req.user._id.toString() === subscription.customerId.toString()
      ? subscription.providerId
      : subscription.customerId;

    await Notification.create({
      userId: targetUser,
      message: `Subscription for "${subscription.serviceId.serviceName}" has been updated to "${status}" by ${req.user.name}.`
    });

    res.json(updated);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error. Failed to update subscription.', error: error.message });
  }
};
