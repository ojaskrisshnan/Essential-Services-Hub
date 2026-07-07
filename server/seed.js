import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Provider from './models/Provider.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';
import Subscription from './models/Subscription.js';
import Payment from './models/Payment.js';
import Review from './models/Review.js';
import Complaint from './models/Complaint.js';
import Notification from './models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/essential_services_hub');
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Provider.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Subscription.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Complaint.deleteMany();
    await Notification.deleteMany();
    console.log('Database cleared.');

    // 1. Create Users
    console.log('Seeding users...');
    const users = await User.create([
      {
        name: 'Admin Master',
        email: 'admin@esh.com',
        password: 'admin123',
        phone: '9876543210',
        role: 'admin',
        address: { street: 'HQ Admin Rd', area: 'Tech Zone', city: 'Metroville', pincode: '560000' }
      },
      {
        name: 'John Doe',
        email: 'customer1@gmail.com',
        password: 'customer123',
        role: 'customer',
        phone: '9876543211',
        address: { street: '123 Main St', area: 'Downtown', city: 'Metroville', pincode: '560001' }
      },
      {
        name: 'Jane Smith',
        email: 'customer2@gmail.com',
        password: 'customer123',
        role: 'customer',
        phone: '9876543212',
        address: { street: '456 Elm St', area: 'Suburbs', city: 'Metroville', pincode: '560002' }
      },
      {
        name: 'Rajesh Kumar',
        email: 'gas@esh.com',
        password: 'provider123',
        role: 'provider',
        phone: '9876543213',
        address: { street: '78 Gas Depot Rd', area: 'Downtown', city: 'Metroville', pincode: '560001' }
      },
      {
        name: 'Amrit Singh',
        email: 'milk@esh.com',
        password: 'provider123',
        role: 'provider',
        phone: '9876543214',
        address: { street: 'Dairy Farms Road', area: 'Downtown', city: 'Metroville', pincode: '560001' }
      },
      {
        name: 'Sam Spark',
        email: 'electric@esh.com',
        password: 'provider123',
        role: 'provider',
        phone: '9876543215',
        address: { street: '5 Sparks Ave', area: 'Suburbs', city: 'Metroville', pincode: '560002' }
      },
      {
        name: 'Tom Plumb',
        email: 'plumb@esh.com',
        password: 'provider123',
        role: 'provider',
        phone: '9876543216',
        address: { street: '12 Pipe Lane', area: 'Suburbs', city: 'Metroville', pincode: '560002' }
      }
    ]);

    const admin = users[0];
    const customer1 = users[1];
    const customer2 = users[2];
    const gasUser = users[3];
    const milkUser = users[4];
    const electricUser = users[5];
    const plumbUser = users[6];

    // 2. Create Providers
    console.log('Seeding providers...');
    const providers = await Provider.create([
      {
        userId: gasUser._id,
        businessName: 'Super LPG Gas Distributors',
        ownerName: gasUser.name,
        category: 'LPG Gas',
        location: 'Downtown',
        pincode: '560001',
        experience: 12,
        pricing: 950,
        availability: ['09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM', '03:00 PM - 06:00 PM'],
        rating: 4.8,
        ratingCount: 1,
        approved: true,
        image: 'https://images.unsplash.com/photo-1585842378988-ae3a3886e1fa?w=400&q=80'
      },
      {
        userId: milkUser._id,
        businessName: 'Amrit Pure Milk & Dairy',
        ownerName: milkUser.name,
        category: 'Milk',
        location: 'Downtown',
        pincode: '560001',
        experience: 8,
        pricing: 58,
        availability: ['06:00 AM - 09:00 AM', '06:00 PM - 08:00 PM'],
        rating: 4.5,
        ratingCount: 1,
        approved: true,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'
      },
      {
        userId: electricUser._id,
        businessName: 'Sparky Professional Electricians',
        ownerName: electricUser.name,
        category: 'Electrician',
        location: 'Suburbs',
        pincode: '560002',
        experience: 5,
        pricing: 400,
        availability: ['10:00 AM - 01:00 PM', '02:00 PM - 05:00 PM', '05:00 PM - 08:00 PM'],
        rating: 4.2,
        ratingCount: 1,
        approved: true,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80'
      },
      {
        userId: plumbUser._id,
        businessName: 'PlumbFast Leaks & Drains',
        ownerName: plumbUser.name,
        category: 'Plumber',
        location: 'Suburbs',
        pincode: '560002',
        experience: 3,
        pricing: 300,
        availability: ['09:00 AM - 12:00 PM', '01:00 PM - 04:00 PM'],
        rating: 5.0,
        ratingCount: 0,
        approved: false, // REQUIRES ADMIN APPROVAL
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80'
      }
    ]);

    // 3. Create Services
    console.log('Seeding services...');
    const services = await Service.create([
      {
        serviceName: '14.2kg LPG Cylinder Refill',
        category: 'LPG Gas',
        description: 'Standard domestic LPG gas cylinder refill delivered to your doorstep.',
        price: 950,
        duration: 30,
        providerId: gasUser._id
      },
      {
        serviceName: 'Fresh Organic Cow Milk 1L',
        category: 'Milk',
        description: 'Pure, organic, unadulterated cow milk delivered early morning.',
        price: 58,
        duration: 15,
        providerId: milkUser._id
      },
      {
        serviceName: 'Full Home Electrical Inspection',
        category: 'Electrician',
        description: 'Thorough inspection of all outlets, wiring, panels, and appliances.',
        price: 400,
        duration: 90,
        providerId: electricUser._id
      },
      {
        serviceName: 'Leak Repair & Tap Installation',
        category: 'Plumber',
        description: 'Fixing leaking pipes, dripping taps, or installing new plumbing fixtures.',
        price: 300,
        duration: 60,
        providerId: plumbUser._id
      }
    ]);

    // 4. Create Reviews
    console.log('Seeding reviews...');
    await Review.create([
      {
        customerId: customer1._id,
        providerId: gasUser._id,
        rating: 5,
        review: 'On-time delivery and polite delivery agent. Highly recommended!',
        reply: 'Thank you for your feedback! We strive to deliver promptly.'
      },
      {
        customerId: customer2._id,
        providerId: milkUser._id,
        rating: 4,
        review: 'Very fresh milk. Delivery is mostly on time, occasional delays of 10 mins.'
      },
      {
        customerId: customer1._id,
        providerId: electricUser._id,
        rating: 4,
        review: 'Resolved my short circuit issue quickly. Fair pricing.',
        reply: 'Glad to help Rajesh! Feel free to call us for any electrical issues.'
      }
    ]);

    // 5. Create Notifications
    console.log('Seeding notifications...');
    await Notification.create([
      {
        userId: customer1._id,
        message: 'Welcome to Essential Services Hub! You can now browse local providers and book services.',
        read: false
      },
      {
        userId: gasUser._id,
        message: 'Welcome Rajesh! Please keep your business details and service list updated.',
        read: true
      }
    ]);

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
