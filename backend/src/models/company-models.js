import { Schema, model } from 'mongoose';

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  // store_name: {
  //   type: String,
  //   required: true,
  // },
  address: {
    type: String,
    required: true,
  },
  id_type: { 
    type: Schema.Types.ObjectId, 
    ref: 'Type', required: true 
  },
  status: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});


export const CompanyModels = model("company", CompanySchema, "company");
