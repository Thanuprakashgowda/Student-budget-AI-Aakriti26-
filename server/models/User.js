const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  college: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    default: ''   // initials-based avatar on frontend
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls if user doesn't provide phone
    trim: true,
    match: [/^(whatsapp:\+?)?[0-9()\-\s]{7,20}$/, 'Please enter a valid phone number']
  },
  budgets: {
    type: Map,
    of: Number,
    default: {}
  },
  totalMonthlyBudget: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Don't return password in JSON
userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.password;
    return obj;
  }
});

module.exports = mongoose.model('User', userSchema);
