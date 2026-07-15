import { PrismaClient, LeadStage, ActivityType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Upsert demo user
  const demoUser = await prisma.user.upsert({
    where: { id: 'seed-user-001' },
    update: {},
    create: {
      id: 'seed-user-001',
      email: 'demo@leadflow.com',
      name: 'Demo User',
      passwordHash: await bcrypt.hash('Demo1234!', 12),
    },
  });
  console.log(`✓ Created user: ${demoUser.email}`);

  // 2. Upsert 6 leads with different stages
  const leadsData = [
    {
      id: 'seed-lead-001',
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1-555-0101',
      company: 'TechCorp Inc',
      jobTitle: 'CTO',
      stage: LeadStage.NEW,
      dealValue: 50000,
      notes: 'Interested in enterprise solution',
    },
    {
      id: 'seed-lead-002',
      name: 'Sarah Johnson',
      email: 'sarah.j@innovate.io',
      phone: '+1-555-0102',
      company: 'Innovate Solutions',
      jobTitle: 'VP of Sales',
      stage: LeadStage.NEW,
      dealValue: 75000,
      notes: 'Looking for CRM integration',
    },
    {
      id: 'seed-lead-003',
      name: 'Michael Chen',
      email: 'mchen@startupxyz.com',
      phone: '+1-555-0103',
      company: 'StartupXYZ',
      jobTitle: 'Founder',
      stage: LeadStage.CONTACTED,
      dealValue: 35000,
      notes: 'Had initial call, very interested',
    },
    {
      id: 'seed-lead-004',
      name: 'Emily Rodriguez',
      email: 'e.rodriguez@globaltech.net',
      phone: '+1-555-0104',
      company: 'GlobalTech Systems',
      jobTitle: 'Director of Operations',
      stage: LeadStage.QUALIFIED,
      dealValue: 120000,
      notes: 'Budget approved, discussing requirements',
    },
    {
      id: 'seed-lead-005',
      name: 'David Williams',
      email: 'dwilliams@megacorp.com',
      phone: '+1-555-0105',
      company: 'MegaCorp Industries',
      jobTitle: 'IT Manager',
      stage: LeadStage.PROPOSAL_SENT,
      dealValue: 95000,
      notes: 'Proposal sent on 2024-01-15, awaiting feedback',
    },
    {
      id: 'seed-lead-006',
      name: 'Lisa Anderson',
      email: 'landerson@sucessco.biz',
      phone: '+1-555-0106',
      company: 'SuccessCo',
      jobTitle: 'CEO',
      stage: LeadStage.CLOSED_WON,
      dealValue: 150000,
      notes: 'Contract signed! Implementation starting next month',
    },
  ];

  for (const leadData of leadsData) {
    await prisma.lead.upsert({
      where: { id: leadData.id },
      update: {},
      create: {
        ...leadData,
        userId: demoUser.id,
      },
    });
  }
  console.log(`✓ Created ${leadsData.length} leads`);

  // 3. Create 3 ActivityLog entries for first lead
  const activities = [
    {
      id: 'seed-activity-001',
      leadId: 'seed-lead-001',
      userId: demoUser.id,
      type: ActivityType.CALL,
      content: 'Initial discovery call. Discussed current pain points and timeline.',
    },
    {
      id: 'seed-activity-002',
      leadId: 'seed-lead-001',
      userId: demoUser.id,
      type: ActivityType.EMAIL,
      content: 'Sent follow-up email with product brochure and case studies.',
    },
    {
      id: 'seed-activity-003',
      leadId: 'seed-lead-001',
      userId: demoUser.id,
      type: ActivityType.NOTE,
      content: 'Lead mentioned they are evaluating 3 vendors. Decision expected in 2 weeks.',
    },
  ];

  for (const activity of activities) {
    await prisma.activityLog.upsert({
      where: { id: activity.id },
      update: {},
      create: activity,
    });
  }
  console.log(`✓ Created ${activities.length} activity logs`);

  // 4. Create 2 FollowUpReminders
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(14, 0, 0, 0);

  const reminders = [
    {
      id: 'seed-reminder-001',
      leadId: 'seed-lead-001',
      userId: demoUser.id,
      dueAt: tomorrow,
      note: 'Follow up on proposal discussion',
      isCompleted: false,
      completedAt: null,
    },
    {
      id: 'seed-reminder-002',
      leadId: 'seed-lead-003',
      userId: demoUser.id,
      dueAt: twoDaysAgo,
      note: 'Check in on demo feedback',
      isCompleted: false,
      completedAt: null,
    },
  ];

  for (const reminder of reminders) {
    await prisma.followUpReminder.upsert({
      where: { id: reminder.id },
      update: {},
      create: reminder,
    });
  }
  console.log(`✓ Created ${reminders.length} follow-up reminders`);

  // Log final counts
  const userCount = await prisma.user.count();
  const leadCount = await prisma.lead.count();
  const activityCount = await prisma.activityLog.count();
  const reminderCount = await prisma.followUpReminder.count();

  console.log('\n📊 Database seeding completed:');
  console.log(`   Users: ${userCount}`);
  console.log(`   Leads: ${leadCount}`);
  console.log(`   Activities: ${activityCount}`);
  console.log(`   Reminders: ${reminderCount}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
