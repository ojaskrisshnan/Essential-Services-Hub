import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  frequency: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Monthly'], 
    required: true 
  },
  startDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Active', 'Paused', 'Cancelled'], 
    default: 'Active' 
  }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
