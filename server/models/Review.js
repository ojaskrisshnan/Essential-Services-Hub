import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  reply: { type: String, default: '' },
  image: { type: String, default: '' } // optional image
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
