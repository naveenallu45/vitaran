const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Define connection URI (falling back to memory server port if standard mongo is down)
const mongoURI = 'mongodb://127.0.0.1:27017/vitaran';
const JWT_SECRET = 'your-super-secure-jwt-secret-key-that-is-at-least-32-characters-long';

async function testCancel() {
  console.log('Connecting to database...');
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected.');
    
    // Find customer
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String,
      name: String
    }));
    
    const customer = await User.findOne({ email: 'customer@vitaran.com' });
    if (!customer) {
      console.error('Customer user not found. Database might be empty or using memory server.');
      process.exit(1);
    }
    console.log('Found Customer:', customer.name, customer._id);
    
    // Find active or pending booking for this customer
    const Booking = mongoose.model('Booking', new mongoose.Schema({
      customerId: mongoose.Schema.Types.ObjectId,
      providerId: mongoose.Schema.Types.ObjectId,
      service: String,
      status: String
    }));
    
    const booking = await Booking.findOne({ customerId: customer._id });
    if (!booking) {
      console.error('No bookings found for customer.');
      process.exit(1);
    }
    console.log('Found Booking:', booking.service, 'ID:', booking._id, 'Status:', booking.status);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id.toString(), email: customer.email, role: customer.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Generated JWT Token:', token);

    // Call DELETE API via node-fetch/fetch
    const url = `http://localhost:5001/api/bookings/${booking._id}`;
    console.log(`Sending DELETE request to ${url}...`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response Status:', res.status);
    const json = await res.json();
    console.log('Response Body:', JSON.stringify(json, null, 2));

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

testCancel();
