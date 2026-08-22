/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Supabase PostgreSQL & Prisma Client Data Layer
   ========================================================================== */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Creates a new Family Health Card in Supabase PostgreSQL
 */
async function createHealthCard(data) {
  try {
    const newCard = await prisma.healthCard.create({
      data: {
        cardId: data.cardId,
        headName: data.name,
        phone: data.phone,
        aadhaar: data.aadhaar || null,
        city: data.city,
        members: data.members || [],
        discount: data.discount || "२०% ओपीडी सवलत, २५% लॅब टेस्ट सवलत",
        status: data.status || "सक्रिय (ACTIVE)",
        validTill: data.validTill || "31 मार्च 2027"
      }
    });
    return { success: true, card: newCard };
  } catch (error) {
    console.error('Error creating health card in Supabase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifies a Family Health Card from Supabase PostgreSQL by Card Registration ID
 */
async function getHealthCardById(cardId) {
  try {
    const card = await prisma.healthCard.findUnique({
      where: { cardId: cardId }
    });
    return { success: true, card: card };
  } catch (error) {
    console.error('Error retrieving health card from Supabase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Saves a registered patient to Supabase PostgreSQL Database (No delete, only create & edit)
 */
async function createPatient(data) {
  try {
    const patient = await prisma.patient.create({
      data: {
        regId: data.regId,
        name: data.name,
        gender: data.gender,
        age: data.age,
        phone: data.phone,
        emergencyPhone: data.emergencyPhone || null,
        bloodGroup: data.bloodGroup || null,
        aadhaar: data.aadhaar,
        pan: data.pan || null,
        city: data.city,
        pincode: data.pincode || null,
        address: data.address,
        notes: data.notes || null,
        status: data.status || "सक्रिय (ACTIVE)",
        aadhaarPhoto: data.aadhaarPhoto || null,
        panPhoto: data.panPhoto || null
      }
    });
    return { success: true, patient: patient };
  } catch (error) {
    console.error('Error creating patient in Supabase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates an existing patient record in Supabase PostgreSQL Database
 */
async function updatePatient(regId, data) {
  try {
    const updated = await prisma.patient.update({
      where: { regId: regId },
      data: {
        name: data.name,
        gender: data.gender,
        age: data.age,
        phone: data.phone,
        emergencyPhone: data.emergencyPhone,
        bloodGroup: data.bloodGroup,
        aadhaar: data.aadhaar,
        pan: data.pan,
        city: data.city,
        pincode: data.pincode,
        address: data.address,
        notes: data.notes,
        aadhaarPhoto: data.aadhaarPhoto,
        panPhoto: data.panPhoto
      }
    });
    return { success: true, patient: updated };
  } catch (error) {
    console.error('Error updating patient in Supabase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Saves a contact form submission to Supabase PostgreSQL
 */
async function submitContactMessage(data) {
  try {
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        phone: data.phone,
        message: data.message
      }
    });
    return { success: true, submission: submission };
  } catch (error) {
    console.error('Error submitting contact message to Supabase:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  prisma,
  createHealthCard,
  getHealthCardById,
  createPatient,
  updatePatient,
  submitContactMessage
};
