import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'LPG Gas', 'Milk', 'Water Can', 'Laundry', 'Ironing', 
      'Electrician', 'Plumber', 'Carpenter', 'AC Repair', 
      'House Cleaning', 'Pest Control', 'Grocery', 'Medicine', 'Local Home Services'
    ] 
  },
  location: { type: String, required: true },
  pincode: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 5.0 },
  ratingCount: { type: Number, default: 0 },
  availability: { type: [String], default: [] }, // e.g. ['08:00 AM - 11:00 AM', '11:00 AM - 02:00 PM', '02:00 PM - 05:00 PM', '05:00 PM - 08:00 PM']
  pricing: { type: Number, required: true }, // General starting rate
  approved: { type: Boolean, default: false },
  image: { type: String, default: '' } // Base64 or placeholder URL
}, {
  timestamps: true
});

const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
