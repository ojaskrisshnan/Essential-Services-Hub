import Provider from '../models/Provider.js';
import User from '../models/User.js';

export const getProviders = async (req, res) => {
  const { category, search, pincode, location, minPrice, maxPrice, minRating, approved } = req.query;

  try {
    let query = {};

    // By default, show only approved providers unless specified otherwise or queried by Admin
    if (approved === 'false') {
      // Allow fetching unapproved (for admin panel)
    } else if (approved === 'all') {
      // Don't filter by approved status
    } else {
      query.approved = true;
    }

    if (category) {
      query.category = category;
    }

    if (pincode) {
      query.pincode = pincode;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.pricing = {};
      if (minPrice) query.pricing.$gte = Number(minPrice);
      if (maxPrice) query.pricing.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const providers = await Provider.find(query).populate('userId', 'name email phone address');
    res.json(providers);
  } catch (error) {
    console.error('Fetch providers error:', error);
    res.status(500).json({ message: 'Server error. Failed to retrieve providers.', error: error.message });
  }
};

export const createProvider = async (req, res) => {
  const { businessName, ownerName, category, location, pincode, experience, availability, pricing, image } = req.body;

  try {
    const existing = await Provider.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Provider profile already exists for this user.' });
    }

    const provider = await Provider.create({
      userId: req.user._id,
      businessName,
      ownerName: ownerName || req.user.name,
      category,
      location,
      pincode,
      experience,
      availability: availability || [],
      pricing,
      approved: false, // requires admin approval
      image: image || ''
    });

    res.status(201).json(provider);
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ message: 'Server error. Failed to create provider.', error: error.message });
  }
};

export const updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    // Allow updates by profile owner or admin
    if (provider.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    provider.businessName = req.body.businessName || provider.businessName;
    provider.category = req.body.category || provider.category;
    provider.location = req.body.location || provider.location;
    provider.pincode = req.body.pincode || provider.pincode;
    provider.experience = req.body.experience !== undefined ? req.body.experience : provider.experience;
    provider.pricing = req.body.pricing !== undefined ? req.body.pricing : provider.pricing;
    provider.availability = req.body.availability || provider.availability;
    provider.image = req.body.image !== undefined ? req.body.image : provider.image;

    if (req.user.role === 'admin' && req.body.approved !== undefined) {
      provider.approved = req.body.approved;
    }

    const updated = await provider.save();
    res.json(updated);
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ message: 'Server error. Failed to update provider.', error: error.message });
  }
};

export const deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    if (provider.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    await provider.deleteOne();
    res.json({ message: 'Provider profile deleted successfully.' });
  } catch (error) {
    console.error('Delete provider error:', error);
    res.status(500).json({ message: 'Server error. Failed to delete provider.', error: error.message });
  }
};
