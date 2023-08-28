const mongoose = new require('mongoose');
const validator = new require('validator');
const bcrypt = new require('bcryptjs');

const user_model = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The user model must have the name'],
    },
    saves: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      required: [true, 'The user model must have the name'],
    },
    password: {
      type: String,
      required: [true, 'The user model must have a password'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'User'],
      default: 'User'
    },
    passwordChangedAt: Date,
    // passwordConfirm: {
    //   type: String,
    //   required: [true, 'Please confirm the password'],
    //   validate: {
    //     validator: function(el) {
    //       return el === this.password;
    //     } ,
    //     message: 'Passwords are not the same!'
    //   }
    // }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

user_model.pre('save', async function (next) {
  // Only run if the password is modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // this.passwordConfirm = undefined;
  next();
});

user_model.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
    delete ret.passwordChangedAt;
    // delete ret.passwordConfirm;
  },
});

user_model.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

user_model.methods.changedPasswordAfter = function(JWTTimestamp) {
  if(this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }
  
  return false;
}

const User = mongoose.model('User', user_model);

module.exports = User;
