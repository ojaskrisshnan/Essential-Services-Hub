import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Provider from '../models/Provider.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_12345', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  const { name, email, password, phone, role, address, providerDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      address: address || {}
    });

    if (user.role === 'provider') {
      const details = providerDetails || {};
      await Provider.create({
        userId: user._id,
        businessName: details.businessName || `${name}'s Services`,
        ownerName: name,
        category: details.category || 'Local Home Services',
        location: details.location || address?.city || 'Local Area',
        pincode: details.pincode || address?.pincode || '000000',
        experience: details.experience || 0,
        availability: details.availability || ['09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM', '03:00 PM - 06:00 PM'],
        pricing: details.pricing || 100,
        approved: false, // Default to false for admin approval flow
        image: details.image || ''
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error. Registration failed.', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'This account has been blocked. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Login failed.', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let profileData = { user };

    if (user.role === 'provider') {
      const provider = await Provider.findOne({ userId: user._id });
      profileData.provider = provider;
    }

    res.json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error. Profile fetch failed.', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.address) {
      user.address = {
        street: req.body.address.street !== undefined ? req.body.address.street : user.address.street,
        area: req.body.address.area !== undefined ? req.body.address.area : user.address.area,
        city: req.body.address.city !== undefined ? req.body.address.city : user.address.city,
        pincode: req.body.address.pincode !== undefined ? req.body.address.pincode : user.address.pincode,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    let updatedProvider = null;
    if (user.role === 'provider' && req.body.providerDetails) {
      const provider = await Provider.findOne({ userId: user._id });
      if (provider) {
        provider.businessName = req.body.providerDetails.businessName || provider.businessName;
        provider.category = req.body.providerDetails.category || provider.category;
        provider.location = req.body.providerDetails.location || provider.location;
        provider.pincode = req.body.providerDetails.pincode || provider.pincode;
        provider.experience = req.body.providerDetails.experience !== undefined ? req.body.providerDetails.experience : provider.experience;
        provider.pricing = req.body.providerDetails.pricing !== undefined ? req.body.providerDetails.pricing : provider.pricing;
        provider.availability = req.body.providerDetails.availability || provider.availability;
        provider.image = req.body.providerDetails.image !== undefined ? req.body.providerDetails.image : provider.image;
        
        updatedProvider = await provider.save();
      }
    }

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
      },
      provider: updatedProvider,
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error. Profile update failed.', error: error.message });
  }
};
