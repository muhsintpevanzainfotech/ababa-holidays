const mongoose = require('mongoose');
const Service = require('../models/Service');
const SubService = require('../models/SubService');
const Category = require('../models/Category');
const Counter = require('../models/Counter');
require('dotenv').config();

const resequence = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ababa_travels');
    console.log('Connected to Database...');

    const year = new Date().getFullYear();

    // 1. Resequence Services
    console.log('Resequencing Services...');
    const services = await Service.find().sort({ createdAt: 1 });
    for (let i = 0; i < services.length; i++) {
      const seq = i + 1;
      const seqString = seq.toString().padStart(5, '0');
      services[i].customId = `SER${year}${seqString}`;
      await services[i].save();
    }
    await Counter.findOneAndUpdate({ id: `SER_${year}` }, { seq: services.length }, { upsert: true });

    // 2. Resequence SubServices
    console.log('Resequencing Sub-Services...');
    const subServices = await SubService.find().sort({ createdAt: 1 });
    for (let i = 0; i < subServices.length; i++) {
        const seq = i + 1;
        const seqString = seq.toString().padStart(5, '0');
        subServices[i].customId = `SUB${year}${seqString}`;
        await subServices[i].save();
    }
    await Counter.findOneAndUpdate({ id: `SUB_${year}` }, { seq: subServices.length }, { upsert: true });

    // 3. Resequence Categories
    console.log('Resequencing Categories...');
    const categories = await Category.find().sort({ createdAt: 1 });
    for (let i = 0; i < categories.length; i++) {
        const seq = i + 1;
        const seqString = seq.toString().padStart(5, '0');
        categories[i].customId = `CAT${year}${seqString}`;
        await categories[i].save();
    }
    await Counter.findOneAndUpdate({ id: `CAT_${year}` }, { seq: categories.length }, { upsert: true });

    console.log('All IDs re-sequenced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error re-sequencing:', err);
    process.exit(1);
  }
};

resequence();
