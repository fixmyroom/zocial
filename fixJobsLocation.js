const admin = require("firebase-admin");

// Replace with your service account JSON file path:
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixJobsLocations() {
  const jobsRef = db.collection("jobs");
  const usersRef = db.collection("users");

  const jobsSnapshot = await jobsRef.get();
  console.log(`Total jobs found: ${jobsSnapshot.size}`);

  let updatedCount = 0;

  for (const jobDoc of jobsSnapshot.docs) {
    const job = jobDoc.data();

    // Check if job.location is valid
    if (job.location && typeof job.location.lat === "number" && typeof job.location.lng === "number") {
      continue; // Already has location, skip
    }

    if (!job.customerId) {
      console.log(`Job ${jobDoc.id} has no customerId, skipping.`);
      continue;
    }

    // Fetch customer user doc
    const userDoc = await usersRef.doc(job.customerId).get();
    if (!userDoc.exists) {
      console.log(`Customer ${job.customerId} not found for job ${jobDoc.id}, skipping.`);
      continue;
    }

    const user = userDoc.data();
    if (!user.location || typeof user.location.lat !== "number" || typeof user.location.lng !== "number") {
      console.log(`Customer ${job.customerId} has no valid location for job ${jobDoc.id}, skipping.`);
      continue;
    }

    // Update job with customer location
    try {
      await jobsRef.doc(jobDoc.id).update({
        location: {
          lat: user.location.lat,
          lng: user.location.lng,
        }
      });
      console.log(`Updated job ${jobDoc.id} with customer location.`);
      updatedCount++;
    } catch (error) {
      console.error(`Failed to update job ${jobDoc.id}:`, error);
    }
  }

  console.log(`Done. Updated ${updatedCount} jobs.`);
}

fixJobsLocations().catch(console.error);
