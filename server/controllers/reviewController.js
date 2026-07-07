import Review from '../models/Review.js';
import Provider from '../models/Provider.js';
import Notification from '../models/Notification.js';

export const createReview = async (req, res) => {
  const { providerId, rating, review, image } = req.body;

  try {
    const newReview = await Review.create({
      customerId: req.user._id,
      providerId,
      rating,
      review,
      image: image || ''
    });

    // Update provider ratings statistics
    const provider = await Provider.findOne({ userId: providerId });
    if (provider) {
      const currentRating = provider.rating || 5.0;
      const count = provider.ratingCount || 0;
      
      const newCount = count + 1;
      const newAvgRating = ((currentRating * count) + rating) / newCount;

      provider.rating = Math.round(newAvgRating * 10) / 10; // Round to 1 decimal place
      provider.ratingCount = newCount;
      await provider.save();
    }

    // Notify provider
    await Notification.create({
      userId: providerId,
      message: `You received a new ${rating}-star review from customer ${req.user.name}.`
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Review submit error:', error);
    res.status(500).json({ message: 'Server error. Review submission failed.', error: error.message });
  }
};

export const getReviews = async (req, res) => {
  const { providerId } = req.query;

  try {
    let query = {};
    if (providerId) query.providerId = providerId;

    const reviews = await Review.find(query)
      .populate('customerId', 'name')
      .populate('providerId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ message: 'Server error. Failed to retrieve reviews.', error: error.message });
  }
};

export const replyToReview = async (req, res) => {
  const { reply } = req.body;

  try {
    const reviewObj = await Review.findById(req.params.id);
    if (!reviewObj) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Verify it's the provider of the review replying
    if (reviewObj.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only the corresponding provider can reply.' });
    }

    reviewObj.reply = reply;
    const updated = await reviewObj.save();

    // Notify customer
    await Notification.create({
      userId: reviewObj.customerId,
      message: `A provider has replied to your review.`
    });

    res.json(updated);
  } catch (error) {
    console.error('Reply review error:', error);
    res.status(500).json({ message: 'Server error. Reply submission failed.', error: error.message });
  }
};
