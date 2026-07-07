import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  bookingDate: { type: Date, required: true },
  slot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Requested', 'Accepted', 'Assigned', 'Out for Delivery', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Requested' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'Cash on Delivery'],
    default: 'Cash on Delivery'
  },
  address: {
    street: String,
    area: String,
    city: String,
    pincode: String
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
