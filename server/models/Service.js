import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  duration: { type: Number, default: 60 }, // in minutes
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
