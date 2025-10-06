import mongoose from 'mongoose'

const AddressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  { _id: false }
)

const ContactPersonSchema = new mongoose.Schema(
  {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  { _id: false }
)

const ClientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: { type: String, required: true },
    industry: String,
    address: AddressSchema,
    contactPerson: ContactPersonSchema,
    services: [{ type: String, enum: ['digital-marketing', 'web-development', 'app-development', 'seo-services', 'social-media', 'content-creation', 'branding', 'consulting', 'other'] }],
    status: { type: String, enum: ['active', 'inactive', 'prospect'], default: 'active' }
  },
  { timestamps: true }
)

export default mongoose.model('Client', ClientSchema)



