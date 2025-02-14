import { Schema, model } from "mongoose";

const typePembayaranSchema = new Schema({
  jenis_pembayaran: { type: Number, required: true },
  nama_pembayaran: { type: Number, required: true },
  keterangan: { type: String, default: null },
});

export const typePembayaranModels = model("typePembayaran", typePembayaranSchema, "typePembayaran");
