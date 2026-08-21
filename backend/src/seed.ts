import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/User';
import { ProviderProfile } from './models/ProviderProfile';
import { Booking } from './models/Booking';

const SEED_PROVIDERS = [
  {
    name: 'Ravi Kumar',
    email: 'ravi.kumar@vitaran.com',
    password: 'password123',
    role: 'provider' as const,
    profile: {
      category: 'electrician' as const,
      description: 'Expert home electrical repairs, wiring, and appliance installation. 8+ years of field experience.',
      experience: 8,
      location: 'Hyderabad' as const,
      price: 500,
      profileImage: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=60',
    },
  },
  {
    name: 'Anjali Sharma',
    email: 'anjali.sharma@vitaran.com',
    password: 'password123',
    role: 'provider' as const,
    profile: {
      category: 'tutor' as const,
      description: 'Professional high-school math and physics tutor. Focused on concept building and regular tests.',
      experience: 5,
      location: 'Bangalore' as const,
      price: 800,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60',
    },
  },
  {
    name: 'Mohamed Yasin',
    email: 'mohamed.yasin@vitaran.com',
    password: 'password123',
    role: 'provider' as const,
    profile: {
      category: 'plumber' as const,
      description: 'Reliable plumbing services including leak fixes, pipe fittings, and bathroom renovations.',
      experience: 12,
      location: 'Chennai' as const,
      price: 450,
      profileImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=60',
    },
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.m@vitaran.com',
    password: 'password123',
    role: 'provider' as const,
    profile: {
      category: 'photographer' as const,
      description: 'Professional photographer for corporate events, portfolios, and family portrait shoots.',
      experience: 6,
      location: 'Mumbai' as const,
      price: 1500,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    },
  },
  {
    name: 'Karthik Rao',
    email: 'karthik.rao@vitaran.com',
    password: 'password123',
    role: 'provider' as const,
    profile: {
      category: 'ac_technician' as const,
      description: 'AC servicing, installation, and deep chemical cleaning services for residential and office spaces.',
      experience: 7,
      location: 'Hyderabad' as const,
      price: 600,
      profileImage: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=150&auto=format&fit=crop&q=60',
    },
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@vitaran.com',
    password: 'password123',
    role: 'provider' as const,
    profile: {
      category: 'home_cleaning' as const,
      description: 'Full house deep cleaning, kitchen sanitization, and sofa dry cleaning services.',
      experience: 4,
      location: 'Bangalore' as const,
      price: 1200,
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60',
    },
  },
  {
    name: 'David Gomez',
    email: 'david.gomez@vitaran.com',
    password: 'password123',
    role: 'provider' as const,
    profile: {
      category: 'computer_repair' as const,
      description: 'Expert hardware diagnosis, laptop screen replacement, OS installation, and virus cleaning.',
      experience: 9,
      location: 'Chennai' as const,
      price: 700,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    },
  },
];

const SEED_CUSTOMERS = [
  { name: 'John Doe', email: 'customer@vitaran.com', password: 'password123', role: 'customer' as const },
  { name: 'Alice Smith', email: 'alice@vitaran.com', password: 'password123', role: 'customer' as const },
  { name: 'Bob Johnson', email: 'bob@vitaran.com', password: 'password123', role: 'customer' as const },
];

async function seed() {
  try {
    await connectDB();

    console.log('Clearing existing database entries...');
    await User.deleteMany({});
    await ProviderProfile.deleteMany({});
    await Booking.deleteMany({});

    console.log('Seeding Customers...');
    const savedCustomers = [];
    for (const cust of SEED_CUSTOMERS) {
      const u = new User(cust);
      await u.save();
      savedCustomers.push(u);
    }
    console.log(`Successfully seeded ${savedCustomers.length} customers.`);

    console.log('Seeding Providers and Profiles...');
    const savedProviders = [];
    for (const prov of SEED_PROVIDERS) {
      const u = new User({
        name: prov.name,
        email: prov.email,
        password: prov.password,
        role: prov.role,
      });
      await u.save();

      const profile = new ProviderProfile({
        userId: u._id,
        ...prov.profile,
      });
      await profile.save();
      savedProviders.push(u);
    }
    console.log(`Successfully seeded ${savedProviders.length} providers & profiles.`);

    // Seed dummy bookings
    console.log('Seeding Bookings...');
    const customer = savedCustomers[0];
    const provider1 = savedProviders[0]; // Ravi (Electrician, Hyderabad)
    const provider2 = savedProviders[1]; // Anjali (Tutor, Bangalore)

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const booking1 = new Booking({
      customerId: customer._id,
      providerId: provider1._id,
      service: 'Electrician - Wiring Checkup',
      bookingDate: tomorrow,
      preferredTime: '10:00 AM',
      address: 'Plot 42, Hitech City, Hyderabad',
      notes: 'Need a checkup on power sockets',
      status: 'pending',
    });
    await booking1.save();

    const booking2 = new Booking({
      customerId: customer._id,
      providerId: provider2._id,
      service: 'Tutor - Math Session',
      bookingDate: tomorrow,
      preferredTime: '04:00 PM',
      address: 'Block B, Green Glen Layout, Bangalore',
      notes: 'Trigonometry chapter support',
      status: 'accepted',
    });
    await booking2.save();

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
