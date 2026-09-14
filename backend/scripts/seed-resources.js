/**
 * seed-resources.js
 * One-time script to populate the Firestore `resources` collection.
 * Safe to re-run — it updates existing docs instead of duplicating.
 *
 * Run from the backend folder:
 *   node scripts/seed-resources.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { db } = require('../config/firebase-admin');

function extractId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : url;
}

// ─── All resources ───────────────────────────────────────────────────────────

const RESOURCES = [

  // ══ WORKBOOKS (only 3) ════════════════════════════════════════════════════
  {
    type: 'workbook', subject: 'English Kumarbharati', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1ZwKJmAYpb7M2FXfTbxE9YE8skgbvlPD9/view?usp=sharing'),
  },
  {
    type: 'workbook', subject: 'Marathi Aksharbharati', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1yyY6RHeJHLu1h2V_rqwcQuBWBVPX5Hxs/view?usp=sharing'),
  },
  {
    type: 'workbook', subject: 'Hindi Lokbharati', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/191WZYQjxf_ti7CQT7nWcSiTRVuiWg2cC/view?usp=sharing'),
  },

  // ══ JOURNALS ══════════════════════════════════════════════════════════════
  {
    type: 'journal', subject: 'Water Security Journal', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/11O6NhhMsKx3pMF59Y2VNq0-UkbwTAijo/view?usp=sharing'),
  },
  {
    type: 'journal', subject: 'Science Practical Journal', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1smMmKBmY7D4-BSUHB3TshJcBZKr0cmNO/view?usp=sharing'),
  },
  {
    type: 'journal', subject: 'Physical & Health Education', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1ExDq2LQf3GEVSaPXqmdKEebZTsxkSfI6/view?usp=sharing'),
  },
  {
    type: 'journal', subject: 'Maths Practical Journal', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1oNxdxhvOj1i3Zgb1f45BlfSWERCAxXi1/view?usp=sharing'),
  },
  {
    type: 'journal', subject: 'Defence Studies', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/14i1urgepw4khHE2TFfjdpbHYkHifdkrA/view?usp=sharing'),
  },

  // ══ QUESTION PAPERS — 2024 ════════════════════════════════════════════════
  {
    type: 'question_paper', subject: 'English', year: 2024,
    driveFileId: extractId('https://drive.google.com/file/d/14spW4psQjGmfJV4fyeZbm3H1RXzR-9rf/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Maths 1', year: 2024,
    driveFileId: extractId('https://drive.google.com/file/d/1M9U6eBQxKuxZiexRFBTRwD77ehsXCWG-/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Maths 2', year: 2024,
    driveFileId: extractId('https://drive.google.com/file/d/1sG_wzjuZWVy8rO_cO89BtF_JhpHykHfR/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Science 1', year: 2024,
    driveFileId: extractId('https://drive.google.com/file/d/1O2_z7Dhw0kHNlVCJQbYaMwcdl862BF8x/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Science 2', year: 2024,
    driveFileId: extractId('https://drive.google.com/file/d/1giaI5GYRY27LhPch8wGlncmm0oFGHecK/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'History & Political Science', year: 2024,
    driveFileId: extractId('https://drive.google.com/file/d/1atbLetnOQ4e92mi__ub0g5q9nrZkkFqU/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Geography', year: 2024,
    driveFileId: extractId('https://drive.google.com/file/d/1NlVXQutbbnguce5-SBV5w1OEjlKpQc3f/view?usp=sharing'),
  },

  // ══ QUESTION PAPERS — 2025 ════════════════════════════════════════════════
  {
    type: 'question_paper', subject: 'English', year: 2025,
    driveFileId: extractId('https://drive.google.com/file/d/1BKsPb5U46uW6NI15wOUDP0ZpjBHiQuwt/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Maths 1', year: 2025,
    driveFileId: extractId('https://drive.google.com/file/d/1GLKZWzkcB9TAE-iSAbNzz7Jw7sfMXa3G/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Maths 2', year: 2025,
    driveFileId: extractId('https://drive.google.com/file/d/1IuzT6wM5Z5LOt7VC92fYLY0JDpTxFx4t/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Science 1', year: 2025,
    driveFileId: extractId('https://drive.google.com/file/d/1bkjotZaV0h7Q0cuvudM_XfsD6njKuEON/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Science 2', year: 2025,
    driveFileId: extractId('https://drive.google.com/file/d/1pgCQI1Ml4bgRNMETsEFC4EfbQtVQhG3u/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'History & Political Science', year: 2025,
    driveFileId: extractId('https://drive.google.com/file/d/15gjoNmG054b4HPNIikl2qmBjY1YxKpYS/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Geography', year: 2025,
    driveFileId: extractId('https://drive.google.com/file/d/1JMx2lxeNBYtcFDlybjGpjZIUfnt2nNQG/view?usp=sharing'),
  },

  // ══ QUESTION PAPERS — 2026 ════════════════════════════════════════════════
  {
    type: 'question_paper', subject: 'English', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1dog0Ax2A2n1foNWvxz0tj1Eo8T9Ty60z/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Maths 1', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1SUrVeWmU07_-lBZb1-I55Wiv8BPafoYP/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Maths 2', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1_HO8bmMgZk25o0sCz7m_YVx9BS1l5ndP/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Science 1', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1AxfvxMlKFV8cuR6xq3tsnxTzzg-txsco/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Science 2', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1a5yXHeCAGA2CVm_47Gizeb4qgIn8aiBw/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'History & Political Science', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1llW2wqHZK0PXQHOnQJ1xeubXH2k6b-Fo/view?usp=sharing'),
  },
  {
    type: 'question_paper', subject: 'Geography', year: 2026,
    driveFileId: extractId('https://drive.google.com/file/d/1ilv3zY4Bo4H8hl0gmJxMmUOkqaktGVL4/view?usp=sharing'),
  },
];

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seedResources() {
  console.log(`\nSeeding ${RESOURCES.length} resources into Firestore...\n`);

  const col = db.collection('resources');
  let added = 0;
  let updated = 0;

  for (const resource of RESOURCES) {
    const existing = await col
      .where('type',    '==', resource.type)
      .where('subject', '==', resource.subject)
      .where('year',    '==', resource.year)
      .limit(1)
      .get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({ driveFileId: resource.driveFileId });
      console.log(`  UPDATED  [${resource.type}] ${resource.subject} (${resource.year})`);
      updated++;
    } else {
      await col.add(resource);
      console.log(`  ADDED    [${resource.type}] ${resource.subject} (${resource.year})`);
      added++;
    }
  }

  console.log(`\n✅ Done — ${added} added, ${updated} updated.\n`);
  process.exit(0);
}

seedResources().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
