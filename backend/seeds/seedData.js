/**
 * Seed File — populates MongoDB with sample labs, chemicals, users, and transactions
 * Run: node seeds/seedData.js
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lab = require('../models/Lab');
const Chemical = require('../models/Chemical');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chemlab';

const labs = [
  { name: 'Organic Chemistry Lab', code: 'OCL01', type: 'Organic', building: 'Science Block A', floor: '2nd', college: 'Shri GS Institute of Tech & Science Indore', description: 'Primary lab for organic synthesis experiments', capacity: 30 },
  { name: 'Inorganic Chemistry Lab', code: 'ICL01', type: 'Inorganic', building: 'Science Block A', floor: '3rd', college: 'Shri GS Institute of Tech & Science Indore', description: 'Lab for inorganic compound analysis', capacity: 25 },
  { name: 'Physical Chemistry Lab', code: 'PCL01', type: 'Physical', building: 'Science Block B', floor: '1st', college: 'Shri GS Institute of Tech & Science Indore', description: 'Thermodynamics and electrochemistry experiments', capacity: 20 },
  { name: 'Analytical Chemistry Lab', code: 'ACL01', type: 'Analytical', building: 'Science Block B', floor: '2nd', college: 'Shri GS Institute of Tech & Science Indore', description: 'Quantitative and qualitative analysis', capacity: 20 },
];

const chemicals = (labIds) => [
  // Organic Lab chemicals
  { name: 'Ethanol', formula: 'C₂H₅OH', casNumber: '64-17-5', lab: labIds[0], category: 'Solvent', quantity: 2000, unit: 'ml', maxBorrowLimit: 100, lowStockThreshold: 200, totalCapacity: 5000, hazardLevel: 'Medium', hazardSymbols: ['Flammable'], storageConditions: 'Cool, dry place away from ignition sources', supplier: { name: 'SRL Chemicals', contact: 'info@srl.in', catalogNo: 'SRL-ETH-500' } },
  { name: 'Acetone', formula: 'C₃H₆O', casNumber: '67-64-1', lab: labIds[0], category: 'Solvent', quantity: 1500, unit: 'ml', maxBorrowLimit: 50, lowStockThreshold: 150, totalCapacity: 3000, hazardLevel: 'Medium', hazardSymbols: ['Flammable', 'Irritant'], storageConditions: 'Away from heat and flames', supplier: { name: 'Merck India', contact: 'orders@merck.in', catalogNo: 'MRK-ACT-101' } },
  { name: 'Diethyl Ether', formula: 'C₄H₁₀O', casNumber: '60-29-7', lab: labIds[0], category: 'Solvent', quantity: 800, unit: 'ml', maxBorrowLimit: 30, lowStockThreshold: 100, totalCapacity: 2000, hazardLevel: 'High', hazardSymbols: ['Flammable', 'Health Hazard'], storageConditions: 'Refrigerator, away from peroxides', supplier: { name: 'Sigma Aldrich', contact: 'support@sigmaaldrich.com', catalogNo: 'SA-DEE-200' } },
  { name: 'Acetic Acid (Glacial)', formula: 'CH₃COOH', casNumber: '64-19-7', lab: labIds[0], category: 'Acid', quantity: 1200, unit: 'ml', maxBorrowLimit: 50, lowStockThreshold: 100, totalCapacity: 2500, hazardLevel: 'Medium', hazardSymbols: ['Corrosive', 'Flammable'], storageConditions: 'Cool ventilated area', supplier: { name: 'SRL Chemicals', contact: 'info@srl.in', catalogNo: 'SRL-ACA-250' } },
  { name: 'Chloroform', formula: 'CHCl₃', casNumber: '67-66-3', lab: labIds[0], category: 'Solvent', quantity: 500, unit: 'ml', maxBorrowLimit: 20, lowStockThreshold: 50, totalCapacity: 1000, hazardLevel: 'High', hazardSymbols: ['Health Hazard', 'Irritant'], storageConditions: 'Dark bottle, away from light', supplier: { name: 'Merck India', contact: 'orders@merck.in', catalogNo: 'MRK-CHF-100' } },

  // Inorganic Lab chemicals
  { name: 'Hydrochloric Acid (Conc.)', formula: 'HCl', casNumber: '7647-01-0', lab: labIds[1], category: 'Acid', quantity: 1800, unit: 'ml', maxBorrowLimit: 50, lowStockThreshold: 200, totalCapacity: 4000, hazardLevel: 'High', hazardSymbols: ['Corrosive', 'Toxic'], storageConditions: 'Acid cabinet, away from bases', supplier: { name: 'Qualigens', contact: 'sales@qualigens.com', catalogNo: 'QL-HCL-500' } },
  { name: 'Sulphuric Acid (Conc.)', formula: 'H₂SO₄', casNumber: '7664-93-9', lab: labIds[1], category: 'Acid', quantity: 2500, unit: 'ml', maxBorrowLimit: 30, lowStockThreshold: 200, totalCapacity: 5000, hazardLevel: 'Extreme', hazardSymbols: ['Corrosive', 'Oxidizer'], storageConditions: 'Corrosive chemical cabinet', supplier: { name: 'Qualigens', contact: 'sales@qualigens.com', catalogNo: 'QL-H2S-250' } },
  { name: 'Sodium Hydroxide', formula: 'NaOH', casNumber: '1310-73-2', lab: labIds[1], category: 'Base', quantity: 800, unit: 'g', maxBorrowLimit: 50, lowStockThreshold: 80, totalCapacity: 2000, hazardLevel: 'High', hazardSymbols: ['Corrosive'], storageConditions: 'Sealed container, dry place', supplier: { name: 'SRL Chemicals', contact: 'info@srl.in', catalogNo: 'SRL-NAH-500' } },
  { name: 'Potassium Permanganate', formula: 'KMnO₄', casNumber: '7722-64-7', lab: labIds[1], category: 'Reagent', quantity: 350, unit: 'g', maxBorrowLimit: 20, lowStockThreshold: 40, totalCapacity: 500, hazardLevel: 'Medium', hazardSymbols: ['Oxidizer', 'Irritant'], storageConditions: 'Dark bottle, away from organics', supplier: { name: 'Merck India', contact: 'orders@merck.in', catalogNo: 'MRK-KPM-100' } },
  { name: 'Sodium Chloride', formula: 'NaCl', casNumber: '7647-14-5', lab: labIds[1], category: 'Salt', quantity: 2000, unit: 'g', maxBorrowLimit: 100, lowStockThreshold: 200, totalCapacity: 5000, hazardLevel: 'Low', hazardSymbols: [], storageConditions: 'Room temperature, dry', supplier: { name: 'SRL Chemicals', contact: 'info@srl.in', catalogNo: 'SRL-NCL-1K' } },
  { name: 'Copper Sulphate', formula: 'CuSO₄·5H₂O', casNumber: '7758-99-8', lab: labIds[1], category: 'Salt', quantity: 500, unit: 'g', maxBorrowLimit: 50, lowStockThreshold: 50, totalCapacity: 1000, hazardLevel: 'Medium', hazardSymbols: ['Irritant', 'Environmental Hazard'], storageConditions: 'Cool dry place', supplier: { name: 'Qualigens', contact: 'sales@qualigens.com', catalogNo: 'QL-CUS-250' } },

  // Physical Chemistry Lab
  { name: 'Phenolphthalein Indicator', formula: 'C₂₀H₁₄O₄', casNumber: '77-09-8', lab: labIds[2], category: 'Indicator', quantity: 200, unit: 'ml', maxBorrowLimit: 20, lowStockThreshold: 20, totalCapacity: 500, hazardLevel: 'Low', hazardSymbols: ['Irritant'], storageConditions: 'Dark bottle at room temperature', supplier: { name: 'SRL Chemicals', contact: 'info@srl.in', catalogNo: 'SRL-PHN-100' } },
  { name: 'Methyl Orange Indicator', formula: 'C₁₄H₁₄N₃NaO₃S', casNumber: '547-58-0', lab: labIds[2], category: 'Indicator', quantity: 180, unit: 'ml', maxBorrowLimit: 20, lowStockThreshold: 20, totalCapacity: 400, hazardLevel: 'Low', hazardSymbols: ['Irritant'], storageConditions: 'Room temperature, dark bottle', supplier: { name: 'Merck India', contact: 'orders@merck.in', catalogNo: 'MRK-MTO-50' } },
  { name: 'Distilled Water', formula: 'H₂O', casNumber: '7732-18-5', lab: labIds[2], category: 'Solvent', quantity: 10000, unit: 'ml', maxBorrowLimit: 500, lowStockThreshold: 1000, totalCapacity: 20000, hazardLevel: 'Low', hazardSymbols: [], storageConditions: 'Room temperature', supplier: { name: 'In-house', contact: '', catalogNo: '' } },

  // Analytical Lab
  { name: 'Silver Nitrate', formula: 'AgNO₃', casNumber: '7761-88-8', lab: labIds[3], category: 'Reagent', quantity: 100, unit: 'g', maxBorrowLimit: 10, lowStockThreshold: 15, totalCapacity: 250, hazardLevel: 'High', hazardSymbols: ['Oxidizer', 'Corrosive'], storageConditions: 'Dark container away from light', supplier: { name: 'Sigma Aldrich', contact: 'support@sigmaaldrich.com', catalogNo: 'SA-AGN-25' } },
  { name: 'EDTA (Disodium Salt)', formula: 'C₁₀H₁₄N₂Na₂O₈', casNumber: '6381-92-6', lab: labIds[3], category: 'Reagent', quantity: 300, unit: 'g', maxBorrowLimit: 25, lowStockThreshold: 30, totalCapacity: 500, hazardLevel: 'Low', hazardSymbols: ['Irritant'], storageConditions: 'Dry place at room temperature', supplier: { name: 'SRL Chemicals', contact: 'info@srl.in', catalogNo: 'SRL-EDTA-500' } },
  { name: 'Potassium Dichromate', formula: 'K₂Cr₂O₇', casNumber: '7778-50-9', lab: labIds[3], category: 'Reagent', quantity: 80, unit: 'g', maxBorrowLimit: 10, lowStockThreshold: 20, totalCapacity: 250, hazardLevel: 'Extreme', hazardSymbols: ['Toxic', 'Oxidizer', 'Health Hazard'], storageConditions: 'Oxidizer cabinet', supplier: { name: 'Merck India', contact: 'orders@merck.in', catalogNo: 'MRK-KDC-100' } },
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Lab.deleteMany({}),
      Chemical.deleteMany({}),
      Transaction.deleteMany({})
    ]);

    // Seed labs
    console.log('🏗️  Seeding labs...');
    const createdLabs = await Lab.insertMany(labs);
    const labIds = createdLabs.map(l => l._id);

    // Seed chemicals
    console.log('⚗️  Seeding chemicals...');
    const chemData = chemicals(labIds);
    const createdChemicals = await Chemical.insertMany(chemData);

    // Seed users
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = await User.insertMany([
      { name: 'Super Admin', email: 'superadmin@chemlab.com', password: hashedPassword, role: 'superadmin', department: 'Administration', college: 'Shri GS Institute of Tech & Science Indore' },
      { name: 'Arpit Kala', email: 'admin@chemlab.com', password: hashedPassword, role: 'admin', department: 'Chemistry', college: 'Shri GS Institute of Tech & Science Indore', managedLabs: labIds },
      { name: 'Prof. Rakesh Gupta', email: 'admin2@chemlab.com', password: hashedPassword, role: 'admin', department: 'Chemistry', college: 'Shri GS Institute of Tech & Science Indore', managedLabs: [labIds[0], labIds[1]] },
      { name: 'Arjun Patel', email: 'student1@chemlab.com', password: hashedPassword, role: 'user', studentId: 'CSC2024001', department: 'B.Sc Chemistry', college: 'Shri GS Institute of Tech & Science Indore', phone: '9876543210' },
      { name: 'Kavya Nair', email: 'student2@chemlab.com', password: hashedPassword, role: 'user', studentId: 'CSC2024002', department: 'B.Sc Chemistry', college: 'Shri GS Institute of Tech & Science Indore', phone: '9876543211' },
      { name: 'Rohit Verma', email: 'student3@chemlab.com', password: hashedPassword, role: 'user', studentId: 'CSC2024003', department: 'M.Sc Organic Chemistry', college: 'Shri GS Institute of Tech & Science Indore', phone: '9876543212' },
      { name: 'Sneha Reddy', email: 'student4@chemlab.com', password: hashedPassword, role: 'user', studentId: 'CSC2024004', department: 'M.Sc Analytical Chemistry', college: 'Shri GS Institute of Tech & Science Indore', phone: '9876543213' },
      { name: 'Vikram Singh', email: 'student5@chemlab.com', password: hashedPassword, role: 'user', studentId: 'CSC2024005', department: 'B.Sc Chemistry', college: 'Shri GS Institute of Tech & Science Indore', phone: '9876543214' },
    ]);

    const studentUsers = users.filter(u => u.role === 'user');

    // Seed sample transactions
    console.log('📋 Seeding transactions...');
    const transactions = [];
    const now = new Date();

    // Generate 60 days of transaction history
    for (let day = 60; day >= 0; day--) {
      const txDate = new Date(now - day * 24 * 60 * 60 * 1000);
      const numTx = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < numTx; i++) {
        const user = studentUsers[Math.floor(Math.random() * studentUsers.length)];
        const chem = createdChemicals[Math.floor(Math.random() * createdChemicals.length)];
        const qty = Math.min(
          Math.max(1, Math.floor(Math.random() * chem.maxBorrowLimit * 0.5)),
          chem.maxBorrowLimit
        );

        transactions.push({
          user: user._id,
          chemical: chem._id,
          lab: chem.lab,
          type: 'borrow',
          quantity: qty,
          unit: chem.unit,
          status: day > 5 ? 'returned' : 'approved',
          purpose: ['Titration experiment', 'Organic synthesis', 'Qualitative analysis', 'Lab practicals', 'Research project'][Math.floor(Math.random() * 5)],
          createdAt: txDate,
          updatedAt: txDate,
          quantityBefore: chem.quantity + qty,
          quantityAfter: chem.quantity
        });
      }
    }

    await Transaction.insertMany(transactions);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Super Admin:  superadmin@chemlab.com / password123');
    console.log('Admin:        admin@chemlab.com       / password123');
    console.log('Student:      student1@chemlab.com    / password123');
    console.log('─────────────────────────────────────────');
    console.log(`\n📊 Seeded: ${createdLabs.length} labs, ${createdChemicals.length} chemicals, ${users.length} users, ${transactions.length} transactions`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
