// Model for category_product
defineCategoryProductSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const CategoryProductSchema = new mongoose.Schema({
      name_category: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('CategoryProduct', CategoryProductSchema);
  };
  
  // Model for company
  defineCompanySchema = () => { // Done
    const mongoose = require('mongoose');
  
    const CompanySchema = new mongoose.Schema({
      name: { type: String, required: true },
      address: { type: String, default: null },
      id_type: { type: Number, default: null },
      status: { type: Number, default: null },
    });
  
    return mongoose.model('Company', CompanySchema);
  };
  
  // Model for extras
  defineExtrasSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const ExtrasSchema = new mongoose.Schema({
      id_product: { type: Number, required: true },
      name: { type: String, required: true },
      deskripsi: { type: String, default: null },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('Extras', ExtrasSchema);
  };
  
  // Model for extras_detail
  defineExtrasDetailSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const ExtrasDetailSchema = new mongoose.Schema({
      id_extras: { type: Number, required: true },
      name: { type: String, required: true },
      deskripsi: { type: String, default: null },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('ExtrasDetail', ExtrasDetailSchema);
  };
  
  // Model for file_metadata
  defineFileMetadataSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const FileMetadataSchema = new mongoose.Schema({
      bucketName: { type: String, required: true },
      objectName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      id_user: { type: Number, required: true },
      shortenedUrl: { type: String, default: null },
      shortkey: { type: String, default: null },
      createdAt: { type: Date, default: Date.now },
    });
  
    return mongoose.model('FileMetadata', FileMetadataSchema);
  };
  
  // Model for item_campaign
  defineItemCampaignSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const ItemCampaignSchema = new mongoose.Schema({
      id_company: { type: Number, required: true },
      id_store: { type: Number, required: true },
      id_user: { type: Number, required: true },
      item_campaign_name: { type: String, required: true },
      rules: { type: String, default: null },
      value: { type: Number, default: null },
      start_date: { type: Date, default: null },
      end_date: { type: Date, default: null },
      status: { type: Number, required: true },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('ItemCampaign', ItemCampaignSchema);
  };
  
  // Model for order_cust
  defineOrderCustSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const OrderCustSchema = new mongoose.Schema({
      no: { type: Number, required: true },
      code: { type: String, required: true },
      person_name: { type: String, required: true },
      status: { type: Number, required: true },
      id_table_cust: { type: Number, required: true },
      keterangan: { type: Number, required: true },
      total_price: { type: Number, required: true },
      id_store: { type: Number, required: true },
      id_company: { type: Number, required: true },
      id_user: { type: Number, required: true },
      total_quantity: { type: Number, required: true },
      total_discount: { type: Number, required: true },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('OrderCust', OrderCustSchema);
  };
  
  // Model for order_cust_detail
  defineOrderCustDetailSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const OrderCustDetailSchema = new mongoose.Schema({
      id_product: { type: Number, required: true },
      name_product: { type: String, required: true },
      quantity: { type: Number, required: true },
      price_item: { type: Number, required: true },
      total_price: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      id_order_cust: { type: Number, required: true },
      id_store: { type: Number, required: true },
      id_company: { type: Number, required: true },
      id_user: { type: Number, required: true },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('OrderCustDetail', OrderCustDetailSchema);
  };
  
  // Model for payment_name
  definePaymentNameSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const PaymentNameSchema = new mongoose.Schema({
      id_payment_type: { type: Number, required: true },
      payment_name: { type: String, required: true },
      payment_desc: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('PaymentName', PaymentNameSchema);
  };
  
  // Model for payment_type
  definePaymentTypeSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const PaymentTypeSchema = new mongoose.Schema({
      payment_method: { type: String, required: true },
      keterangan: { type: String, default: null },
    });
  
    return mongoose.model('PaymentType', PaymentTypeSchema);
  };
  
  // Model for product
  defineProductSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const ProductSchema = new mongoose.Schema({
      name_product: { type: String, required: true },
      id_category_product: { type: Number, required: true },
      stock: { type: Number, default: 0 },
      sell_price: { type: Number, required: true },
      image: { type: String, required: true },
      buy_price: { type: Number, required: true },
      product_code: { type: String, default: null },
      barcode: { type: String, default: null },
      deskripsi: { type: String, default: null },
      status: { type: Number, required: true },
      id_company: { type: Number, required: true },
      id_store: { type: Number, required: true },
      id_item_campaign: { type: Number, required: true },
      id_extras: { type: Number, required: true },
      id_size: { type: Number, required: true },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('Product', ProductSchema);
  };
  
  // Model for sales
  defineSalesSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const SalesSchema = new mongoose.Schema({
      no: { type: String, required: true },
      id_user: { type: Number, required: true },
      id_store: { type: Number, required: true },
      id_company: { type: Number, required: true },
      id_order: { type: Number, required: true },
      id_sales_campaign: { type: Number, required: true },
      id_payment_type: { type: Number, required: true },
      tax: { type: Number, required: true },
      total_price: { type: Number, required: true },
      total_discount: { type: Number, required: true },
      total_quantity: { type: Number, required: true },
      total_number_item: { type: Number, required: true },
      status: { type: Number, required: true },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('Sales', SalesSchema);
  };
  
  // Model for sales_campaign
  defineSalesCampaignSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const SalesCampaignSchema = new mongoose.Schema({
      campaign_name: { type: String, required: true },
      rules: { type: String, default: null },
      start_date: { type: Date, default: null },
      end_date: { type: Date, default: null },
      id_store: { type: Number, required: true },
      id_company: { type: Number, required: true },
      id_user: { type: Number, required: true },
      value: { type: Number, default: null },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('SalesCampaign', SalesCampaignSchema);
  };

  // Model for sales_detail
  defineSalesDetailSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const SalesDetailSchema = new mongoose.Schema({
      id_sales: { type: Number, required: true },
      id_product: { type: Number, required: true },
      id_store: { type: Number, required: true },
      id_company: { type: Number, required: true },
      id_user: { type: Number, required: true },
      id_item_campaign: { type: Number, required: true },
      product_code: { type: String, required: false },
      name_product: { type: String, required: true },
      item_price: { type: Number, default: null },
      item_quantity: { type: Number, default: null },
      item_discount: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('SalesDetail', SalesDetailSchema);
  };
  
  // Model for size
  defineSizeSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const SizeSchema = new mongoose.Schema({
      id_product: { type: Number, required: true },
      name: { type: String, required: true },
      deskripsi: { type: String, default: null },
      created_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('Size', SizeSchema);
  };
  
  // Model for size_detail
  defineSizeDetailSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const SizeDetailSchema = new mongoose.Schema({
      id_size: { type: Number, required: true },
      name: { type: String, required: true },
      deskripsi: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
      id_extras: { type: Number, default: 0 },
    });
  
    return mongoose.model('SizeDetail', SizeDetailSchema);
  };
  
  // Model for store
  defineStoreSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const StoreSchema = new mongoose.Schema({
      name: { type: String, required: true },
      address: { type: String, required: true },
      status: { type: Number, required: true },
      id_company: { type: Number, required: true },
      create_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('Store', StoreSchema);
  };
  
  // Model for table_cust
  defineTableCustSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const TableCustSchema = new mongoose.Schema({
      name: { type: String, required: true },
      no: { type: Number, required: true },
      create_at: { type: Date, default: Date.now },
    });
  
    return mongoose.model('TableCust', TableCustSchema);
  };
  
  // Model for type
  defineTypeSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const TypeSchema = new mongoose.Schema({
      type: { type: String, required: true },
    });
  
    return mongoose.model('Type', TypeSchema);
  };  

  // Model for type_pembayaran
  defineTypePembayaranSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const TypePembayaranSchema = new mongoose.Schema({
      jenis_pembayaran: { type: Number, required: true },
      nama_pembayaran: { type: Number, required: true },
      keterangan: { type: String, default: null },
    });
  
    return mongoose.model('TypePembayaran', TypePembayaranSchema);
  };  

  // Model for users
defineUserSchema = () => { // Done
    const mongoose = require('mongoose');
  
    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true },
      rule: { type: String, required: true},
      id_company: { type: Number, required: true},
      id_store: { type: Number, required: true},
      status: { type: Number, required: true},
      created_at: { type: Date, default: Date.now},
    });
  
    return mongoose.model('User', UserSchema);
  };

  module.exports = {
    CategoryProduct: defineCategoryProductSchema(),
    Company: defineCompanySchema(),
    Extras: defineExtrasSchema(),
    ExtrasDetail: defineExtrasDetailSchema(),
    FileMetadata: defineFileMetadataSchema(),
    ItemCampaign: defineItemCampaignSchema(),
    OrderCust: defineOrderCustSchema(),
    OrderCustDetail: defineOrderCustDetailSchema(),
    PaymentName: definePaymentNameSchema(),
    PaymentType: definePaymentTypeSchema(),
    Product: defineProductSchema(),
    Sales: defineSalesSchema(),
    SalesCampaign: defineSalesCampaignSchema(),
    SalesDetail: defineSalesDetailSchema(),
    Size: defineSizeSchema(),
    SizeDetail: defineSizeDetailSchema(),
    Store: defineStoreSchema(),
    TableCust: defineTableCustSchema(),
    Type: defineTypeSchema(),
    TypePembayaran: defineTypePembayaranSchema(),
    User: defineUserSchema(),
  };